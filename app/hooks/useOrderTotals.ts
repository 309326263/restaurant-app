"use client";

import { useMemo } from "react";
import {
  getItemName,
  getItemPrice,
  getItemQty,
  getItemStation,
} from "@/lib/orderItem";

export function useOrderTotals(
  activeOrder: any,
  pendingCart: any[]
) {
  const normalizeItem = (i: any) => {
    return {
      ...i,

      quantity: getItemQty(i),

      unitPrice: getItemPrice(i),

      displayName: getItemName(i),

      station: getItemStation(i),
    };
  };

  const groupedItems = useMemo(() => {
    const source = Array.isArray(activeOrder?.items)
      ? activeOrder.items
      : [];

    const allItems = [...source];

    return allItems.reduce(
      (acc: Record<string, any>, item: any) => {
        const ni = normalizeItem(item);

        const key = `${ni.displayName}::${ni.unitPrice}::${ni.station}`;

        if (!acc[key]) {
          acc[key] = {
            ...ni,
            quantity: 0,
          };
        }

        acc[key].quantity += ni.quantity;

        return acc;
      },
      {}
    );
  }, [activeOrder]);

  const total = useMemo(() => {
    const activeTotal = (
      Array.isArray(activeOrder?.items)
        ? activeOrder.items
        : []
    ).reduce((sum: number, i: any) => {
      const ni = normalizeItem(i);
      return sum + ni.unitPrice * ni.quantity;
    }, 0);

    const pendingTotal = (
      Array.isArray(pendingCart) ? pendingCart : []
    ).reduce((sum: number, p: any) => {
      return (
        sum +
        getItemPrice(p) * getItemQty(p)
      );
    }, 0);

    return Number((activeTotal + pendingTotal).toFixed(2));
  }, [activeOrder, pendingCart]);

  return {
    groupedItems: groupedItems || {},
    total,
  };
}
