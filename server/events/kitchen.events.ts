import type { KitchenEvent } from "@/server/events/types";

type KitchenListener = (event: KitchenEvent) => void;

const listeners = new Set<KitchenListener>();

export function subscribeKitchenEvents(listener: KitchenListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function emitKitchenEvent(event: KitchenEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function emitItemUpdated(orderId: number, itemId: number) {
  emitKitchenEvent({
    type: "item.updated",
    orderId,
    itemId,
  });
}

export function emitOrderUpdated(orderId: number) {
  emitKitchenEvent({
    type: "order.updated",
    orderId,
  });
}
