/**
 * Color system semántico del POS UI System
 * Basado en el comportamiento real del MenuPanel (light/dark)
 *
 * Importante:
 * - No es Tailwind
 * - No es CSS global
 * - Es capa lógica para futuros componentes
 */

export const colors = {
  light: {
    bg: "#f4f4f5",        // zinc-100 base POS
    surface: "#ffffff",
    surface2: "#f9fafb",

    text: "#18181b",
    muted: "#71717a",

    border: "#e4e4e7",

    primary: "#18181b",
    accent: "#3b82f6",

    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#ef4444",
  },

  dark: {
    bg: "#09090b",        // zinc-950
    surface: "#18181b",   // zinc-900
    surface2: "#27272a",  // zinc-800

    text: "#fafafa",
    muted: "#a1a1aa",

    border: "#27272a",

    primary: "#fafafa",
    accent: "#3b82f6",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
} as const;

export type ThemeMode = "light" | "dark";