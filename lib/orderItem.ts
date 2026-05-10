export function getItemName(item: any) {
  return item.product?.name || item.customName || "Sin nombre";
}

export function getItemPrice(item: any) {
  return (
    item.customPrice ??
    item.product?.price ??
    0
  );
}

export function getItemStation(item: any) {
  return item.station || item.product?.station || "KITCHEN";
}

export function isCustomItem(item: any) {
  return !item.productId;
}