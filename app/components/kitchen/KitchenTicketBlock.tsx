"use client";

import { memo } from "react";
import type {
  KitchenGroupedTicket,
  KitchenItemAction,
  KitchenPendingAction,
} from "@/app/types/kitchen";

import { KitchenSurfaceCard } from "@/app/components/ui/kitchen/primitives";
import { kitchenStatusColors } from "@/app/components/ui/kitchen/tokens";
import { cn } from "@/lib/cn";
import { KitchenItem } from "./KitchenItem";
import { theme } from "@/app/src/lib/ui/theme";

type KitchenTicketBlockProps = {
  ticket: KitchenGroupedTicket;
  tone:
    | "new"
    | "alert"
    | "critical"
    | "reservation"
    | "reservationActive";
  pendingActions: KitchenPendingAction[];
  onUpdateItem: (
    itemId: number,
    action: KitchenItemAction
  ) => void;
};

function formatTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString();
}

export const KitchenTicketBlock = memo(
  function KitchenTicketBlock({
    ticket,
    tone,
    pendingActions,
    onUpdateItem,
  }: KitchenTicketBlockProps) {
    return (
      <KitchenSurfaceCard
        className={cn(
          theme.surface.card,
          theme.border.default,
          theme.motion.fast,

          `
            space-y-2
            border
            p-2
            rounded-2xl
          `,

          tone === "new" && kitchenStatusColors.new,
          tone === "alert" && kitchenStatusColors.alert,
          tone === "critical" && kitchenStatusColors.critical,
          tone === "reservation" && kitchenStatusColors.reservation,
          tone === "reservationActive" &&
            kitchenStatusColors.reservationActive
        )}
        variant="surfaceAlt"
      >
        <div
          className={cn(
            theme.text.secondary,
            `
              text-right
              text-xs
              font-bold
              tabular-nums
            `
          )}
        >
          {formatTime(ticket.sentAt)}
        </div>

        {ticket.items.map((item) => (
          <KitchenItem
            key={item.id}
            item={item}
            isPending={pendingActions.includes(`item:${item.id}`)}
            onUpdateItem={onUpdateItem}
          />
        ))}
      </KitchenSurfaceCard>
    );
  }
);