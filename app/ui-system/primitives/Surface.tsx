"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "../theme/theme";

type SurfaceProps = {
  children: ReactNode;
  className?: string;

  /**
   * Nivel visual del contenedor
   * base = default card
   * elevated = más profundidad (modals, panels importantes)
   * flat = sin sombra, más “UI limpia”
   */
  variant?: "base" | "elevated" | "flat";

  /**
   * Padding interno estándar del sistema
   */
  padding?: "none" | "sm" | "md" | "lg";

  /**
   * Bordes del sistema
   */
  border?: boolean;
};

export function Surface({
  children,
  className,
  variant = "base",
  padding = "md",
  border = true,
}: SurfaceProps) {
  const { theme } = useTheme();

  const base = [
    "transition-colors duration-200",
    "rounded-xl",
    "w-full",
  ];

  const variants = {
    base: "shadow-sm",
    elevated: "shadow-lg",
    flat: "shadow-none",
  };

  const paddings = {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  const styles = {
    backgroundColor: theme.surface,
    color: theme.text,
    borderColor: theme.border,
  };

  return (
    <div
      className={cn(
        base,
        variants[variant],
        paddings[padding],
        border && "border",
        className
      )}
      style={styles}
    >
      {children}
    </div>
  );
}