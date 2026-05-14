/** Snapshot-only helpers for OrderItem / ticket lines (never read Product catalog). */

export function getItemName(i: any) {
  return i.displayName || "Item";
}

export function getItemPrice(i: any) {
  return Number(i.unitPrice || 0);
}

export function getItemQty(i: any) {
  return Number(i.quantity || 0);
}

export function getItemStation(item: any) {
  const st = String(
    item.station || "KITCHEN"
  )
    .trim()
    .toUpperCase();
  return st === "BAR" ? "BAR" : "KITCHEN";
}

export function isCustomItem(item: any) {
  return (
    item.isCustom === true ||
    item.type === "CUSTOM" ||
    item.productId == null
  );
}
