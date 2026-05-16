"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function RowItem({
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
          flex
          items-center
          min-h-11
          px-3
          border-b
          last:border-b-0
        `,
        theme.border.default,
        theme.surface.nested,
        className
      )}
    >
      {children}
    </div>
  );
}