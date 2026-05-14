import { motion } from "framer-motion";
import { PosButton } from "./PosButton";

export function OrderItem({
  displayName,
  quantity,
  unitPrice,
  onRemove,
}: {
  displayName: string;
  quantity: number;
  unitPrice: number;
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
        <div className="font-medium">{displayName}</div>
        <div className="text-xs opacity-60">
          {quantity} x ${unitPrice}
        </div>
      </div>

      <PosButton variant="cancel" onClick={onRemove}>
        X
      </PosButton>
    </motion.div>
  );
}
