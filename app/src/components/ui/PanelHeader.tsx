"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
          h-[60px]
          shrink-0
          border-b
          px-4
          flex
          items-center
          justify-between
          gap-3
        `,
        theme.surface.panel,
        theme.border.default,
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight">
          {title}
        </h2>

        {description && (
          <p
            className={cn(
              "text-[11px] mt-0.5",
              theme.text.secondary
            )}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}