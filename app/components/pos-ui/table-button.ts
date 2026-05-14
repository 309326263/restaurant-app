import { cva } from "class-variance-authority";

export const tableButtonVariants = cva(
  [
    "w-full text-left font-semibold rounded-md transition-all",
    "flex items-center justify-between",
    "p-3 mb-2",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      status: {
        FREE: "bg-green-100 text-green-900 hover:bg-green-200",
        OCCUPIED: "bg-red-100 text-red-900 hover:bg-red-200",
        RESERVED: "bg-purple-100 text-purple-900 hover:bg-purple-200",
      },

      active: {
        true: "ring-2 ring-offset-2 ring-black/20",
        false: "",
      },

      collapsed: {
        true: "p-2 justify-center text-center",
        false: "",
      },
    },

    defaultVariants: {
      status: "FREE",
      active: false,
      collapsed: false,
    },
  }
);