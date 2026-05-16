"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function PrimaryButton({
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
          h-12
          px-5
          rounded-2xl
          font-semibold
          text-sm
          transition-all
          duration-200
        `,
        theme.status.accent,
        className
      )}
    >
      {children}
    </button>
  );
}