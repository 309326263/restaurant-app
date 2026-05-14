export type KitchenStatus =
  | "PENDING"
  | "SENT"
  | "IN_PROGRESS"
  | "DONE";

export type KitchenStation = "KITCHEN" | "BAR";

export type KitchenItemAction =
  | "start"
  | "complete"
  | "revert";

export interface KitchenTable {
  id: number;
  name: string;
}

export interface KitchenItem {
  id: number;
  orderId: number;
  productId?: number | null;
  displayName: string;
  quantity: number;
  unitPrice: number;
  station: KitchenStation;
  status: KitchenStatus;
  ticketId: number | null;
  sentAt: string | null;
  createdAt?: string;
  variantName?: string | null;
  variantPrice?: number | null;
  notes?: string | null;
  type?: string;
  categoryId?: number | null;
  categoryName?: string | null;
}

export interface KitchenStationView {
  PENDING: KitchenItem[];
  SENT: KitchenItem[];
  IN_PROGRESS: KitchenItem[];
  DONE: KitchenItem[];
}

export interface KitchenView {
  orderId: number;
  stations: Record<KitchenStation, KitchenStationView>;
}

export interface KitchenOrder {
  id: number;
  tableId: number;
  table: KitchenTable;
  status: string;
  createdAt: string;
  updatedAt?: string;
  lastSentAt?: string | null;
  items?: KitchenItem[];
  kitchenView?: KitchenView | null;
}

export interface KitchenGroupedTicket {
  ticketId: number;
  items: KitchenItem[];
  sentAt: string | null;
}

export type KitchenPendingAction =
  | `item:${number}`
  | `release:${number}`;
