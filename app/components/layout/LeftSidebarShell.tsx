"use client";

import { useUiStore } from "@/app/stores/uiStore";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ChefHat,
  History,
  Package,
} from "lucide-react";

type Props = {
  children: ReactNode;
};
import { theme } from "@/app/src/lib/ui/theme";
export function LeftSidebarShell({ children }: Props) {
  const {
    sidebarCollapsed,
    navbarOpen,
    toggleSidebar,
    toggleNavbar,
  } = useUiStore();

  const {
    tableSelectionError,
  } = useUiStore();

  return (
    <div
      className={cn(
        "relative h-full flex flex-col overflow-hidden transition-all duration-300",
        "border-r bg-background text-foreground",
        sidebarCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* HEADER */}
      <div className="h-[60px] flex items-center justify-between px-3 border-b shrink-0 bg-background z-10">

        {!sidebarCollapsed && (
          <div className="font-bold text-lg whitespace-nowrap">
            SatoSan
          </div>
        )}

        <div className="flex items-center gap-2">

          <button
            onClick={toggleNavbar}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <div
  className={cn(
    theme.surface.card,
    theme.border.default,
    "flex-1 min-h-0 relative",

    tableSelectionError && [
      "border-red-500/70",
      "shadow-[0_0_0_1px_rgba(239,68,68,0.45)]",
      "bg-red-500/5",
      "transition-all duration-300",
      "animate-[tableShake_420ms_ease]",
    ]
  )}
>

        {/* TABLES SCROLL */}
        <div className="h-full overflow-y-auto p-2">
          {children}
        </div>

        {/* NAVBAR OVERLAY */}
        <AnimatePresence>
          {navbarOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 z-50 overflow-hidden",
                "bg-background",
                "border-r border-border",
                "shadow-2xl"
              )}
            >
              <div className="p-4 space-y-3">

                <button
                  className={cn(
                    "w-full rounded-md hover:bg-muted transition-colors",
                    "flex items-center",
                    sidebarCollapsed
                      ? "justify-center h-[56px]"
                      : "gap-3 p-3 text-sm font-medium"
                  )}
                >
                  <LayoutDashboard size={18} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                <button
                  className={cn(
                    "w-full rounded-md hover:bg-muted transition-colors",
                    "flex items-center",
                    sidebarCollapsed
                      ? "justify-center h-[56px]"
                      : "gap-3 p-3 text-sm font-medium"
                  )}
                >
                  <ChefHat size={18} />
                  {!sidebarCollapsed && <span>Cocina</span>}
                </button>

                <button
                  className={cn(
                    "w-full rounded-md hover:bg-muted transition-colors",
                    "flex items-center",
                    sidebarCollapsed
                      ? "justify-center h-[56px]"
                      : "gap-3 p-3 text-sm font-medium"
                  )}
                >
                  <History size={18} />
                  {!sidebarCollapsed && <span>Historial</span>}
                </button>

                <button
                  className={cn(
                    "w-full rounded-md hover:bg-muted transition-colors",
                    "flex items-center",
                    sidebarCollapsed
                      ? "justify-center h-[56px]"
                      : "gap-3 p-3 text-sm font-medium"
                  )}
                >
                  <Package size={18} />
                  {!sidebarCollapsed && <span>Productos</span>}
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}