export type KitchenEvent =
  | { type: "item.updated"; orderId: number; itemId: number }
  | { type: "order.updated"; orderId: number }
  | { type: "heartbeat" };
