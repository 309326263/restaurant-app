"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

export function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  className,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
          flex
          items-center
          border
          overflow-hidden
        `,
        theme.radius.card,
        theme.border.strong,
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={cn(
          `
            w-8
            h-8
            flex
            items-center
            justify-center
          `,
          theme.motion.fast,
          theme.hover.subtle
        )}
      >
        <Minus size={14} />
      </button>

      <div
        className={cn(
          `
            w-9
            text-center
            text-sm
            font-semibold
          `,
          theme.text.primary
        )}
      >
        {quantity}
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className={cn(
          `
            w-8
            h-8
            flex
            items-center
            justify-center
          `,
          theme.motion.fast,
          theme.hover.subtle
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}