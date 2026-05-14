"use client";

import { memo } from "react";
import type {
  KitchenItem as KitchenItemType,
  KitchenItemAction,
} from "@/app/types/kitchen";

type KitchenItemProps = {
  item: KitchenItemType;
  isPending: boolean;
  onUpdateItem: (
    itemId: number,
    action: KitchenItemAction
  ) => void;
};

function pendingStyle(isPending: boolean) {
  return {
    opacity: isPending ? 0.6 : 1,
    cursor: isPending ? "default" : "pointer",
  };
}

export const KitchenItem = memo(function KitchenItem({
  item,
  isPending,
  onUpdateItem,
}: KitchenItemProps) {
  return (
    <div className="kitchen-item">
      <div
        style={{
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            marginRight: "8px",
          }}
        >
          {item.quantity}
        </span>

        <span>
          {item.displayName.trim()}
        </span>

        {item.notes?.trim() ? (
          <span
            style={{
              opacity: 0.8,
              fontWeight: 400,
            }}
          >
            {" "}— {item.notes.trim()}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "4px",
        }}
      >
        {item.status === "SENT" && (
          <button
            disabled={isPending}
            style={pendingStyle(isPending)}
            onClick={() =>
              onUpdateItem(item.id, "start")
            }
          >
            Empezar
          </button>
        )}

        {item.status === "IN_PROGRESS" && (
          <>
            <button
              disabled={isPending}
              style={pendingStyle(isPending)}
              onClick={() =>
                onUpdateItem(item.id, "complete")
              }
            >
              Terminar
            </button>

            <button
              disabled={isPending}
              style={pendingStyle(isPending)}
              onClick={() =>
                onUpdateItem(item.id, "revert")
              }
            >
              Revertir
            </button>
          </>
        )}
      </div>
    </div>
  );
});