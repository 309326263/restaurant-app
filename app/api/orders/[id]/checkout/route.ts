import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

  if (!orderId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: true,
    },
  });

  if (!order) {
    return Response.json({ ok: false }, { status: 404 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
    },
  });

  await prisma.table.update({
    where: { id: order.tableId },
    data: {
      status: "FREE",
    },
  });

  return Response.json({ ok: true });
}
