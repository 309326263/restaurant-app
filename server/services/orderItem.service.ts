import { prisma } from "@/lib/prisma";

type OrderItemInput = any;
type UpdateOrderItemInput = any;

export async function addItemsToOrder(orderId: number, items: OrderItemInput[]) {
  for (const item of items) {
    const existing = await prisma.orderItem.findFirst({
      where: {
        orderId,
        productId: item.productId ?? null,
        customName: item.customName ?? null,
        variantName: item.variantName || null,
        status: "PENDING",
      },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + item.quantity,
          notes: item.note ?? existing.notes,
        },
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId: orderId,
          productId: item.productId ?? null,
          customName: item.customName ?? null,
          customPrice: item.customPrice ?? null,
          quantity: item.quantity,
          variantName: item.variantName || null,
          variantPrice: item.variantPrice || 0,
          station: item.station,
          notes: item.notes ?? null,
        },
      });
    }
  }
}

export async function updateOrderItem(itemId: number, data: UpdateOrderItemInput) {
  await prisma.orderItem.update({
    where: {
      id: itemId,
    },
    data,
  });
}

export async function removeOrderItem(itemId: number) {
  await prisma.orderItem.delete({
    where: {
      id: itemId,
    },
  });
}
