# POS Data Layer Spec

## Purpose

This document describes the current data layer of the restaurant POS and defines an analytics-ready event model derived from the existing implementation.

The goal is to prepare a future analytics layer without changing the core POS behavior.

## Scope and Constraints

- This spec only uses data and flows that exist in the current codebase.
- No external systems are assumed.
- No Kafka, event bus, microservices, or external analytics pipeline is assumed.
- Events marked as `inferred event` are not persisted today, but can be derived from current routes, services, database mutations, or print/kitchen flows.
- `OrderItem` is treated as the historical source of truth for item-level analytics because it stores snapshot data.

## Authoritative Data Model

### Prisma Models

Source: `prisma/schema.prisma`

#### Order

Relevant fields:

- `id`
- `tableId`
- `status`: `OPEN`, `PAID`, `CANCELED`
- `createdAt`
- `updatedAt`
- `lastSentAt`
- `items`
- `tickets`

Analytics role:

- Represents the lifecycle container for a table order.
- Provides order-level timestamps via `createdAt`, `updatedAt`, and `lastSentAt`.
- Does not currently persist a monetary `total` field.

#### OrderItem

Relevant fields:

- `id`
- `orderId`
- `productId`
- `quantity`
- `unitPrice`
- `displayName`
- `status`: `PENDING`, `SENT`, `IN_PROGRESS`, `DONE`
- `station`: `KITCHEN`, `BAR`
- `variantName`
- `variantPrice`
- `customName`
- `customPrice`
- `ticketId`
- `sentAt`
- `notes`
- `type`: `PRODUCT`, `CUSTOM`

Analytics role:

- Historical item snapshot.
- Does not depend on `Product` after creation.
- Revenue and item metrics must be calculated from `quantity * unitPrice`.

#### KitchenTicket

Relevant fields:

- `id`
- `orderId`
- `createdAt`
- `items`

Analytics role:

- Represents a kitchen/bar send batch created by `createKitchenTickets`.
- Provides a timestamp for grouped station sends.

#### Product

Relevant fields:

- `id`
- `name`
- `price`
- `categoryId`
- `station`
- `isCombo`
- `variants`

Analytics role:

- Catalog reference only at item creation time.
- Should not be used to reconstruct historical item prices or names.

## Snapshot Rule

The current POS freezes product data into `OrderItem` when an item enters the order flow.

Observed flow:

1. A `Product` is selected in the frontend menu.
2. Frontend store creates a pending item.
3. `unitPrice` is calculated from variant price or product price.
4. `displayName` is derived from product name and variant display.
5. The backend receives normalized item payload.
6. `OrderItem` is persisted with snapshot fields.
7. Kitchen, printer, checkout, and totals read from the `OrderItem` snapshot.

Key implementation points:

- Frontend mapping: `app/stores/orderStore.ts`, `mapPendingToApi`
- Order creation: `server/services/order.service.ts`, `createOrder`
- Item add/merge: `server/services/orderItem.service.ts`, `addItemsToOrder`
- Totals: `app/hooks/useOrderTotals.ts`
- Checkout display: `app/components/modals/CheckoutModal.tsx`
- Printer normalization: `print-server/index.ts`, `normalizeItem`

## Line Identity and Merge Rule

Current merge logic lives in `server/services/orderItem.service.ts`.

When adding items to an existing order, an incoming item merges into an existing line if these fields match:

- `orderId`
- `productId`
- `displayName`
- `unitPrice`
- `variantName`
- `station`
- `type`
- `status = PENDING`

If a match exists:

- Existing `quantity` is incremented.
- `notes` may be updated from the incoming item.

If no match exists:

- A new `OrderItem` snapshot row is created.

Analytics implication:

- A single `OrderItem` row may represent multiple add actions because merges increase `quantity` instead of storing separate rows.
- Without a persistent event log, the original number of add actions cannot be reconstructed after merge.

## Existing Backend Systems

### Order Service

Files:

- `server/services/order.service.ts`
- `app/api/orders/route.ts`
- `app/api/orders/[id]/route.ts`
- `app/api/orders/[id]/checkout/route.ts`
- `app/api/orders/close/route.ts`

Responsibilities:

- Create orders.
- Persist snapshot items on initial order creation.
- Mark orders as `PAID`.
- Fetch order with table and items.

### OrderItem Service

Files:

- `server/services/orderItem.service.ts`
- `app/api/orders/[id]/items/route.ts`
- `app/api/orders/items/[id]/notes/route.ts`

Responsibilities:

- Add items to existing orders.
- Merge matching pending items.
- Create new snapshot item rows when no merge is possible.
- Update notes.
- Split one unit into a new row when applying notes to an item with `quantity > 1`.

### Kitchen Services

Files:

- `server/services/kitchenTicket.service.ts`
- `server/services/kitchenFlow.service.ts`
- `server/events/kitchen.events.ts`
- `app/api/orders/[id]/send/route.ts`
- `app/api/kitchen/items/[id]/route.ts`
- `app/api/orders/[id]/ready/route.ts`
- `app/api/kitchen/route.ts`

Responsibilities:

- Create kitchen tickets from pending items.
- Group pending items by station.
- Set sent items to `SENT`.
- Assign `sentAt` and `ticketId`.
- Update kitchen item state to `IN_PROGRESS`, `DONE`, or back to `SENT`.
- Emit in-memory SSE-style events: `item.updated`, `order.updated`.

### Printer Service

Files:

- `app/api/orders/[id]/send/route.ts`
- `print-server/index.ts`

Responsibilities:

- Receive print events from Next.js through `POST http://localhost:4000/emit`.
- Normalize print items from snapshot fields only.
- Queue kitchen, bar, kitchen-and-bar, and receipt print jobs.

Observed print event names:

- `PRINT_KITCHEN`
- `PRINT_BAR`
- `PRINT_KITCHEN_AND_BAR`
- `PRINT_RECEIPT`

### Checkout UI and Totals

Files:

- `app/components/modals/CheckoutModal.tsx`
- `app/hooks/useOrderTotals.ts`
- `app/stores/orderStore.ts`

Responsibilities:

- Display grouped snapshot items.
- Calculate totals from `unitPrice * quantity`.
- Call checkout route to close the order.

## Event Inference Layer

The following events are inferable from the current implementation.

### `order_created`

Type: `inferred event`

Source:

- Backend service

Trigger point:

- `app/api/orders/route.ts`, `POST /api/orders`
- `server/services/order.service.ts`, `createOrder`

Trigger condition:

- New `Order` row is created with `status = OPEN`.
- Initial `OrderItem` rows are created from request payload.

Available payload:

- `order.id`
- `order.tableId`
- `order.status`
- `order.createdAt`
- `order.updatedAt`
- Initial item snapshots:
  - `OrderItem.id`
  - `OrderItem.orderId`
  - `OrderItem.productId`
  - `OrderItem.quantity`
  - `OrderItem.unitPrice`
  - `OrderItem.displayName`
  - `OrderItem.variantName`
  - `OrderItem.station`
  - `OrderItem.status`
  - `OrderItem.notes`
  - `OrderItem.type`

Constraints:

- No staff/user identifier is recorded.
- No client device/session identifier is recorded.
- No explicit event row is persisted.
- The route returns the created order, but analytics would need instrumentation to persist the event.

### `item_added_to_order`

Type: `inferred event`

Source:

- Frontend store and backend service

Trigger point:

- `app/stores/orderStore.ts`, `confirmAddToOrder`
- `app/api/orders/[id]/items/route.ts`, `POST /api/orders/:id/items`
- `server/services/orderItem.service.ts`, `addItemsToOrder`

Trigger condition:

- Incoming item does not match an existing pending line and a new `OrderItem` row is created.

Available payload:

- `orderId`
- New `OrderItem.id`
- `productId`
- `quantity`
- `unitPrice`
- `displayName`
- `station`
- `variantName`
- `notes`
- `type`
- `status = PENDING`

Constraints:

- No item-level `createdAt` exists on `OrderItem`.
- The exact add timestamp is not persisted.
- No actor is stored.
- The service currently does not return created item IDs from `addItemsToOrder`.

### `item_merged`

Type: `inferred event`

Source:

- Backend service

Trigger point:

- `server/services/orderItem.service.ts`, `addItemsToOrder`

Trigger condition:

- Existing pending item is found by merge identity and `quantity` is incremented.

Available payload:

- `orderId`
- Existing `OrderItem.id`
- Previous inferred quantity from read result: `existing.quantity`
- Added quantity from incoming payload: `quantity`
- New persisted quantity: `existing.quantity + quantity`
- Merge identity fields:
  - `productId`
  - `displayName`
  - `unitPrice`
  - `variantName`
  - `station`
  - `type`
  - `status = PENDING`
- `notes` update value, if provided

Constraints:

- Previous quantity is available only inside service execution, not persisted historically.
- Merge action is not distinguishable later from a single large quantity line.
- No merge timestamp is stored.

### `order_sent_to_kitchen`

Type: `inferred event`

Source:

- Backend kitchen service

Trigger point:

- `app/api/orders/[id]/send/route.ts`, `POST /api/orders/:id/send`
- `server/services/kitchenTicket.service.ts`, `createKitchenTickets`

Trigger condition:

- Pending items are grouped by station.
- `KitchenTicket` rows are created.
- Matching `OrderItem` rows are updated to `SENT`, assigned `sentAt`, and assigned `ticketId`.
- `Order.lastSentAt` is updated.

Available payload:

- `orderId`
- `order.table`
- `Order.lastSentAt`
- `KitchenTicket.id`
- `KitchenTicket.createdAt`
- Per sent item:
  - `OrderItem.id`
  - `orderId`
  - `productId`
  - `quantity`
  - `unitPrice`
  - `displayName`
  - `station`
  - `variantName`
  - `notes`
  - `type`
  - `status = SENT`
  - `sentAt`
  - `ticketId`

Constraints:

- Station-specific ticket creation does not persist an explicit station on `KitchenTicket`; station is derived from ticket items.
- The in-memory kitchen events only emit `orderId` and `itemId`.
- There is no persistent send event log.

### `order_printed`

Type: `inferred event`

Source:

- Next.js send route and local print server

Trigger point:

- `app/api/orders/[id]/send/route.ts`
- `print-server/index.ts`, `POST /emit`, `enqueueFromEvent`

Trigger condition:

- Send route receives `printKitchen` or `printBar`.
- It posts one of the print event names to the local print server.

Available payload from Next.js to print server:

- `payload.id`: order ID
- `payload.table`
- `payload.items`: `printedItems` from current send

Available normalized item fields in print server:

- `id`
- `displayName`
- `quantity`
- `unitPrice`
- `station`
- `variantName`
- `notes`
- `type`
- `productId`

Constraints:

- Print job result/success/failure is not persisted in the main database.
- Print server queue is separate runtime state.
- No printer device ID is persisted.
- `PRINT_RECEIPT` exists in print server but the observed checkout modal dispatches a browser `checkout-print` event; no persistent receipt print event is visible in the inspected backend path.

### `order_closed`

Type: `inferred event`

Source:

- Backend route

Trigger point:

- Primary current checkout flow: `app/api/orders/[id]/checkout/route.ts`, `POST /api/orders/:id/checkout`
- Additional close route: `app/api/orders/close/route.ts`, `POST /api/orders/close`
- Additional patch close behavior: `app/api/orders/[id]/route.ts`, `PATCH /api/orders/:id`

Trigger condition:

- `Order.status` is updated to `PAID`.
- In checkout route, related `Table.status` is updated to `FREE`.

Available payload:

- `orderId`
- `tableId`
- `order.status = PAID`
- `order.updatedAt` after update, if refetched
- Items included before close in `app/api/orders/[id]/checkout/route.ts`
- Derived total from item snapshots:
  - `sum(OrderItem.quantity * OrderItem.unitPrice)`

Constraints:

- `Order.total` is not persisted in Prisma.
- Payment method is not recorded.
- Paid timestamp is not explicitly stored; `updatedAt` changes, but it is generic and can be affected by other order updates.
- Multiple close endpoints exist with slightly different response payloads.

### `item_split`

Type: `inferred event`

Source:

- Backend route

Trigger point:

- `app/api/orders/items/[id]/notes/route.ts`, `PATCH /api/orders/items/:id/notes`

Trigger condition:

- Existing item has `quantity > 1`.
- Original row quantity is decremented by 1 and notes are cleared.
- A new `OrderItem` row is created with `quantity = 1` and the requested notes.

Available payload:

- Original `OrderItem.id`
- New `OrderItem.id`
- `orderId`
- Original quantity before split
- Original quantity after split
- New item quantity: `1`
- Snapshot fields copied to new item:
  - `productId`
  - `unitPrice`
  - `displayName`
  - `variantName`
  - `station`
  - `status`
  - `type`
  - `notes`

Constraints:

- No split timestamp is persisted.
- Split exists only as part of notes update logic.
- There is no generic item split API beyond this route.

### `item_note_updated`

Type: `inferred event`

Source:

- Backend route

Trigger point:

- `app/api/orders/items/[id]/notes/route.ts`, `PATCH /api/orders/items/:id/notes`

Trigger condition:

- Existing item has `quantity === 1` and `notes` is updated in place.

Available payload:

- `OrderItem.id`
- `orderId`, if loaded from item
- New `notes`
- Existing snapshot item fields

Constraints:

- Previous note value is loaded but not persisted historically.
- No note update timestamp is stored.

### `kitchen_item_started`

Type: `inferred event`

Source:

- Backend kitchen service

Trigger point:

- `app/api/kitchen/items/[id]/route.ts`, action `start`
- `server/services/kitchenFlow.service.ts`, `startItem`

Trigger condition:

- `OrderItem.status` is updated to `IN_PROGRESS`.

Available payload:

- `OrderItem.id`
- `orderId`
- `status = IN_PROGRESS`
- Existing snapshot fields if refetched or included by instrumentation

Constraints:

- No `startedAt` timestamp field exists.
- No station operator/staff ID exists.

### `kitchen_item_completed`

Type: `inferred event`

Source:

- Backend kitchen service

Trigger point:

- `app/api/kitchen/items/[id]/route.ts`, action `complete`
- `server/services/kitchenFlow.service.ts`, `completeItem`
- `app/api/orders/[id]/ready/route.ts`, bulk ready endpoint

Trigger condition:

- One item or all sent/in-progress items for an order are updated to `DONE`.

Available payload:

- `OrderItem.id`
- `orderId`
- `status = DONE`
- Existing snapshot fields if refetched or included by instrumentation

Constraints:

- No `completedAt` timestamp field exists.
- Bulk ready endpoint updates many rows without returning item snapshots.

### `kitchen_item_reverted`

Type: `inferred event`

Source:

- Backend kitchen service

Trigger point:

- `app/api/kitchen/items/[id]/route.ts`, action `revert`
- `server/services/kitchenFlow.service.ts`, `revertItem`

Trigger condition:

- `OrderItem.status` is updated back to `SENT`.

Available payload:

- `OrderItem.id`
- `orderId`
- `status = SENT`

Constraints:

- Previous state is not persisted in a history table.
- No reason for revert is recorded.

## Event Payload Definitions

### Common Order Payload

```json
{
  "orderId": 123,
  "tableId": 5,
  "status": "OPEN",
  "createdAt": "2026-05-16T00:00:00.000Z",
  "updatedAt": "2026-05-16T00:00:00.000Z",
  "lastSentAt": null
}
```

### Common OrderItem Snapshot Payload

```json
{
  "itemId": 456,
  "orderId": 123,
  "productId": 10,
  "quantity": 2,
  "unitPrice": 120,
  "displayName": "Taco Pastor Grande",
  "status": "PENDING",
  "station": "KITCHEN",
  "variantName": "Grande",
  "ticketId": null,
  "sentAt": null,
  "notes": null,
  "type": "PRODUCT"
}
```

### Common Revenue Payload

```json
{
  "orderId": 123,
  "tableId": 5,
  "status": "PAID",
  "total": 240,
  "items": [
    {
      "itemId": 456,
      "displayName": "Taco Pastor Grande",
      "quantity": 2,
      "unitPrice": 120,
      "lineTotal": 240,
      "station": "KITCHEN",
      "variantName": "Grande",
      "type": "PRODUCT"
    }
  ]
}
```

Note: `total` is derived, not persisted on `Order`.

## Analytics Gaps

These are absent in the current system and would limit analytics accuracy.

- **Persistent event history**: No table stores immutable order/item events.
- **Item action timestamps**: `OrderItem` has `sentAt`, but no `createdAt`, `mergedAt`, `startedAt`, `completedAt`, `revertedAt`, or `noteUpdatedAt`.
- **Actor tracking**: No user, waiter, cashier, cook, or staff ID is recorded in the inspected flows.
- **Payment details**: No payment method, tendered amount, discount, tax, tip, refund, or void reason is stored.
- **Persisted order total**: Checkout calculates or displays totals from snapshots, but `Order` does not store `total`.
- **Line-level event count**: Merged lines lose the distinction between one add of quantity 3 and three separate adds of quantity 1.
- **Print result tracking**: Print requests are sent to the local print server, but print success/failure is not persisted in Prisma.
- **Kitchen duration tracking**: `sentAt` exists, but start and completion timestamps are not stored.
- **Station on ticket**: `KitchenTicket` has no station field; station must be derived from linked items.
- **Order lifecycle granularity**: Order status only captures `OPEN`, `PAID`, `CANCELED`; intermediate lifecycle states are represented mostly by item statuses.
- **Deletion/removal audit**: `removeOrderItem` exists in service code, but no event history captures removals.

## Metrics Derivable Without New Data

All metrics below can be calculated from current tables, primarily `OrderItem` snapshots and `Order` status/timestamps.

### Total Revenue

Formula:

```text
SUM(OrderItem.quantity * OrderItem.unitPrice)
```

Recommended filter:

```text
Order.status = PAID
```

Reasoning:

- `unitPrice` is the historical price snapshot.
- `quantity` is the persisted final line quantity.
- Product catalog changes do not affect historical revenue.

### Average Order Value

Formula:

```text
SUM(line totals for paid orders) / COUNT(paid orders)
```

Where line total is:

```text
OrderItem.quantity * OrderItem.unitPrice
```

### Best Selling Items

Group by:

- `OrderItem.displayName`
- optionally `OrderItem.variantName`
- optionally `OrderItem.type`

Metrics:

- Units sold: `SUM(quantity)`
- Revenue: `SUM(quantity * unitPrice)`

Important:

- Use `displayName`, not current `Product.name`, for historical correctness.

### Item Frequency by Variant

Group by:

- `displayName`
- `variantName`
- `unitPrice`

Metrics:

- Units: `SUM(quantity)`
- Lines: `COUNT(OrderItem.id)`
- Revenue: `SUM(quantity * unitPrice)`

### Station Load

Group by:

- `station`
- optionally by `sentAt` date bucket

Metrics:

- Item lines: `COUNT(OrderItem.id)`
- Units: `SUM(quantity)`
- Revenue contribution: `SUM(quantity * unitPrice)`

Recommended filters:

- For kitchen workload: `status IN (SENT, IN_PROGRESS, DONE)` or `sentAt IS NOT NULL`
- For sales workload: join to paid orders

### Open Kitchen Workload

Filter:

```text
Order.status = OPEN
OrderItem.status IN (SENT, IN_PROGRESS)
```

Group by:

- `station`
- `status`

Metrics:

- Active item units: `SUM(quantity)`
- Active item lines: `COUNT(id)`

### Send Volume

Use:

- `OrderItem.sentAt`
- `OrderItem.ticketId`
- `KitchenTicket.createdAt`

Metrics:

- Sent units per time bucket
- Tickets per time bucket
- Items per ticket
- Station mix per ticket, derived from linked items

### Custom Item Sales

Filter:

```text
OrderItem.type = CUSTOM
```

Metrics:

- Custom units: `SUM(quantity)`
- Custom revenue: `SUM(quantity * unitPrice)`
- Custom display names: group by `displayName`

## Proposed Event Log Design

This is design-only and compatible with the current system. It should be additive and should not replace existing POS writes.

### Prisma Table Concept

```prisma
model EventLog {
  id        Int      @id @default(autoincrement())
  orderId   Int?
  eventType String
  timestamp DateTime @default(now())
  payload   Json
}
```

Optional future fields if the system later needs them:

- `itemId Int?`
- `ticketId Int?`
- `source String?`
- `createdAt DateTime @default(now())`

### EventLog Field Semantics

- `id`: immutable event ID.
- `orderId`: nullable to allow system events, but most POS analytics events should include it.
- `eventType`: stable event name such as `order_created`, `item_merged`, or `order_closed`.
- `timestamp`: event capture time. For events with existing timestamps, payload can also include domain timestamps like `order.createdAt`, `sentAt`, or `ticket.createdAt`.
- `payload`: JSON snapshot of available fields at the trigger point.

### Compatibility Rules

- Event writes should happen after successful domain writes or in the same transaction where practical.
- Event payloads should copy snapshot fields from `OrderItem` rather than reference mutable `Product` data.
- Failed print jobs or external local print server errors should not block core checkout/order flow unless current POS behavior already requires it.
- The analytics layer should treat EventLog as append-only.

## Mapping: Prisma to Analytics Events

### Order to Lifecycle Events

| Prisma source | Current mutation | Inferred event |
| --- | --- | --- |
| `Order` | `create` with `status = OPEN` | `order_created` |
| `Order` | `update status = PAID` | `order_closed` |
| `Order` | `update lastSentAt = now` | `order_sent_to_kitchen` |
| `Order` | `updatedAt` changes | Generic lifecycle update only; not enough alone for a specific event |

### OrderItem to Item Events

| Prisma source | Current mutation | Inferred event |
| --- | --- | --- |
| `OrderItem` | `create` during order creation | Included in `order_created` |
| `OrderItem` | `create` on existing order | `item_added_to_order` |
| `OrderItem` | `update quantity = existing + quantity` | `item_merged` |
| `OrderItem` | `update status = SENT`, `sentAt`, `ticketId` | `order_sent_to_kitchen` / item sent event |
| `OrderItem` | `update status = IN_PROGRESS` | `kitchen_item_started` |
| `OrderItem` | `update status = DONE` | `kitchen_item_completed` |
| `OrderItem` | `update status = SENT` from revert | `kitchen_item_reverted` |
| `OrderItem` | decrement original and create copied row with notes | `item_split` |
| `OrderItem` | update `notes` in place | `item_note_updated` |

### Close Route to Revenue Event

Routes:

- `app/api/orders/[id]/checkout/route.ts`
- `app/api/orders/close/route.ts`
- `app/api/orders/[id]/route.ts` `PATCH`

Mapping:

- Current mutation: `Order.status = PAID`
- Inferred event: `order_closed`
- Revenue payload: derived from `OrderItem.quantity * OrderItem.unitPrice`

Important distinction:

- `app/api/orders/close/route.ts` explicitly computes and returns `total`.
- `app/api/orders/[id]/checkout/route.ts` loads items but does not return or persist total.
- `app/api/orders/[id]/route.ts` `PATCH` closes the order without loading items.

Analytics recommendation:

- If instrumenting later, compute revenue payload from item snapshots at the moment the order is marked `PAID`.

### Kitchen Service to Station Events

Files:

- `server/services/kitchenTicket.service.ts`
- `server/services/kitchenFlow.service.ts`

Mapping:

| Service action | Current mutation | Inferred event |
| --- | --- | --- |
| `createKitchenTickets(orderId)` | group pending items by `station` | station send batch |
| `createKitchenTickets(orderId)` | create `KitchenTicket` | `order_sent_to_kitchen` |
| `createKitchenTickets(orderId)` | set item `status = SENT`, `sentAt`, `ticketId` | item sent to station |
| `startItem(itemId)` | set item `status = IN_PROGRESS` | `kitchen_item_started` |
| `completeItem(itemId)` | set item `status = DONE` | `kitchen_item_completed` |
| `revertItem(itemId)` | set item `status = SENT` | `kitchen_item_reverted` |

Station event payload should derive station from each `OrderItem.station`.

## Recommended Analytics Read Model

Without adding new core behavior, analytics queries should prioritize these sources:

1. `OrderItem` for item name, price, quantity, station, variant, type, and item status.
2. `Order` for order lifecycle status, table relation, and coarse timestamps.
3. `KitchenTicket` for send batches and ticket timestamps.
4. `Table` for table names/status if needed for operational reporting.
5. `Product` only for catalog reference, not historical sales truth.

## Implementation Notes for Future Work

If an event log is later implemented:

- Add it as an append-only table.
- Do not change existing order/item/kitchen/print behavior.
- Instrument at service boundaries first:
  - `createOrder`
  - `addItemsToOrder`
  - `createKitchenTickets`
  - `startItem`
  - `completeItem`
  - `revertItem`
  - checkout/close routes
  - notes route split/update path
- Store payloads from the same snapshot fields already used by checkout, kitchen, and printer.
- Avoid deriving historical analytics from current `Product` records.

## Summary

The current POS already has a strong historical data foundation because `OrderItem` stores immutable-enough item snapshots: `displayName`, `unitPrice`, `quantity`, `station`, `variantName`, `type`, and `productId`.

The main analytics limitation is not the snapshot model; it is the lack of a persistent event history and granular timestamps for item actions. A future `EventLog` table can be added without disrupting the existing POS by capturing inferred events at current service and route trigger points.
