"use client";

import { memo } from "react";
import type { KitchenOrder } from "@/app/types/kitchen";
import { getKitchenVisibleItems } from "@/app/kitchen/lib/kitchenVisibility";

type KitchenSidebarProps = {
  orders: KitchenOrder[];
  highlightedOrders: number[];
  open: boolean;
  onSelectOrder: (orderId: number) => void;
};

export const KitchenSidebar = memo(function KitchenSidebar({
  orders,
  highlightedOrders,
  open,
  onSelectOrder,
}: KitchenSidebarProps) {
  return (
    <div
      className={`kitchen-overlay ${open ? "open" : ""}`}
    >
      <div className="kitchen-overlay-list">
        {orders.map((order) => {
          const visibleItems =
            getKitchenVisibleItems(order);

          if (!visibleItems.length) return null;

          const count = visibleItems.length;

          const isActive = highlightedOrders.includes(
            order.id
          );

          return (
            <button
              key={order.id}
              className={`kitchen-overlay-item ${
                isActive ? "blink" : ""
              }`}
              onClick={() => onSelectOrder(order.id)}
            >
              {order.table.name} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
});
