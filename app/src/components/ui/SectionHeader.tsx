"use client";

import { cn } from "@/lib/utils";
import { theme } from "@/app/src/lib/ui/theme";

const iconVariants = {
  default: `
  
    bg-zinc-100
    text-zinc-700
  `,
  bar: `
    bg-cyan-100
    text-cyan-700
  `,
  success: `
    bg-emerald-100
    text-emerald-700
  `,
  danger: `
    bg-red-100
    text-red-700
  `,
  warning: `
    bg-amber-100
    text-amber-700
  `,
};

type IconVariant = keyof typeof iconVariants;

export function SectionHeader({
  title,
  description,
  rightSlot,
  icon,
  className,
  iconVariant = "default",
}: {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  iconVariant?: IconVariant;
}) {
  return (
    <div
      className={cn(
        `
          h-14
          px-4
          border-b
          flex
          items-center
          justify-between
          gap-3
          
        `,
        theme.border.default,
        
      )}
    >
      <div className="flex items-center gap-3 min-w-0 ">
        {icon && (
          <div
            className={cn(
              `
                w-10
                h-10
                shrink-0
                flex
                items-center
                justify-center
                
                
              `,
              theme.radius.panel,
             
              
              
             //iconVariants[iconVariant]
            )}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight truncate">
            {title}
          </h3>

          {description && (
            <p
              className={cn(
                "text-[11px] mt-0.5 truncate",
                theme.text.secondary
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {rightSlot && (
        <div className="shrink-0 flex items-center gap-2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}