"use client";

import { Button } from "@/app/ui-system";
import { useUiLayout } from "../state/ui-layout.store";
import { useUiControl } from "../state/ui-control.store";

export function OpsNavbar() {
  const { fontScale, increaseFont, decreaseFont, sound, toggleSound } =
  useUiControl();

  const { layout, toggleLayout } = useUiLayout();
  return (
    <div className="h-[52px] flex items-center justify-between px-3 border-b bg-white">

      {/* LEFT */}
      <div className="font-semibold text-sm">
        OPS CENTER
      </div>

      {/* CENTER CONTROLS */}
      <div className="flex items-center gap-2">

        <button onClick={toggleLayout}>
          {layout === "rail" ? "Flow" : "Rail"}
        </button>

        <button onClick={decreaseFont}>A-</button>

        <button onClick={increaseFont}>A+</button>

        <button onClick={toggleSound}>
          {sound ? "🔊" : "🔇"}
        </button>

      </div>

      {/* RIGHT STATUS */}
      <div className="text-xs opacity-50">
        scale {fontScale.toFixed(1)}
      </div>

    </div>
  );
}