"use client";

import { memo } from "react";
import type {
  KitchenGroupedTicket,
  KitchenItemAction,
  KitchenPendingAction,
} from "@/app/types/kitchen";
import { KitchenItem } from "./KitchenItem";

type KitchenTicketBlockProps = {
  ticket: KitchenGroupedTicket;
  highlight: boolean;
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
    highlight,
    pendingActions,
    onUpdateItem,
  }: KitchenTicketBlockProps) {
    return (
      <div
        className={`kitchen-block ${
          highlight ? "kitchen-block-new" : ""
        }`}
      >
        <div className="kitchen-time">
          {formatTime(ticket.sentAt)}
        </div>

        {ticket.items.map((item) => (
          <KitchenItem
            key={item.id}
            item={item}
            isPending={pendingActions.includes(
              `item:${item.id}`
            )}
            onUpdateItem={onUpdateItem}
          />
        ))}
      </div>
    );
  }
);
