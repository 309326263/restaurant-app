import { useUiStore } from "@/app/stores/uiStore";
import { getTheme } from "./getTheme";

/**
 * Theme Bridge v2
 * Ahora expone tema completo del sistema (tokens + semantic colors)
 */

export function useTheme() {
  const { darkMode, toggleDarkMode } = useUiStore();

  const mode = darkMode ? "dark" : "light";
  const theme = getTheme(mode);

  return {
    mode,
    isDark: darkMode,
    toggleDarkMode,
    theme,
  };
}