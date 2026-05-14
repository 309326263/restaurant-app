"use client";

import { useUiStore } from "@/app/stores/uiStore";
import { ReactNode } from "react";

export function HomeLayout({
  tablesPanel,
  menuPanel,
  cartPanel,
  modals,
}: {
  tablesPanel: ReactNode;
  menuPanel: ReactNode;
  cartPanel: ReactNode;
  modals?: ReactNode;
}) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground">

      {/* LEFT */}
      <div className={sidebarCollapsed ? "w-[80px] h-full" : "w-[260px] h-full"}>
        {tablesPanel}
      </div>

      {/* CENTER */}
      <div className="flex-1 h-full overflow-hidden">
        {menuPanel}
      </div>

      {/* RIGHT */}
      <div className="w-[360px] h-full border-l">
        {cartPanel}
      </div>

      {modals}
    </div>
  );
}