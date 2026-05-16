"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function IconButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          h-9
          w-9
          border
          flex
          items-center
          justify-center
        `,
        theme.radius.card,
        theme.motion.base,
        theme.surface.panel,
        theme.hover.subtle,
        className
      )}
    >
      {children}
    </button>
  );
}