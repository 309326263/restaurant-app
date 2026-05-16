"use client";

import {
  History,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
  Rows3,
  Moon,
  Sun,
} from "lucide-react";
import { memo } from "react";
import { KitchenToolbarButton } from "@/app/components/ui/kitchen/primitives";
import { kitchenTypography } from "@/app/components/ui/kitchen/tokens";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/app/stores/uiStore";
import { theme } from "@/app/src/lib/ui/theme";

export type KitchenLayoutMode = "horizontal" | "flow";

type KitchenHeaderOSProps = {
  collapsed: boolean;
  layoutMode: KitchenLayoutMode;
  onHistory: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
  onToggleLayout: () => void;
  onToggleCollapsed: () => void;
};

export const KitchenHeaderOS = memo(function KitchenHeaderOS({
  collapsed,
  layoutMode,
  onHistory,
  onDecreaseFont,
  onIncreaseFont,
  onToggleLayout,
  onToggleCollapsed,
}: KitchenHeaderOSProps) {
  const { darkMode, toggleDarkMode } = useUiStore();

  if (collapsed) {
    return (
      <div className="absolute right-3 top-3 z-50 origin-right animate-in fade-in zoom-in transition-all duration-200">
        <KitchenToolbarButton
          className={cn(
            "shadow-sm transition-all duration-200 hover:scale-105 active:scale-95",
            theme.surface.panel,
            theme.border.default
          )}
          onClick={onToggleCollapsed}
        >
          <PanelRightOpen size={18} />
        </KitchenToolbarButton>
      </div>
    );
  }

  return (
    <nav
      className={cn(
        "z-30 flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2",
        "transition-all duration-200",
        theme.surface.panel,
        theme.border.default
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-xl">🍳</span>

        <div className="min-w-0">
          <div className={cn(kitchenTypography.osTitle, theme.text.primary)}>
            Kitchen OS
          </div>

          <div className={cn("text-xs font-semibold", theme.text.secondary)}>
            tiempo real operativo
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <KitchenToolbarButton
          className={cn(theme.surface.card, theme.border.default)}
          onClick={onHistory}
        >
          <History size={16} />
          <span>History</span>
        </KitchenToolbarButton>

        <KitchenToolbarButton
          className={cn(theme.surface.card, theme.border.default)}
          onClick={onDecreaseFont}
        >
          A-
        </KitchenToolbarButton>

        <KitchenToolbarButton
          className={cn(theme.surface.card, theme.border.default)}
          onClick={onIncreaseFont}
        >
          A+
        </KitchenToolbarButton>

        <KitchenToolbarButton
          className={cn(
            "flex items-center gap-2",
            theme.surface.card,
            theme.border.default
          )}
          onClick={onToggleLayout}
        >
          {layoutMode === "horizontal" ? (
            <Rows3 size={16} />
          ) : (
            <LayoutGrid size={16} />
          )}

          <span>
            {layoutMode === "horizontal" ? "Horizontal" : "Flow"}
          </span>
        </KitchenToolbarButton>

        <KitchenToolbarButton
          className={cn(theme.surface.card, theme.border.default)}
          onClick={onToggleCollapsed}
        >
          <PanelRightClose size={16} />
        </KitchenToolbarButton>

        <KitchenToolbarButton
          className={cn(theme.surface.card, theme.border.default)}
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </KitchenToolbarButton>
      </div>
    </nav>
  );
});