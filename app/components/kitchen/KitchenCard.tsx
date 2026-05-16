"use client";

import { memo } from "react";
import type {
  KitchenItem,
  KitchenItemAction,
  KitchenOrder,
  KitchenPendingAction,
} from "@/app/types/kitchen";

import {
  KitchenActionButton,
  KitchenScrollableArea,
  KitchenSurfaceCard,
} from "@/app/components/ui/kitchen/primitives";

import {
  kitchenStatusColors,
  kitchenTypography,
} from "@/app/components/ui/kitchen/tokens";

import { cn } from "@/lib/cn";

import { groupByTicket } from "@/app/kitchen/lib/kitchenGrouping";

import { KitchenTicketBlock } from "./KitchenTicketBlock";
import { theme } from "@/app/src/lib/ui/theme";

type TicketTone =
  | "new"
  | "alert"
  | "critical"
  | "reservation"
  | "reservationActive";

type KitchenCardProps = {
  order: KitchenOrder;
  visibleItems: KitchenItem[];
  isFlashing: boolean;
  isFocused: boolean;
  isReleasePending: boolean;
  pendingActions: KitchenPendingAction[];
  onRelease: (orderId: number) => void;
  onUpdateItem: (
    itemId: number,
    action: KitchenItemAction
  ) => void;
  isRecent: (date: string) => boolean;
};

function minutesSince(value: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return Math.max(0, (Date.now() - timestamp) / 60000);
}

function isReservation(order: KitchenOrder, items: KitchenItem[]) {
  const status = order.status.toLowerCase();

  return (
    status.includes("reserv") ||
    items.some((item) => {
      const type = item.type?.toLowerCase() ?? "";
      const category = item.categoryName?.toLowerCase() ?? "";
      const name = item.displayName.toLowerCase();

      return (
        type.includes("reserv") ||
        category.includes("reserv") ||
        name.includes("reserv")
      );
    })
  );
}

function getTicketTone(
  order: KitchenOrder,
  items: KitchenItem[],
  sentAt: string | null
): TicketTone {
  const reservation = isReservation(order, items);
  const started = items.some((item) => item.status === "IN_PROGRESS");

  if (reservation && !started) {
    return "reservation";
  }

  const elapsed = minutesSince(sentAt);

  if (elapsed >= 60) return "critical";
  if (elapsed >= 30) return "alert";
  if (reservation) return "reservationActive";

  return "new";
}

export const KitchenCard = memo(function KitchenCard({
  order,
  visibleItems,
  isFlashing,
  isFocused,
  isReleasePending,
  pendingActions,
  onRelease,
  onUpdateItem,
  isRecent,
}: KitchenCardProps) {
  const reservation = isReservation(order, visibleItems);

  return (
    <KitchenSurfaceCard
      className={cn(
        theme.surface.card,
        theme.border.default,
        theme.motion.base,

        `
          flex
          h-full
          w-[340px]
          flex-col
          overflow-hidden
          rounded-3xl
          border
          shadow-sm
        `,

        isFlashing && "kitchen-os-flash",

        isFocused &&
          `
            kitchen-os-focus
            outline
            outline-4
          `,

        reservation && kitchenStatusColors.reservation
      )}
    >
      <div
        className={cn(
          theme.border.default,
          theme.surface.panel,
          `
            shrink-0
            border-b
            px-4
            py-3
            flex
            items-center
            justify-between
          `
        )}
      >
        <div className="min-w-0">
          <span
            className={cn(
              kitchenTypography.tableTitle,
              theme.text.primary,
              `block truncate`
            )}
          >
            {order.table.name}
          </span>

          <p
            className={cn(
              theme.text.secondary,
              `
                mt-1
                text-[11px]
                font-medium
                tracking-wide
                uppercase
              `
            )}
          >
            Orden #{order.id}
          </p>
        </div>

        <div
          className={cn(
            `
              h-3 w-3 rounded-full shrink-0
            `,
            reservation ? "bg-amber-400" : "bg-emerald-400"
          )}
        />
      </div>

      <KitchenScrollableArea
        className={cn(
          `
            kitchen-os-scrollbar
            min-h-0
            flex-1
            space-y-3
            p-3
          `
        )}
        axis="y"
      >
        {groupByTicket(visibleItems).map((ticket) => (
          <KitchenTicketBlock
            key={ticket.ticketId}
            ticket={ticket}
            tone={getTicketTone(order, ticket.items, ticket.sentAt)}
            pendingActions={pendingActions}
            onUpdateItem={onUpdateItem}
          />
        ))}
      </KitchenScrollableArea>

      <div
        className={cn(
          theme.border.default,
          theme.surface.panel,
          `
            shrink-0
            border-t
            p-3
          `
        )}
      >
        <KitchenActionButton
          className={cn(
            theme.motion.fast,
            `
              w-full
              rounded-2xl
              border-0
              font-semibold
              shadow-none
            `
          )}
          pending={isReleasePending}
          variant="danger"
          size="md"
          onClick={() => onRelease(order.id)}
        >
          Liberar mesa
        </KitchenActionButton>
      </div>
    </KitchenSurfaceCard>
  );
});