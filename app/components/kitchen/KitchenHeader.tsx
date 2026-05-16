"use client";

import { History, Moon, Sun } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/app/stores/uiStore";
import { theme } from "@/app/src/lib/ui/theme";
import { KitchenToolbarButton } from "@/app/components/ui/kitchen/primitives";

type KitchenHeaderProps = {
  onHistory: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
};

export const KitchenHeader = memo(function KitchenHeader({
  onHistory,
  onDecreaseFont,
  onIncreaseFont,
}: KitchenHeaderProps) {
  const {
    darkMode,
    toggleDarkMode,
  } = useUiStore();

  return (
    <div
      className={cn(
        `
          h-[74px]
          shrink-0
          px-4
          border-b
          flex
          items-center
          gap-3
          backdrop-blur-xl
          transition-all
          duration-200
        `,
        darkMode
          ? `
            bg-zinc-950/95
            border-zinc-800
          `
          : `
            bg-white/95
            border-zinc-200
          `
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            `
              w-11
              h-11
              rounded-2xl
              border
              flex
              items-center
              justify-center
              shadow-sm
            `,
            darkMode
              ? `
                bg-orange-500/10
                border-orange-500/20
                text-orange-300
              `
              : `
                bg-orange-100
                border-orange-200
                text-orange-700
              `
          )}
        >
          <span className="text-xl">
            🍳
          </span>
        </div>

        <div className="min-w-0">
          <h1
            className={cn(
              `
                text-sm
                font-semibold
                tracking-tight
              `,
              darkMode
                ? "text-white"
                : "text-zinc-900"
            )}
          >
            Cocina
          </h1>

          <p
            className={cn(
              `
                text-[11px]
                font-medium
              `,
              darkMode
                ? "text-zinc-400"
                : "text-zinc-500"
            )}
          >
            Kitchen display system
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <KitchenToolbarButton
          onClick={onDecreaseFont}
          className={cn(
            `
              h-10
              min-w-[44px]
              rounded-xl
              border
              text-sm
              font-semibold
              transition-all
              duration-200
            `,
            darkMode
              ? `
                bg-zinc-900
                border-zinc-800
                text-white
                hover:bg-zinc-800
              `
              : `
                bg-white
                border-zinc-200
                text-zinc-900
                hover:bg-zinc-100
              `
          )}
        >
          A-
        </KitchenToolbarButton>

        <KitchenToolbarButton
          onClick={onIncreaseFont}
          className={cn(
            `
              h-10
              min-w-[44px]
              rounded-xl
              border
              text-sm
              font-semibold
              transition-all
              duration-200
            `,
            darkMode
              ? `
                bg-zinc-900
                border-zinc-800
                text-white
                hover:bg-zinc-800
              `
              : `
                bg-white
                border-zinc-200
                text-zinc-900
                hover:bg-zinc-100
              `
          )}
        >
          A+
        </KitchenToolbarButton>

        <KitchenToolbarButton
          onClick={onHistory}
          className={cn(
            `
              h-10
              px-4
              rounded-xl
              border
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              transition-all
              duration-200
            `,
            darkMode
              ? `
                bg-zinc-900
                border-zinc-800
                text-white
                hover:bg-zinc-800
              `
              : `
                bg-white
                border-zinc-200
                text-zinc-900
                hover:bg-zinc-100
              `
          )}
        >
          <History size={16} />

          <span className="hidden sm:block">
            注文履歴
          </span>
        </KitchenToolbarButton>

        <button
          onClick={toggleDarkMode}
          className={cn(
            `
              h-10
              w-10
              rounded-xl
              border
              flex
              items-center
              justify-center
              transition-all
              duration-200
            `,
            darkMode
              ? `
                bg-zinc-900
                border-zinc-800
                text-white
                hover:bg-zinc-800
              `
              : `
                bg-white
                border-zinc-200
                text-zinc-900
                hover:bg-zinc-100
              `
          )}
        >
          {darkMode ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>
      </div>
    </div>
  );
});