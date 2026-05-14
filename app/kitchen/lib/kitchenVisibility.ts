import type { KitchenItem, KitchenOrder } from "@/app/types/kitchen";

export function getKitchenVisibleItems(
  order: KitchenOrder
): KitchenItem[] {
  const kitchenState = order.kitchenView?.stations.KITCHEN;

  if (!kitchenState) {
    return [];
  }

  return [
    ...kitchenState.SENT,
    ...kitchenState.IN_PROGRESS,
  ];
}
