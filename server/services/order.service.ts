import { prisma } from "@/lib/prisma";

type CreateOrderInput = {
  tableId: unknown;
  items: any[];
};

export async function createOrder({
  tableId,
  items,
}: CreateOrderInput) {
  return prisma.order.create({
    data: {
      tableId,
      status: "OPEN",
      items: {
        create: items.map((item: any) => ({
          type:
            item.type === "CUSTOM"
              ? "CUSTOM"
              : "PRODUCT",
          productId:
            item.productId &&
            !isNaN(Number(item.productId))
              ? Number(item.productId)
              : null,
          quantity: Number(item.quantity ?? 1),
          unitPrice: Number(item.unitPrice ?? 0),
          displayName:
            String(item.displayName || "Item").trim() ||
            "Item",
          variantName: item.variantName ?? null,
          station: item.station,
          status: "PENDING",
          notes: item.notes ?? item.note ?? null,
        })),
      },
    },
  });
}
