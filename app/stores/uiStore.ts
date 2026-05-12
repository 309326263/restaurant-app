"use client";

import { create } from "zustand";

type CheckoutView = "grouped" | "tickets";

type UiStore = {
  showCustomItemModal: boolean;
  showSendModal: boolean;
  showCheckoutModal: boolean;
  selectedVariant: number | null;
  openedCategoryId: number | null;
  flashItemId: number | null;
  editingNotes: Record<number, string>;
  checkoutView: CheckoutView;
  setShowCustomItemModal: (value: boolean) => void;
  setShowSendModal: (value: boolean) => void;
  setShowCheckoutModal: (value: boolean) => void;
  setSelectedVariant: (value: number | null) => void;
  setOpenedCategoryId: (value: number | null) => void;
  setFlashItemId: (value: number | null) => void;
  setEditingNote: (itemId: number, note: string) => void;
  setCheckoutView: (value: CheckoutView) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  showCustomItemModal: false,
  showSendModal: false,
  showCheckoutModal: false,
  selectedVariant: null,
  openedCategoryId: null,
  flashItemId: null,
  editingNotes: {},
  checkoutView: "grouped",
  setShowCustomItemModal: (value) => set({ showCustomItemModal: value }),
  setShowSendModal: (value) => set({ showSendModal: value }),
  setShowCheckoutModal: (value) => set({ showCheckoutModal: value }),
  setSelectedVariant: (value) => set({ selectedVariant: value }),
  setOpenedCategoryId: (value) => set({ openedCategoryId: value }),
  setFlashItemId: (value) => set({ flashItemId: value }),
  setEditingNote: (itemId, note) =>
    set((state) => ({
      editingNotes: {
        ...state.editingNotes,
        [itemId]: note,
      },
    })),
  setCheckoutView: (value) => set({ checkoutView: value }),
}));
