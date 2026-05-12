"use client";

import { useMemo } from "react";

export function useOrderTotals(activeOrder: any, pendingCart: any[]) {
  const groupedItems = useMemo(() => {
    const source = Array.isArray(activeOrder?.items) ? activeOrder.items : [];
    return source.reduce((acc: Record<string, any>, item: any) => {
      const key = `${item.product?.name || item.customName}-${item.variantName || ""}`;
      if (!acc[key]) {
        acc[key] = { ...item, totalQty: 0 };
      }
      acc[key].totalQty += Number(item.quantity || 0);
      return acc;
    }, {});
  }, [activeOrder]);

  const total = useMemo(() => {
    const activeTotal = (Array.isArray(activeOrder?.items) ? activeOrder.items : []).reduce(
      (sum: number, i: any) =>
        sum +
        (Number(i.customPrice ?? i.product?.price ?? 0) + Number(i.variantPrice || 0)) *
          Number(i.quantity || 0),
      0
    );

    const pendingTotal = (Array.isArray(pendingCart) ? pendingCart : []).reduce(
      (sum: number, p: any) =>
        sum +
        (Number(p.customPrice ?? p.price ?? 0) + Number(p.variantPrice || 0)) *
          Number(p.qty || 0),
      0
    );

    return Number((activeTotal + pendingTotal).toFixed(2));
  }, [activeOrder, pendingCart]);

  return {
    groupedItems: groupedItems || {},
    total,
  };
}
