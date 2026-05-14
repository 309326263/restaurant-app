import { prisma } from "@/lib/prisma";
import type { KitchenItem } from "@/app/types/kitchen";

type KitchenStatus = "PENDING" | "SENT" | "IN_PROGRESS" | "DONE";
type KitchenStation = "KITCHEN" | "BAR";

function createEmptyState() {
  return {
    KITCHEN: {
      PENDING: [],
      SENT: [],
      IN_PROGRESS: [],
      DONE: [],
    },
    BAR: {
      PENDING: [],
      SENT: [],
      IN_PROGRESS: [],
      DONE: [],
    },
  } as Record<KitchenStation, Record<KitchenStatus, KitchenItem[]>>;
}

export async function getKitchenView(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          ticket: true,
          product: {
            select: {
              categoryId: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const state = createEmptyState();

  for (const item of order.items) {
    const station = item.station as KitchenStation;
    const status = item.status as KitchenStatus;

    if (!state[station] || !state[station][status]) {
      continue;
    }

    state[station][status].push({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      status: item.status,
      station: item.station,
      variantName: item.variantName,
      variantPrice: item.variantPrice,
      ticketId: item.ticketId,
      sentAt: item.sentAt
        ? item.sentAt.toISOString()
        : null,
      notes: item.notes,
      type: item.type,
      displayName: item.displayName || "Item",
      categoryId: item.product?.categoryId ?? null,
      categoryName: item.product?.category?.name ?? null,
    });
  }

  return {
    orderId,
    stations: state,
  };
}
