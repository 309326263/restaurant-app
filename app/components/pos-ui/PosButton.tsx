import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button> & {
  variant?: "primary" | "danger" | "ghost";
};

export function PosButton({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <Button
      className={cn(
        "font-medium transition",

        // base visual del POS
        "rounded-lg",

        // variantes del sistema
        variant === "primary" &&
          "bg-[var(--brand-primary)] text-white hover:opacity-90",

        variant === "danger" &&
          "bg-[var(--danger)] text-white hover:opacity-90",

        variant === "ghost" &&
          "bg-transparent hover:bg-[var(--bg-elevated)]",

        className
      )}
      {...props}
    />
  );
}