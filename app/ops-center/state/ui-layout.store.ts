import { create } from "zustand";

type LayoutMode = "rail" | "flow";

type State = {
  layout: LayoutMode;
  setLayout: (mode: LayoutMode) => void;
  toggleLayout: () => void;
};

export const useUiLayout = create<State>((set) => ({
  layout: "rail",

  setLayout: (mode) => set({ layout: mode }),

  toggleLayout: () =>
    set((s) => ({
      layout: s.layout === "rail" ? "flow" : "rail",
    })),
}));