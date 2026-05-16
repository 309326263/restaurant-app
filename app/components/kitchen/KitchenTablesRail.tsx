"use client";

import { memo } from "react";
import type { KitchenOrder } from "@/app/types/kitchen";
import { KitchenBadge } from "@/app/components/ui/kitchen/primitives";
import {
  kitchenLayout,
  kitchenMotion,
  kitchenTypography,
} from "@/app/components/ui/kitchen/tokens";
import { cn } from "@/lib/cn";
import { getKitchenVisibleItems } from "@/app/kitchen/lib/kitchenVisibility";
import { theme } from "@/app/src/lib/ui/theme";

type KitchenTablesRailProps = {
  orders: KitchenOrder[];
  highlightedOrders: number[];
  focusedOrder: number | null;
  onSelectOrder: (orderId: number) => void;
};

export const KitchenTablesRail = memo(function KitchenTablesRail({
  orders,
  highlightedOrders,
  focusedOrder,
  onSelectOrder,
}: KitchenTablesRailProps) {
  const visibleOrders = orders
    .map((order) => ({
      order,
      count: getKitchenVisibleItems(order).length,
    }))
    .filter(({ count }) => count > 0);

  return (
    <aside
      className={cn(
        kitchenLayout.tablesRail,
        theme.surface.panel,
        theme.border.default
      )}
    >
      <div className={kitchenLayout.tablesHeader}>
        <div className={cn(kitchenTypography.osTitle, theme.text.primary)}>
          Mesas
        </div>

        <div className={cn("mt-1 text-xs font-semibold", theme.text.secondary)}>
          {visibleOrders.length} activas
        </div>
      </div>

      <div className={cn(kitchenLayout.tablesList, "kitchen-os-scrollbar")}>
        {visibleOrders.map(({ order, count }) => {
          const isHighlighted = highlightedOrders.includes(order.id);
          const isFocused = focusedOrder === order.id;

          return (
            <button
              key={order.id}
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left shadow-sm",
                kitchenMotion.transition,
                kitchenTypography.tableButton,
                theme.surface.card,
                theme.border.default,
                theme.hover.subtle,
                "active:scale-[0.99]",
                isFocused && "ring-2 ring-red-500/50",
                isHighlighted && "kitchen-os-blink"
              )}
              onClick={() => onSelectOrder(order.id)}
            >
              <span className={cn("block truncate", theme.text.primary)}>
                {order.table.name}
              </span>

              <KitchenBadge className="mt-2" variant="neutral">
                {count} productos
              </KitchenBadge>
            </button>
          );
        })}
      </div>
    </aside>
  );
});