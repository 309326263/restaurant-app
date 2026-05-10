import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      table: true,
      items: {
        where: {
          status: "SENT",
        },
        include: {
          product: true,
          ticket: true, // 🔥 ESTO FALTABA
        },
      },
    },
    orderBy: [
      { lastSentAt: "asc" }, // 🔥 prioridad por envío
      { createdAt: "asc" },  // fallback
    ],
  });

  const formatted = orders.map((order) => ({
    ...order,
    items: order.items.map((i) => ({
      ...i,
      ticketId: i.ticketId, // 🔥 asegurar que llega
      displayName: i.variantName
        ? `${i.product?.name || i.customName} - ${i.variantName}`
        : i.product?.name || i.customName,
    })),
  }));

  return Response.json(formatted);
}