"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Panel } from "../layout/panel";
import { useTheme } from "../theme/theme";

type MenuLayoutProps = {
  header?: ReactNode;

  categories: ReactNode;
  products: ReactNode;

  /**
   * Control de layout (hereda idea de MenuPanel actual)
   */
  sidebarMode?: "vertical" | "horizontal";

  /**
   * Opcional: acciones del header
   */
  actions?: ReactNode;
};

export function MenuLayout({
  header,
  categories,
  products,
  actions,
  sidebarMode = "vertical",
}: MenuLayoutProps) {
  const { theme } = useTheme();

  return (
    <Panel
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            {header}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      }
      sidebar={
        <div
          className={cn(
            "h-full w-full",
            sidebarMode === "horizontal"
              ? "flex flex-row overflow-x-auto"
              : "flex flex-col overflow-y-auto"
          )}
        >
          {categories}
        </div>
      }
    >
      {/* PRODUCTS AREA */}
      <div
        className="h-full w-full overflow-hidden"
        style={{
          backgroundColor: theme.surface2,
        }}
      >
        {products}
      </div>
    </Panel>
  );
}