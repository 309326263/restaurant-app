"use client";

import { create } from "zustand";

type SendOptions = {
  printKitchen: boolean;
  printBar: boolean;
};

type SyncDeps = {
  mutateOrder: () => Promise<any> | any;
  mutateTables: () => Promise<any> | any;
  pendingCart: any[];
};

type OrderStore = {
  activeOrder: any | null;
  selectedTable: any | null;
  groupedItems: Record<string, any>;
  total: number;
  setActiveOrder: (order: any | null) => void;
  setSelectedTable: (table: any | null) => void;
  setComputedOrderData: (payload: {
    groupedItems: Record<string, any>;
    total: number;
  }) => void;
  confirmAddToOrder: (deps: SyncDeps) => Promise<boolean>;
  checkout: (deps: Omit<SyncDeps, "pendingCart">) => Promise<boolean>;
  sendToKitchen: (
    orderId: string | number,
    options: SendOptions
  ) => Promise<boolean>;
};

function mapPendingToApi(items: any[]) {
  return items.map((p) => ({
    productId: p.isCustom ? null : p.id,
    customName: p.customName ?? null,
    customPrice: p.customPrice ?? null,
    quantity: Number(p.qty ?? p.quantity ?? 1),
    variantName: p.variant || null,
    variantPrice: Number(p.variantPrice || 0),
    station: p.station,
  }));
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  activeOrder: null,
  selectedTable: null,
  groupedItems: {},
  total: 0,
  setActiveOrder: (order) => set({ activeOrder: order }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setComputedOrderData: ({ groupedItems, total }) =>
    set({
      groupedItems: groupedItems || {},
      total: Number(total || 0),
    }),
  confirmAddToOrder: async ({ mutateOrder, mutateTables, pendingCart }) => {
    const { selectedTable, activeOrder } = get();
    if (!selectedTable || pendingCart.length === 0) return false;

    if (!activeOrder?.id) {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable.id,
          items: mapPendingToApi(pendingCart),
        }),
      });
      const data = await res.json();
      if (!data.ok) return false;
    } else {
      const res = await fetch(`/api/orders/${activeOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: mapPendingToApi(pendingCart),
        }),
      });
      if (!res.ok) return false;
    }

    await Promise.resolve(mutateOrder());
    await Promise.resolve(mutateTables());
    return true;
  },
  checkout: async ({ mutateOrder, mutateTables }) => {
    const { activeOrder } = get();
    if (!activeOrder?.id) return false;

    const res = await fetch(`/api/orders/${activeOrder.id}/checkout`, {
      method: "POST",
    });
    if (!res.ok) return false;

    set({ selectedTable: null, activeOrder: null });
    await Promise.resolve(mutateOrder());
    await Promise.resolve(mutateTables());
    return true;
  },
  sendToKitchen: async (orderId, options) => {
    if (!orderId) return false;
    const res = await fetch(`/api/orders/${orderId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        printKitchen: options.printKitchen,
        printBar: options.printBar,
      }),
    });
    return res.ok;
  },
}));
