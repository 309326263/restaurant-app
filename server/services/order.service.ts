import { prisma } from "@/lib/prisma";

type CreateOrderInput = {
  tableId: unknown;
  items: any[];
};

export async function createOrder({ tableId, items }: CreateOrderInput) {
  return prisma.order.create({
    data: {
      tableId,
      status: "OPEN",
      items: {
        create: items.map((item: any) => ({
          type: item.isCustom ? "CUSTOM" : "PRODUCT",
          productId:
            item.productId && !isNaN(Number(item.productId))
              ? Number(item.productId)
              : null,
          customName: item.customName ?? null,
          customPrice: item.customPrice ?? null,
          quantity: item.quantity ?? item.qty ?? 1,
          variantName: item.variantName ?? null,
          variantPrice: item.variantPrice ?? null,
          station: item.station,
          status: "PENDING",
          notes: item.notes ?? null,
        })),
      },
    },
  });
}
