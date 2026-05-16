export const theme = {
  surface: {


    card: `
        bg-card
        border
        border-border
        rounded-2xl
    `,
    page: `
      bg-zinc-100
      text-zinc-900

      dark:bg-zinc-950
      dark:text-white
    `,

    panel: `
      bg-white
      border-zinc-200

      dark:bg-zinc-900
      dark:border-zinc-800
    `,

    nested: `
      bg-zinc-50
      border-zinc-200

      dark:bg-zinc-950
      dark:border-zinc-800
    `,

    elevated: `
      bg-white/90
      border-zinc-200
      backdrop-blur-xl

      dark:bg-zinc-900/90
      dark:border-zinc-800
    `,
  },

  text: {
    primary: `
      text-zinc-900
      dark:text-white
    `,

    secondary: `
      text-muted-foreground
      dark:text-zinc-400
    `,

    muted: `
      text-zinc-500
      dark:text-zinc-500
    `,
  },

  border: {
    default: `
      border-zinc-200
      dark:border-zinc-800
    `,

    strong: `
      border-zinc-300
      dark:border-zinc-700
    `,
  },

  hover: {
    subtle: `
      hover:bg-zinc-100
      dark:hover:bg-zinc-800
    `,

    card: `
      hover:border-zinc-300
      hover:shadow-sm

      dark:hover:border-zinc-700
    `,
  },

  status: {
    pending: `
      bg-amber-100
      text-amber-700

      dark:bg-amber-500/15
      dark:text-amber-300
    `,

    products: `
      bg-blue-100
      text-blue-700

      dark:bg-blue-500/15
      dark:text-blue-300
    `,

    kitchen: `
      bg-orange-100
      text-orange-700

      dark:bg-orange-500/15
      dark:text-orange-300
    `,

    bar: `
      bg-cyan-100
      text-cyan-700

      dark:bg-cyan-500/15
      dark:text-cyan-300
    `,

    success: `
      bg-emerald-100
      text-emerald-700

      dark:bg-emerald-500/15
      dark:text-emerald-300
    `,

    danger: `
      bg-red-50
      border-red-200
      text-red-600

      dark:bg-red-500/10
      dark:border-red-500/20
      dark:text-red-300
    `,

    accent: `
      bg-violet-600
      text-white
      hover:bg-violet-500

      dark:bg-violet-500
      dark:hover:bg-violet-400
    `,
  },

  radius: {
    panel: "rounded-2xl",
    card: "rounded-xl",
    item: "rounded-lg",
    small: "rounded-md",
  },

  motion: {
    fast: "transition-all duration-150",
    base: "transition-all duration-200",
  },
};