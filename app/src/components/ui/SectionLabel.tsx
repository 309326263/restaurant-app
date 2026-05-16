"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
          px-3
          py-2
          text-xs
          font-semibold
          border-b
        `,
        theme.border.default,
        "text-zinc-700 dark:text-zinc-300",
        className
      )}
    >
      {children}
    </div>
  );
}