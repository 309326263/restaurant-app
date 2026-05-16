"use client";

import { Check } from "lucide-react";
import { memo } from "react";
import type {
  KitchenItem as KitchenItemType,
  KitchenItemAction,
} from "@/app/types/kitchen";
import {
  kitchenMotion,
  kitchenStatusColors,
  kitchenTypography,
} from "@/app/components/ui/kitchen/tokens";
import { cn } from "@/lib/cn";

type KitchenItemProps = {
  item: KitchenItemType;
  isPending: boolean;
  onUpdateItem: (
    itemId: number,
    action: KitchenItemAction
  ) => void;
};

function formatTime(value: string | null) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const KitchenItem = memo(function KitchenItem({
  item,
  isPending,
  onUpdateItem,
}: KitchenItemProps) {
  const isChecked = item.status === "IN_PROGRESS";
  const action: KitchenItemAction = isChecked ? "complete" : "start";
  const variant = item.variantName?.trim();
  const note = item.notes?.trim();

  return (
    <button
      className={cn(
        "grid w-full grid-cols-[46px_minmax(0,1fr)_34px] items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-2 text-left text-zinc-100",
        kitchenMotion.transition,
        kitchenTypography.item,
        "hover:border-zinc-600 hover:bg-zinc-800/95",
        isPending && "pointer-events-none cursor-default opacity-60"
      )}
      disabled={isPending}
      onClick={() => onUpdateItem(item.id, action)}
      type="button"
    >
      <span className={kitchenTypography.itemTime}>
        {formatTime(item.sentAt)}
      </span>

      <span className="min-w-0">
        <span className={cn(kitchenTypography.itemQuantity, "mr-1.5 text-zinc-50")}>
          {item.quantity}
        </span>

        <span className={cn(kitchenTypography.itemName, "text-zinc-50")}>
          {item.displayName.trim()}
        </span>

        {variant ? (
          <span className="ml-1.5 font-semibold text-zinc-400">
            - {variant}
          </span>
        ) : null}

        {note ? (
          <span className={cn(kitchenTypography.itemNote, "ml-1.5 text-amber-200")}>
            - {note}
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          "ml-auto inline-flex size-7 items-center justify-center rounded-md border",
          kitchenMotion.transition,
          isChecked
            ? kitchenStatusColors.checkOn
            : kitchenStatusColors.checkOff
        )}
      >
        <Check size={17} strokeWidth={3} />
      </span>
    </button>
  );
});