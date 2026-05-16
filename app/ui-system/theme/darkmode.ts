import { useUiStore } from "@/app/stores/uiStore";

/**
 * Theme Bridge (v1)
 * Conecta el sistema actual (darkMode) con el futuro design system.
 * No introduce nueva lógica aún.
 */

export function useTheme() {
  const { darkMode, toggleDarkMode } = useUiStore();

  return {
    mode: darkMode ? "dark" : "light",
    isDark: darkMode,
    toggleDarkMode,
  };
}