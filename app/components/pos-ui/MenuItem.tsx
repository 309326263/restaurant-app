import { motion } from "framer-motion";

export function MenuItem({
  name,
  price,
  onClick,
}: {
  name: string;
  price: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="
        w-full text-left p-3 rounded-lg
        bg-[var(--bg-panel)]
        hover:bg-[var(--bg-elevated)]
        transition
      "
    >
      <div className="flex justify-between">
        <span>{name}</span>
        <span className="text-sm opacity-60">${price}</span>
      </div>
    </motion.button>
  );
}