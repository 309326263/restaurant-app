import type { KitchenOrder } from "@/app/types/kitchen";
import { getKitchenVisibleItems } from "./kitchenVisibility";

export function isRecent(date: string) {
  const timestamp = new Date(date).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const diff = Date.now() - timestamp;

  return diff < 120000;
}

export function detectChangedOrders(
  orders: KitchenOrder[],
  previousCounts: Record<number, number>
) {
  const next: Record<number, number> = {};
  const changedOrderIds: number[] = [];

  orders.forEach((order) => {
    const count =
      getKitchenVisibleItems(order).length || 0;

    const previous = previousCounts[order.id] || 0;

    if (count > previous) {
      changedOrderIds.push(order.id);
    }

    next[order.id] = count;
  });

  return {
    next,
    changedOrderIds,
  };
}
