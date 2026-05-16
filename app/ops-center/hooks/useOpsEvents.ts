import { useEffect, useRef } from "react";

type Params = {
  orders: any[];
  sound?: boolean;
};

export function useOpsEvents({ orders, sound }: Params) {
  const prevOrders = useRef<any[]>([]);

  useEffect(() => {
    const prev = prevOrders.current;

    const prevIds = new Set(prev.map((o) => o.id));
    const newOrders = orders.filter((o) => !prevIds.has(o.id));

    if (newOrders.length > 0) {
      // 🔵 NEW ORDER EVENT
      newOrders.forEach((order) => {
        triggerOrderEvent(order, sound);
      });
    }

    prevOrders.current = orders;
  }, [orders]);

  return {};
}

function triggerOrderEvent(order: any, sound?: boolean) {
  // highlight hook (future DOM binding)
  window.dispatchEvent(
    new CustomEvent("kitchen:new-order", {
      detail: order,
    })
  );

  // optional sound
  if (sound) {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.play().catch(() => {});
  }
}