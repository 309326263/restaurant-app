"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/app/stores/uiStore";

type Props = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  modals?: ReactNode;
};

export function AppShell({ left, center, right, modals }: Props) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">

      {/* LEFT */}
      <aside
        className={cn(
          "h-full border-r transition-all duration-300",
          sidebarCollapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {left}
      </aside>

      {/* CENTER */}
      <main className="flex-1 h-full overflow-hidden bg-background">
        {center}
      </main>

      {/* RIGHT */}
      <aside className="w-[360px] h-full border-l overflow-hidden">
        {right}
      </aside>

      {/* MODALS */}
      {modals}
    </div>
  );
}