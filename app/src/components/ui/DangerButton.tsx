"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function DangerButton({
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
      type="button"
      onClick={onClick}
      className={cn(
        `
          w-8
          h-8
          shrink-0
          border
          flex
          items-center
          justify-center
        `,
        theme.radius.item,
        theme.motion.base,
        theme.status.danger,
        className
      )}
    >
      {children}
    </button>
  );
}