"use client";

import { useEffect, useRef, useState } from "react";
import { useKitchenEvents } from "@/app/hooks/useKitchenEvents";

export function useKitchenSync(activeOrder: any, mutateOrder: () => void) {
  const [recentItems, setRecentItems] = useState<number[]>([]);
  const previousIdsRef = useRef<number[]>([]);

  const markRecentItem = (id: number) => {
    setRecentItems((prev) => [...prev, id]);
    setTimeout(() => {
      setRecentItems((prev) => prev.filter((x) => x !== id));
    }, 10000);
  };

  useKitchenEvents({
    onItemUpdated: ({ orderId }) => {
      if (activeOrder?.id === orderId) mutateOrder();
    },
    onOrderUpdated: ({ orderId }) => {
      if (activeOrder?.id === orderId) mutateOrder();
    },
  });

  useEffect(() => {
    if (!activeOrder?.items) return;

    const previousIds = previousIdsRef.current;
    activeOrder.items.forEach((item: any) => {
      const alreadyExists = previousIds.includes(Number(item.id));
      if (!alreadyExists && (item.status === "SENT" || item.status === "DONE")) {
        markRecentItem(Number(item.id));
      }
    });

    previousIdsRef.current = activeOrder.items.map((i: any) => Number(i.id));
  }, [activeOrder]);

  return {
    recentItems,
    markRecentItem,
  };
}
