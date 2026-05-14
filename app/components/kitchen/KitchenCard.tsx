"use client";

import { memo } from "react";
import type {
  KitchenItem,
  KitchenItemAction,
  KitchenOrder,
  KitchenPendingAction,
} from "@/app/types/kitchen";
import { groupByTicket } from "@/app/kitchen/lib/kitchenGrouping";
import { KitchenTicketBlock } from "./KitchenTicketBlock";

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

function getCategoryLineClass(categoryId?: number | null) {
  if (categoryId === 1) return "line-orange";
  if (categoryId === 8) return "line-green";
  if (categoryId === 5) return "line-purple-top";
  return "";
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
  const firstCategoryId =
    visibleItems[0]?.categoryId ?? null;

  return (
    <div
      className={`kitchen-card ${
        isFlashing ? "flash" : ""
      } ${isFocused ? "focus-card" : ""}`}
      data-cat={firstCategoryId ?? undefined}
    >
      <div
        className={`category-line ${getCategoryLineClass(
          firstCategoryId
        )}`}
      />
      <div className="kitchen-card-header">
        <span className="kitchen-table">
          {order.table.name}
        </span>
      </div>

      <div className="kitchen-items">
        {groupByTicket(visibleItems).map((ticket) => (
          <KitchenTicketBlock
            key={ticket.ticketId}
            ticket={ticket}
            highlight={
              !!ticket.sentAt && isRecent(ticket.sentAt)
            }
            pendingActions={pendingActions}
            onUpdateItem={onUpdateItem}
          />
        ))}
      </div>

      <button
        className="kitchen-btn"
        disabled={isReleasePending}
        style={{
          opacity: isReleasePending ? 0.6 : 1,
          cursor: isReleasePending ? "default" : "pointer",
        }}
        onClick={() => onRelease(order.id)}
      >
        Liberar
      </button>
    </div>
  );
});
