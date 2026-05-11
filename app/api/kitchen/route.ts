import { prisma } from "@/lib/prisma";
import { getKitchenView } from "@/server/services/kitchenState.service";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      table: true,
    },
    orderBy: [
      { lastSentAt: "asc" }, // 🔥 prioridad por envío
      { createdAt: "asc" },  // fallback
    ],
  });

  const formatted = await Promise.all(
    orders.map(async (order) => {
      const kitchenView = await getKitchenView(order.id);

      const items = kitchenView
        ? [
            ...kitchenView.stations.KITCHEN.SENT,
            ...kitchenView.stations.KITCHEN.IN_PROGRESS,
            ...kitchenView.stations.BAR.SENT,
            ...kitchenView.stations.BAR.IN_PROGRESS,
          ]
        : [];

      return {
        ...order,
        items,
        kitchenView,
      };
    })
  );

  return Response.json(formatted);
}