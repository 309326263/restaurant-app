import { prisma } from "@/lib/prisma";

type OrderItemInput = any;
type UpdateOrderItemInput = any;

export async function addItemsToOrder(
  orderId: number,
  items: OrderItemInput[]
) {
  for (const item of items) {
    const quantity = Number(item.quantity ?? 1);
    const unitPrice = Number(item.unitPrice ?? 0);
    const displayName = String(item.displayName || "Item").trim() || "Item";

    const itemType =
      item.type === "CUSTOM" ? "CUSTOM" : "PRODUCT";

    const existing = await prisma.orderItem.findFirst({
      where: {
        orderId,
        productId: item.productId ?? null,
        displayName,
        unitPrice,
        variantName: item.variantName ?? null,
        station: item.station,
        type: itemType,
        status: "PENDING",
      },
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          notes: item.notes ?? item.note ?? existing.notes,
        },
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId,
          productId: item.productId ?? null,
          quantity,
          unitPrice,
          displayName,
          station: item.station,
          variantName: item.variantName ?? null,
          notes: item.notes ?? item.note ?? null,
          type: itemType,
          status: "PENDING",
        },
      });
    }
  }
}

export async function updateOrderItem(
  itemId: number,
  data: UpdateOrderItemInput
) {
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
