"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

type Variant =
  | "pending"
  | "kitchen"
  | "bar"
  | "products"
  | "success"
  | "danger"
  | "accent";

export function StatusIcon({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant: Variant;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
          w-10
          h-10
          rounded-2xl
          flex
          items-center
          justify-center
        `,
        theme.status[variant],
        className
      )}
    >
      {children}
    </div>
  );
}