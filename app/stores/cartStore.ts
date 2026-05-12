"use client";

import { create } from "zustand";

type PendingItem = {
  id: string | number;
  variant?: string | null;
  qty: number;
  note?: string;
  [key: string]: any;
};

type CustomItemInput = {
  name: string;
  price: string;
  station: "KITCHEN" | "BAR";
};

type CartStore = {
  pendingCart: PendingItem[];
  setPendingCart: (items: PendingItem[]) => void;
  clearPending: () => void;
  addToPending: (product: any) => void;
  increasePending: (id: string | number, variant?: string) => void;
  decreasePending: (id: string | number, variant?: string) => void;
  removePending: (id: string | number, variant?: string) => void;
  updatePendingNote: (
    id: string | number,
    variant: string | undefined,
    note: string
  ) => void;
  addCustomItem: (customItem: CustomItemInput) => void;
};

const normalizeId = (id: string | number) => String(id);

export const useCartStore = create<CartStore>((set) => ({
  pendingCart: [],
  setPendingCart: (items) => set({ pendingCart: items }),
  clearPending: () => set({ pendingCart: [] }),
  addToPending: (product) =>
    set((state) => {
      const targetId = normalizeId(product.id);
      const existing = state.pendingCart.find(
        (p) =>
          normalizeId(p.id) === targetId &&
          (p.variant || null) === (product.variant || null)
      );

      if (existing) {
        return {
          pendingCart: state.pendingCart.map((p) =>
            normalizeId(p.id) === targetId &&
            (p.variant || null) === (product.variant || null)
              ? { ...p, qty: Number(p.qty || 0) + 1 }
              : p
          ),
        };
      }

      return {
        pendingCart: [
          ...state.pendingCart,
          {
            ...product,
            qty: 1,
            note: product.note || "",
            displayName: product.variant
              ? `${product.name} - ${product.variant}`
              : product.name,
          },
        ],
      };
    }),
  increasePending: (id, variant) =>
    set((state) => ({
      pendingCart: state.pendingCart.map((p) =>
        normalizeId(p.id) === normalizeId(id) &&
        (p.variant || null) === (variant || null)
          ? { ...p, qty: Number(p.qty || 0) + 1 }
          : p
      ),
    })),
  decreasePending: (id, variant) =>
    set((state) => ({
      pendingCart: state.pendingCart
        .map((p) =>
          normalizeId(p.id) === normalizeId(id) &&
          (p.variant || null) === (variant || null)
            ? { ...p, qty: Number(p.qty || 0) - 1 }
            : p
        )
        .filter((p) => Number(p.qty || 0) > 0),
    })),
  removePending: (id, variant) =>
    set((state) => ({
      pendingCart: state.pendingCart.filter(
        (p) =>
          !(
            normalizeId(p.id) === normalizeId(id) &&
            (p.variant || null) === (variant || null)
          )
      ),
    })),
  updatePendingNote: (id, variant, note) =>
    set((state) => ({
      pendingCart: state.pendingCart.map((p) =>
        normalizeId(p.id) === normalizeId(id) &&
        (p.variant || null) === (variant || null)
          ? { ...p, note }
          : p
      ),
    })),
  addCustomItem: (customItem) =>
    set((state) => ({
      pendingCart: [
        ...state.pendingCart,
        {
          id: `custom-${Date.now()}`,
          customName: customItem.name,
          customPrice: Number(customItem.price || 0),
          qty: 1,
          station: customItem.station,
          isCustom: true,
          note: "",
        },
      ],
    })),
}));
