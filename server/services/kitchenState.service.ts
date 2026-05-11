import { prisma } from "@/lib/prisma";

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
  } as Record<KitchenStation, Record<KitchenStatus, any[]>>;
}

export async function getKitchenView(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          ticket: true,
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
      ...item,
      ticketId: item.ticketId,
      displayName: item.variantName
        ? `${item.product?.name || item.customName} - ${item.variantName}`
        : item.product?.name || item.customName,
    });
  }

  return {
    orderId,
    stations: state,
  };
}
