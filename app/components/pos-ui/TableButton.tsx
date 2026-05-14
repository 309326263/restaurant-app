"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useUiStore } from "@/app/stores/uiStore";

type Props = {
  active?: boolean;
  status?: "FREE" | "OCCUPIED" | "RESERVED";
  tableId?: number;
  collapsed?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function TableButton({
  active = false,
  status = "FREE",
  tableId,
  collapsed = false,
  onClick,
  children,
}: Props) {
  const { newOrderTables } = useUiStore();

  const isNew = tableId ? newOrderTables?.[tableId] : false;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        "w-full min-h-[56px] rounded-md font-semibold transition-all mb-2 flex items-center justify-between relative overflow-hidden shrink-0",

        // 👇 SOLO CAMBIO DE ALTURA / NO MÁS ENCOGIMIENTO
        collapsed ? "px-2 py-3 justify-center" : "px-3 py-3 justify-between",

        // BASE COLORS
        status === "FREE" && "bg-green-100 text-green-900",
        status === "OCCUPIED" && "bg-orange-100 text-orange-900",
        status === "RESERVED" && "bg-purple-100 text-purple-900",

        // ACTIVE STATE
        active && status === "FREE" && "bg-green-300",
        active && status === "OCCUPIED" && "bg-orange-300",
        active && status === "RESERVED" && "bg-purple-300",

        "hover:opacity-90 active:scale-[0.98]"
      )}
    >
      {/* 🔥 NEW ORDER BADGE */}
      {isNew && (
        <span className="absolute top-1 right-2 text-[10px] bg-red-500 text-white px-1 rounded animate-pulse z-10">
          🔥 NEW
        </span>
      )}

      {/* 🔴 GLOW EFFECT (POS FEEDBACK) */}
      {isNew && (
        <motion.div
          className="absolute inset-0 bg-red-500/10"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}

      {children}
    </motion.button>
  );
}