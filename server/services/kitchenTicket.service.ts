import { prisma } from "@/lib/prisma";
import {
  emitItemUpdated,
  emitOrderUpdated,
} from "@/server/events/kitchen.events";

export async function createKitchenTickets(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: true,
    },
  });

  if (!order) {
    return null;
  }

  const now = new Date();
  const pendingItems = order.items.filter(
    (item) => item.status === "PENDING"
  );

  const itemsByStation = pendingItems.reduce<
    Record<string, typeof pendingItems>
  >((acc, item) => {
    const station = item.station;
    if (!acc[station]) {
      acc[station] = [];
    }
    acc[station].push(item);
    return acc;
  }, {});

  /** Solo estos ítems deben ir a impresión (cocina / bar). */
  const printedItems: typeof order.items = [];

  for (const stationItems of Object.values(itemsByStation)) {
    if (!stationItems.length) {
      continue;
    }

    const ticket = await prisma.kitchenTicket.create({
      data: {
        orderId,
      },
    });

    await prisma.orderItem.updateMany({
      where: {
        id: {
          in: stationItems.map((item) => item.id),
        },
      },
      data: {
        status: "SENT",
        sentAt: now,
        ticketId: ticket.id,
      },
    });

    for (const item of stationItems) {
      printedItems.push({
        ...item,
        status: "SENT",
        sentAt: now,
        ticketId: ticket.id,
      });
      emitItemUpdated(orderId, item.id);
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      lastSentAt: now,
    },
  });

  emitOrderUpdated(orderId);

  const freshOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: true,
    },
  });

  return {
    order: freshOrder ?? order,
    printedItems,
  };
}
