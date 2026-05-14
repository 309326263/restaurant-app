import { cva } from "class-variance-authority";

export const tableButtonVariants = cva(
  "w-full font-semibold rounded-md transition-all flex items-center justify-between",
  {
    variants: {
      status: {
        FREE: "",
        OCCUPIED: "",
        RESERVED: "",
      },
      active: {
        true: "",
        false: "",
      },
      collapsed: {
        true: "p-2 justify-center",
        false: "p-3 mb-2",
      },
    },
  }
);