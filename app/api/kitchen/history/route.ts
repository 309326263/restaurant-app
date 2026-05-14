import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    include: {
      table: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(orders);
}
