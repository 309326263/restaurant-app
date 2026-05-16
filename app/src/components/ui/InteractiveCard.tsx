"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function InteractiveCard({
  active,
  children,
  className,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          group
          relative
          overflow-hidden
          border
          text-left
          w-full
        `,

        theme.radius.small,
        theme.motion.base,

        active
          ? `
            bg-white
            border-primary
            shadow-md
            ring-1
            ring-primary/10

            dark:bg-zinc-800
            dark:border-zinc-700
          `
          : `
            bg-white
            border-zinc-200
            hover:border-zinc-300
            hover:shadow-sm

            dark:bg-zinc-900
            dark:border-zinc-800
            dark:hover:bg-zinc-800
            dark:hover:border-zinc-700
          `,

        className
      )}
    >
      {children}
    </button>
  );
}