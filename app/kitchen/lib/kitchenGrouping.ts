import type {
  KitchenGroupedTicket,
  KitchenItem,
} from "@/app/types/kitchen";

function getTime(value: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function groupByTicket(
  items: KitchenItem[]
): KitchenGroupedTicket[] {
  const map: Record<number, KitchenItem[]> = {};

  items.forEach((item) => {
    const key = item.ticketId || 0;

    if (!map[key]) {
      map[key] = [];
    }

    map[key].push(item);
  });

  return Object.entries(map)
    .map(([ticketId, ticketItems]) => ({
      ticketId: Number(ticketId),
      items: ticketItems,
      sentAt: ticketItems[0]?.sentAt ?? null,
    }))
    .sort(
      (a, b) =>
        getTime(b.sentAt) - getTime(a.sentAt)
    );
}
