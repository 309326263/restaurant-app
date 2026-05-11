import { prisma } from "@/lib/prisma";
import { emitItemUpdated, emitOrderUpdated } from "@/server/events/kitchen.events";

export async function startItem(itemId: number) {
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { status: "IN_PROGRESS" },
  });

  emitItemUpdated(item.orderId, item.id);
  emitOrderUpdated(item.orderId);

  return item;
}

export async function completeItem(itemId: number) {
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { status: "DONE" },
  });

  emitItemUpdated(item.orderId, item.id);
  emitOrderUpdated(item.orderId);

  return item;
}

export async function revertItem(itemId: number) {
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { status: "SENT" },
  });

  emitItemUpdated(item.orderId, item.id);
  emitOrderUpdated(item.orderId);

  return item;
}
