"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border overflow-hidden",
        theme.surface.panel,
        theme.radius.panel,
        theme.motion.base,
        className
      )}
    >
      {children}
    </div>
  );
}