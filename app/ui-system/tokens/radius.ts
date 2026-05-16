/**
 * Border radius system basado en UI actual (MenuPanel + POS UI)
 */

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  full: "9999px",
} as const;

export type Radius = keyof typeof radius;