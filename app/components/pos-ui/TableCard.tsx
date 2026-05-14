import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Table = {
  id: string;
  name: string;
  status: "free" | "occupied" | "reserved";
};

export function TableCard({
  table,
  active,
  onClick,
}: {
  table: Table;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer border transition",
        "bg-[var(--bg-panel)]",

        table.status === "free" && "border-green-500/40",
        table.status === "occupied" && "border-red-500/40",
        table.status === "reserved" && "border-yellow-500/40",

        active && "ring-2 ring-[var(--brand-primary)]"
      )}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">{table.name}</span>
        <span className="text-xs opacity-60">{table.status}</span>
      </div>

      {active && (
        <motion.div
          layoutId="activeTableGlow"
          className="absolute inset-0 rounded-lg border border-[var(--brand-primary)] opacity-30"
        />
      )}
    </motion.div>
  );
}