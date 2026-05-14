import type { KitchenOrder } from "@/app/types/kitchen";
import { getKitchenVisibleItems } from "./kitchenVisibility";

const categoryOrder: Record<string, number> = {
  Postres: 1,
  Entradas: 2,
  Especialidades: 3,
  "Sopas y Ramen": 4,
  "Udon y Tallarines": 5,
  Arroz: 6,
  Sushi: 7,
};

function getCategoryRank(categoryName?: string | null) {
  if (!categoryName) {
    return 9999;
  }

  return categoryOrder[categoryName] ?? 9999;
}

function getOrderCategoryRank(order: KitchenOrder) {
  const visible = getKitchenVisibleItems(order);

  if (!visible.length) {
    return 9999;
  }

  return visible.reduce((min, item) => {
    const rank = getCategoryRank(item.categoryName);
    return rank < min ? rank : min;
  }, 9999);
}

function getCreatedAtTime(order: KitchenOrder) {
  const timestamp = new Date(order.createdAt).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : Number(order.id);
}

export function sortKitchenOrders(
  orders: KitchenOrder[]
): KitchenOrder[] {
  return [...orders].sort((a, b) => {
    const diff =
      getOrderCategoryRank(a) - getOrderCategoryRank(b);

    if (diff !== 0) return diff;

    return getCreatedAtTime(a) - getCreatedAtTime(b);
  });
}
