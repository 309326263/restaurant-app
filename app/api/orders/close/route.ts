import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { tableId } = await req.json();

  if (!tableId) {
    return Response.json({ error: "tableId requerido" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      tableId,
      status: "OPEN",
    },
  });

  if (!order) {
    return Response.json({ error: "No hay orden activa" }, { status: 404 });
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });

  const total = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
    },
  });

  return Response.json({
    ok: true,
    total,
    orderId: order.id,
  });
}
