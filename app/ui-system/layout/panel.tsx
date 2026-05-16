"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Surface } from "../primitives/Surface";
import { useTheme } from "../theme/theme";

type PanelProps = {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;

  /**
   * Layout mode del panel
   */
  variant?: "default" | "full" | "split";
};

export function Panel({
  header,
  sidebar,
  children,
  variant = "default",
}: PanelProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col overflow-hidden",
        "transition-colors duration-200"
      )}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
    >
      {/* HEADER */}
      {header && (
        <div
          className={cn(
            "shrink-0 border-b",
            "flex items-center justify-between",
            "px-4 h-[56px]"
          )}
          style={{ borderColor: theme.border }}
        >
          {header}
        </div>
      )}

      {/* BODY */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* SIDEBAR */}
        {sidebar && (
          <div
            className={cn(
              "shrink-0 border-r overflow-y-auto",
              "w-[260px]"
            )}
            style={{ borderColor: theme.border }}
          >
            {sidebar}
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Surface
            variant="flat"
            padding="none"
            className="h-full w-full overflow-auto rounded-none border-0"
          >
            {children}
          </Surface>
        </div>
      </div>
    </div>
  );
}