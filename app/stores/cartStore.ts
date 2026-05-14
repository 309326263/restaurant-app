"use client";

import { create } from "zustand";

type PendingItem = {
  id: string | number;
  quantity: number;
  unitPrice: number;
  displayName: string;
  note?: string;
  station?: "KITCHEN" | "BAR";
  isCustom?: boolean;
  variantName?: string | null;
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
  increasePending: (
    id: string | number,
    displayName?: string
  ) => void;
  decreasePending: (
    id: string | number,
    displayName?: string
  ) => void;
  removePending: (
    id: string | number,
    displayName?: string
  ) => void;
  updatePendingNote: (
    id: string | number,
    displayName: string | undefined,
    note: string
  ) => void;
  addCustomItem: (customItem: CustomItemInput) => void;
};

const normalizeId = (id: string | number) => String(id);

const pendingLineKey = (p: PendingItem) =>
  `${normalizeId(p.id)}::${(p.displayName || "").trim()}`;

export const useCartStore = create<CartStore>((set) => ({
  pendingCart: [],
  setPendingCart: (items) => set({ pendingCart: items }),
  clearPending: () => set({ pendingCart: [] }),
  addToPending: (product) =>
    set((state) => {
      const targetId = normalizeId(product.id);
      const displayName = product.variant
        ? `${product.name} ${product.variant}`
        : product.name;

      const unitPrice =
        Number(product.variantPrice) ||
        Number(product.price) ||
        0;

      const existing = state.pendingCart.find(
        (p) => pendingLineKey(p as PendingItem) === `${targetId}::${displayName.trim()}`
      );

      if (existing) {
        return {
          pendingCart: state.pendingCart.map((p) =>
            pendingLineKey(p as PendingItem) === `${targetId}::${displayName.trim()}`
              ? {
                  ...p,
                  quantity: Number((p as PendingItem).quantity || 0) + 1,
                }
              : p
          ),
        };
      }

      return {
        pendingCart: [
          ...state.pendingCart,
          {
            ...product,
            quantity: 1,
            unitPrice,
            displayName,
            variantName: product.variant ?? null,
            note: product.note || "",
          },
        ],
      };
    }),
  increasePending: (id, displayName) =>
    set((state) => ({
      pendingCart: state.pendingCart.map((p) =>
        pendingLineKey(p as PendingItem) ===
        `${normalizeId(id)}::${(displayName || "").trim()}`
          ? {
              ...p,
              quantity:
                Number((p as PendingItem).quantity || 0) + 1,
            }
          : p
      ),
    })),
  decreasePending: (id, displayName) =>
    set((state) => ({
      pendingCart: state.pendingCart
        .map((p) =>
          pendingLineKey(p as PendingItem) ===
          `${normalizeId(id)}::${(displayName || "").trim()}`
            ? {
                ...p,
                quantity:
                  Number((p as PendingItem).quantity || 0) - 1,
              }
            : p
        )
        .filter(
          (p) => Number((p as PendingItem).quantity || 0) > 0
        ),
    })),
  removePending: (id, displayName) =>
    set((state) => ({
      pendingCart: state.pendingCart.filter(
        (p) =>
          !(
            pendingLineKey(p as PendingItem) ===
            `${normalizeId(id)}::${(displayName || "").trim()}`
          )
      ),
    })),
  updatePendingNote: (id, displayName, note) =>
    set((state) => ({
      pendingCart: state.pendingCart.map((p) =>
        pendingLineKey(p as PendingItem) ===
        `${normalizeId(id)}::${(displayName || "").trim()}`
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
          isCustom: true,
          displayName: customItem.name,
          unitPrice: Number(customItem.price || 0),
          quantity: 1,
          station: customItem.station,
          note: "",
        },
      ],
    })),
}));
