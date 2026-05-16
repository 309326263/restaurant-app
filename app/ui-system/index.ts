/**
 * UI SYSTEM - PUBLIC API
 * =======================
 *
 * Este archivo define la capa de exportación oficial del Design System.
 * Todo lo que el POS use debe salir desde aquí.
 */

// ======================
// Theme
// ======================
export { useTheme } from "./theme/theme";
export { getTheme } from "./theme/getTheme";

// ======================
// Tokens
// ======================
export * from "./tokens/colors";
export * from "./tokens/spacing";
export * from "./tokens/radius";

// ======================
// Primitives
// ======================
export { Surface } from "./primitives/Surface";

// ======================
// Components
// ======================
export { Button } from "./components/button";
export { Input } from "./components/input";

// ======================
// Layouts
// ======================
export { Panel } from "./layout/panel";

// ======================
// Patterns
// ======================
export { MenuLayout } from "./patterns/menu-layout";
export { OrderLayout } from "./patterns/order-layout";