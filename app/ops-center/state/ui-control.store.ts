import { create } from "zustand";

type State = {
  fontScale: number;
  sound: boolean;
  compact: boolean;

  increaseFont: () => void;
  decreaseFont: () => void;
  toggleSound: () => void;
  toggleCompact: () => void;
};

export const useUiControl = create<State>((set) => ({
  fontScale: 1,
  sound: true,
  compact: false,

  increaseFont: () =>
    set((s) => ({
      fontScale: Math.min(s.fontScale + 0.1, 1.6),
    })),

  decreaseFont: () =>
    set((s) => ({
      fontScale: Math.max(s.fontScale - 0.1, 0.8),
    })),

  toggleSound: () =>
    set((s) => ({ sound: !s.sound })),

  toggleCompact: () =>
    set((s) => ({ compact: !s.compact })),
}));