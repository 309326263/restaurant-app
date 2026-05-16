export const kitchenMotion = {
  duration: "duration-[180ms]",
  ease: "ease-out",
  transition: "transition-all duration-[180ms] ease-out",
} as const;

export const kitchenRadius = {
  panel: "rounded-xl",
  card: "rounded-lg",
  button: "rounded-md",
  badge: "rounded-full",
} as const;

export const kitchenSurface = {
  surface: "bg-white text-black dark:bg-zinc-950 dark:text-white",
  surfaceAlt: "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white",
  surfaceHover: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
  dark: "bg-zinc-950 text-white",
  darkAlt: "bg-zinc-900 text-white",
  darkHover: "hover:bg-zinc-800",
  shell: "bg-[#070707] text-zinc-100",
  rail: "bg-[#0f0f10] text-zinc-100",
  nav: "bg-zinc-950/95 text-zinc-100",
  ticket: "bg-zinc-950 text-zinc-100",
} as const;

export const kitchenBorders = {
  border: "border border-zinc-200 dark:border-zinc-800",
  darkBorder: "border border-zinc-800",
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
} as const;

export const kitchenShadows = {
  card: "shadow-sm",
  panel: "shadow-2xl shadow-black/40",
  action: "shadow-sm",
} as const;

export const kitchenTypography = {
  item: "text-[length:var(--kitchen-font)] leading-tight",
  itemName: "font-semibold",
  itemQuantity: "font-bold",
  itemNote: "font-normal opacity-80",
  tableTitle: "text-lg font-bold leading-none",
  sectionTitle: "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400",
  badge: "text-xs font-bold uppercase tracking-wide",
  action: "text-sm font-bold leading-none",
  itemTime: "text-[0.72em] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400",
  osTitle: "text-sm font-black uppercase tracking-[0.18em]",
  tableButton: "text-sm font-bold leading-tight",
} as const;

export const kitchenStatusColors = {
  surface: "bg-white text-black dark:bg-zinc-950 dark:text-white",
  surfaceAlt: "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-white",
  surfaceHover: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
  border: "border-zinc-200 dark:border-zinc-800",

  sent: "bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300",
  inProgress: "bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-500/10 dark:text-blue-300",
  inProgressSurface: "bg-blue-50 dark:bg-blue-500/5",
  done: "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300",
  doneSurface: "bg-emerald-50 dark:bg-emerald-500/5",

  warning: "bg-amber-500 text-black border-amber-600",
  danger: "bg-red-600 text-white border-red-700 hover:bg-red-700",

  primaryAction: "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700",
  secondaryAction: "border-zinc-300 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghostAction: "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  neutral: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",

  new: "border-blue-500/70 bg-blue-500/10",
  alert: "border-orange-500/80 bg-orange-500/10",
  critical: "border-red-500/80 bg-red-500/10",
  reservation: "border-purple-500/80 bg-transparent",
  reservationActive: "border-purple-500/80 bg-purple-500/10",

  checkOff: "border-zinc-600 bg-zinc-800 text-transparent",
  checkOn: "border-emerald-500 bg-emerald-500 text-white",
} as const;

export const kitchenLayout = {
  shell:
    "grid h-screen overflow-hidden bg-[#070707] text-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 [grid-template-columns:180px_minmax(0,1fr)]",

  tablesRail:
    "flex h-screen min-h-0 flex-col border-r border-zinc-800 bg-[#0f0f10] dark:border-zinc-800 dark:bg-zinc-900",

  tablesHeader: "shrink-0 border-b border-zinc-800 px-3 py-3 dark:border-zinc-800",
  tablesList: "min-h-0 flex-1 space-y-2 overflow-y-auto p-2",

  workArea: "relative flex h-screen min-h-0 min-w-0 flex-col",

  nav:
    "z-30 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/90",

  navCollapsed: "pointer-events-none absolute right-3 top-3 z-50",

  ordersViewport: "min-h-0 min-w-0 flex-1 overflow-hidden",

  horizontalCanvas:
    "h-full min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth",

  horizontalTrack: "flex h-full w-max items-stretch gap-3 p-3",

  gridCanvas:
    "h-full min-w-0 overflow-auto scroll-smooth p-3",

  gridTrack:
    "grid auto-cols-[320px] grid-flow-col grid-rows-[repeat(auto-fill,minmax(240px,max-content))] items-start gap-3",

  orderWrap: "h-full shrink-0",

  floatingControls:
    "pointer-events-none absolute inset-y-0 left-0 right-0 z-40 flex items-center justify-between px-3",
} as const;