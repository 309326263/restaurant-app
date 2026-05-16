"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input base del Design System
 * - sin lógica de dominio
 * - sin Kitchen / POS / Menu awareness
 * - completamente reutilizable
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border",
          "bg-transparent px-3 py-2 text-sm",
          "transition-colors",
          "outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // focus system (estándar POS)
          "focus:ring-2 focus:ring-[var(--color-accent)]",

          // border + text via theme variables
          "border-[var(--color-border)]",
          "text-[var(--color-text)]",

          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";