"use client";

import { History } from "lucide-react";
import { memo } from "react";

type KitchenHeaderProps = {
  onHistory: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
};

export const KitchenHeader = memo(function KitchenHeader({
  onHistory,
  onDecreaseFont,
  onIncreaseFont,
}: KitchenHeaderProps) {
  return (
    <div className="kitchen-header-bar">
      <div className="kitchen-title">
        <span className="kitchen-icon">🍳</span>

        <span className="kitchen-text">Cocina</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginLeft: "auto",
        }}
      >
        <button
          onClick={onHistory}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "12px",
            border: "1px solid #3f3f46",
            background: "#27272a",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          <History size={18} />

          <span className="history-label">注文履歴</span>
        </button>

        <div className="kitchen-font-controls">
          <button onClick={onDecreaseFont}>A-</button>

          <button onClick={onIncreaseFont}>A+</button>
        </div>
      </div>
    </div>
  );
});
