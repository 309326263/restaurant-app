"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Panel } from "../layout/panel";
import { useTheme } from "../theme/theme";

type OrderLayoutProps = {
  /**
   * Barra superior (navbar de acciones)
   */
  header?: ReactNode;

  /**
   * Lista de entidades principales (mesas / tickets / orders)
   */
  primary?: ReactNode;

  /**
   * Área de detalle o contenido expandido (orders/items)
   */
  secondary?: ReactNode;

  /**
   * Layout mode futuro (flexibilidad para Kitchen evolutivo)
   */
  variant?: "split" | "stacked";
};

export function OrderLayout({
  header,
  primary,
  secondary,
  variant = "split",
}: OrderLayoutProps) {
  const { theme } = useTheme();

  return (
    <Panel
      header={header}
    >
      {/* BODY */}
      <div className="flex h-full w-full overflow-hidden">
        
        {/* PRIMARY (mesas / tickets / lista principal) */}
        <div
          className={cn(
            "h-full overflow-auto",
            variant === "split"
              ? "w-[280px] shrink-0 border-r"
              : "w-full"
          )}
          style={{ borderColor: theme.border }}
        >
          {primary}
        </div>

        {/* SECONDARY (orders / items / detalle) */}
        {variant === "split" && secondary && (
          <div
            className="flex-1 h-full overflow-auto"
            style={{
              backgroundColor: theme.surface2,
            }}
          >
            {secondary}
          </div>
        )}
      </div>
    </Panel>
  );
}