import { motion } from "framer-motion";
import { PosButton } from "./PosButton";

export function OrderItem({
  name,
  qty,
  price,
  onRemove,
}: {
  name: string;
  qty: number;
  price: number;
  onRemove?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex justify-between items-center p-2 rounded bg-[var(--bg-panel)]"
    >
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs opacity-60">
          {qty} x ${price}
        </div>
      </div>

      <PosButton variant="cancel" onClick={onRemove}>
        X
      </PosButton>
    </motion.div>
  );
}