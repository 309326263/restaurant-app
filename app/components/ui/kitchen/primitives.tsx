import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  kitchenBorders,
  kitchenMotion,
  kitchenRadius,
  kitchenShadows,
  kitchenStatusColors,
  kitchenSurface,
  kitchenTypography,
} from "./tokens";

type KitchenSurfaceCardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "surface" | "surfaceAlt";
  interactive?: boolean;
  pending?: boolean;
};

export function KitchenSurfaceCard({
  className,
  variant = "surface",
  interactive = false,
  pending = false,
  ...props
}: KitchenSurfaceCardProps) {
  return (
    <div
      className={cn(
        kitchenRadius.card,
        kitchenShadows.card,
        kitchenMotion.transition,
        variant === "surface" && kitchenSurface.surface,
        variant === "surfaceAlt" && kitchenSurface.surfaceAlt,
        interactive && kitchenSurface.surfaceHover,
        pending && "cursor-default opacity-60",
        className
      )}
      {...props}
    />
  );
}

type KitchenPanelProps = ComponentPropsWithoutRef<"section"> & {
  variant?: "dark" | "surface";
};

export function KitchenPanel({
  className,
  variant = "dark",
  ...props
}: KitchenPanelProps) {
  return (
    <section
      className={cn(
        kitchenRadius.panel,
        kitchenShadows.panel,
        variant === "dark" && kitchenSurface.darkAlt,
        variant === "surface" && kitchenSurface.surface,
        className
      )}
      {...props}
    />
  );
}

type KitchenActionButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "danger" | "ghost" | "secondary";
  size?: "sm" | "md";
  pending?: boolean;
};

export function KitchenActionButton({
  className,
  variant = "primary",
  size = "sm",
  pending = false,
  disabled,
  ...props
}: KitchenActionButtonProps) {
  const isDisabled = disabled || pending;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border",
        kitchenRadius.button,
        kitchenTypography.action,
        kitchenMotion.transition,
        kitchenBorders.focus,
        kitchenShadows.action,
        size === "sm" && "min-h-8 px-3 py-2",
        size === "md" && "min-h-10 px-4 py-2.5",
        variant === "primary" && kitchenStatusColors.primaryAction,
        variant === "danger" && kitchenStatusColors.danger,
        variant === "ghost" && kitchenStatusColors.ghostAction,
        variant === "secondary" && kitchenStatusColors.secondaryAction,
        isDisabled && "pointer-events-none cursor-default opacity-60",
        className
      )}
      disabled={isDisabled}
      {...props}
    />
  );
}

type KitchenBadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: "sent" | "inProgress" | "done" | "warning" | "danger" | "neutral";
};

export function KitchenBadge({
  className,
  variant = "neutral",
  ...props
}: KitchenBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5",
        kitchenRadius.badge,
        kitchenTypography.badge,
        variant === "sent" && kitchenStatusColors.sent,
        variant === "inProgress" && kitchenStatusColors.inProgress,
        variant === "done" && kitchenStatusColors.done,
        variant === "warning" && kitchenStatusColors.warning,
        variant === "danger" && kitchenStatusColors.danger,
        variant === "neutral" && kitchenStatusColors.neutral,
        className
      )}
      {...props}
    />
  );
}

type KitchenToolbarButtonProps = KitchenActionButtonProps;

export function KitchenToolbarButton(props: KitchenToolbarButtonProps) {
  return <KitchenActionButton variant="ghost" size="sm" {...props} />;
}

type KitchenSectionTitleProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function KitchenSectionTitle<T extends ElementType = "div">({
  as,
  className,
  ...props
}: KitchenSectionTitleProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(kitchenTypography.sectionTitle, className)}
      {...props}
    />
  );
}

type KitchenEmptyStateProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "surface" | "dark";
};

export function KitchenEmptyState({
  className,
  variant = "surface",
  ...props
}: KitchenEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-24 items-center justify-center px-4 py-6 text-center text-sm",
        kitchenRadius.card,
        variant === "surface" && "bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
        variant === "dark" && "bg-zinc-900 text-zinc-400",
        className
      )}
      {...props}
    />
  );
}

type KitchenScrollableAreaProps = ComponentPropsWithoutRef<"div"> & {
  axis?: "x" | "y" | "both";
};

export function KitchenScrollableArea({
  className,
  axis = "y",
  ...props
}: KitchenScrollableAreaProps) {
  return (
    <div
      className={cn(
        axis === "x" && "overflow-x-auto overflow-y-hidden",
        axis === "y" && "overflow-y-auto overflow-x-hidden",
        axis === "both" && "overflow-auto",
        className
      )}
      {...props}
    />
  );
}