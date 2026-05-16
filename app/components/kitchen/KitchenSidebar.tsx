"use client";

import { memo } from "react";
import type { KitchenOrder } from "@/app/types/kitchen";
import { getKitchenVisibleItems } from "@/app/kitchen/lib/kitchenVisibility";
import { cn } from "@/lib/cn";
import { theme } from "@/app/src/lib/ui/theme";

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
      className={cn(
        "fixed inset-0 z-40 transition-all duration-200",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      )}
    >
      {/* BACKDROP */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-black/40 backdrop-blur-sm",
          "transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* PANEL */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[260px]",
          "border-l shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          theme.surface.panel,
          theme.border.default
        )}
      >
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className={cn("text-sm font-semibold", theme.text.primary)}>
            Órdenes activas
          </div>
          <div className={cn("text-xs", theme.text.secondary)}>
            cocina en tiempo real
          </div>
        </div>

        <div className="p-2 overflow-y-auto h-full space-y-2">
          {orders.map((order) => {
            const visibleItems = getKitchenVisibleItems(order);

            if (!visibleItems.length) return null;

            const count = visibleItems.length;

            const isActive = highlightedOrders.includes(order.id);

            return (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl border",
                  "transition-all duration-150",
                  theme.surface.card,
                  theme.border.default,
                  theme.hover.subtle,
                  isActive && "ring-2 ring-amber-400/60 animate-pulse"
                )}
              >
                <div className={cn("font-semibold text-sm", theme.text.primary)}>
                  {order.table.name}
                </div>

                <div className={cn("text-xs", theme.text.secondary)}>
                  {count} items
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});