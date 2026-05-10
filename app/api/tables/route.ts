import { prisma } from "@/lib/prisma";

export async function GET() {
  const tables = await prisma.table.findMany({
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // 👈 SOLO LA ÚLTIMA ORDEN (evita ruido histórico)
      },
    },
  });

  return Response.json(
    tables.map((t) => {
      const lastOrder = t.orders[0];

      const isOccupied = lastOrder?.status === "OPEN";

      return {
        id: t.id,
        name: t.name,
        status: isOccupied ? "OCCUPIED" : "FREE",
        activeOrderId: isOccupied ? lastOrder.id : null,
      };
    })
  );
}