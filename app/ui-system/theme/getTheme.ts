import { useTheme } from "./theme";
import { colors, ThemeMode } from "../tokens/colors";

/**
 * Theme resolver
 * Une:
 * - darkMode real del sistema (MenuPanel store)
 * - tokens de color semántico
 *
 * Esto es la base del futuro UI System multi-layout.
 */

export function getTheme(mode: ThemeMode) {
  const palette = colors[mode];

  return {
    mode,

    // backgrounds
    bg: palette.bg,
    surface: palette.surface,
    surface2: palette.surface2,

    // text
    text: palette.text,
    muted: palette.muted,

    // borders
    border: palette.border,

    // actions
    primary: palette.primary,
    accent: palette.accent,

    // status
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
  };
}