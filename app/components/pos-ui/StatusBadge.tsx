import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
}: {
  status: "free" | "occupied" | "reserved";
}) {
  return (
    <span
      className={cn(
        "text-xs px-2 py-1 rounded-full",

        status === "free" && "bg-green-500/20 text-green-400",
        status === "occupied" && "bg-red-500/20 text-red-400",
        status === "reserved" && "bg-yellow-500/20 text-yellow-400"
      )}
    >
      {status}
    </span>
  );
}