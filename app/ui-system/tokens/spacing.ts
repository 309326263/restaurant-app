/**
 * Spacing scale base del POS UI System
 * Derivado del uso real en MenuPanel (4px grid mental model)
 */

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
} as const;

export type Spacing = keyof typeof spacing;