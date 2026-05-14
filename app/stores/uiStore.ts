"use client";

import { create } from "zustand";

type CheckoutView =
  | "grouped"
  | "tickets";

type UiStore = {
  showCustomItemModal: boolean;
  showSendModal: boolean;
  showCheckoutModal: boolean;

  selectedVariant: number | null;
  openedCategoryId: number | null;
  flashItemId: number | null;

  editingNotes: Record<
    number,
    string
  >;

  checkoutView: CheckoutView;

  // LAYOUT
  sidebarCollapsed: boolean;
  navbarOpen: boolean;

  // THEME
  darkMode: boolean;

  // 🔥 POS ENGINE STATE
  newOrderTables: Record<
    number,
    boolean
  >;

  occupiedTables: Record<
    number,
    boolean
  >;

  // MODALS
  setShowCustomItemModal: (
    v: boolean
  ) => void;

  setShowSendModal: (
    v: boolean
  ) => void;

  setShowCheckoutModal: (
    v: boolean
  ) => void;

  // PRODUCT UI
  setSelectedVariant: (
    v: number | null
  ) => void;

  setOpenedCategoryId: (
    v: number | null
  ) => void;

  setFlashItemId: (
    v: number | null
  ) => void;

  setEditingNote: (
    id: number,
    note: string
  ) => void;

  setCheckoutView: (
    v: CheckoutView
  ) => void;

  // LAYOUT
  setSidebarCollapsed: (
    v: boolean
  ) => void;

  setNavbarOpen: (
    v: boolean
  ) => void;

  toggleSidebar: () => void;

  toggleNavbar: () => void;

  // THEME
  setDarkMode: (
    v: boolean
  ) => void;

  toggleDarkMode: () => void;

  // 🔥 POS ACTIONS
  markTableHasOrder: (
    tableId: number
  ) => void;

  clearTableOrderFlag: (
    tableId: number
  ) => void;

  setTableOccupied: (
    tableId: number,
    value: boolean
  ) => void;
};

export const useUiStore =
  create<UiStore>((set) => ({
    showCustomItemModal: false,
    showSendModal: false,
    showCheckoutModal: false,

    selectedVariant: null,
    openedCategoryId: null,
    flashItemId: null,

    editingNotes: {},

    checkoutView: "grouped",

    // LAYOUT
    sidebarCollapsed: false,
    navbarOpen: false,

    // THEME
    darkMode: false,

    // POS ENGINE
    newOrderTables: {},
    occupiedTables: {},

    // =========================
    // MODALS
    // =========================
    setShowCustomItemModal: (
      v
    ) =>
      set({
        showCustomItemModal: v,
      }),

    setShowSendModal: (v) =>
      set({
        showSendModal: v,
      }),

    setShowCheckoutModal: (
      v
    ) =>
      set({
        showCheckoutModal: v,
      }),

    // =========================
    // PRODUCT UI
    // =========================
    setSelectedVariant: (
      v
    ) =>
      set({
        selectedVariant: v,
      }),

    setOpenedCategoryId: (
      v
    ) =>
      set({
        openedCategoryId: v,
      }),

    setFlashItemId: (v) =>
      set({
        flashItemId: v,
      }),

    setEditingNote: (
      id,
      note
    ) =>
      set((s) => ({
        editingNotes: {
          ...s.editingNotes,
          [id]: note,
        },
      })),

    setCheckoutView: (v) =>
      set({
        checkoutView: v,
      }),

    // =========================
    // LAYOUT
    // =========================
    setSidebarCollapsed: (
      v
    ) =>
      set({
        sidebarCollapsed: v,
      }),

    setNavbarOpen: (v) =>
      set({
        navbarOpen: v,
      }),

    toggleSidebar: () =>
      set((s) => ({
        sidebarCollapsed:
          !s.sidebarCollapsed,
      })),

    toggleNavbar: () =>
      set((s) => ({
        navbarOpen:
          !s.navbarOpen,
      })),

    // =========================
    // THEME
    // =========================
    setDarkMode: (v) =>
      set({
        darkMode: v,
      }),

    toggleDarkMode: () =>
      set((s) => ({
        darkMode: !s.darkMode,
      })),

    // =========================
    // POS ENGINE
    // =========================
    markTableHasOrder: (
      tableId
    ) =>
      set((s) => ({
        newOrderTables: {
          ...s.newOrderTables,
          [tableId]: true,
        },
      })),

    clearTableOrderFlag: (
      tableId
    ) =>
      set((s) => {
        const copy = {
          ...s.newOrderTables,
        };

        delete copy[tableId];

        return {
          newOrderTables: copy,
        };
      }),

    setTableOccupied: (
      tableId,
      value
    ) =>
      set((s) => ({
        occupiedTables: {
          ...s.occupiedTables,
          [tableId]: value,
        },
      })),
  }));