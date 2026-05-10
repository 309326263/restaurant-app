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

  // 🔥 1. traer orden completa
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return Response.json({ ok: false }, { status: 404 });
  }

  // 🔥 2. marcar como pagada
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
    },
  });

  // 🔥 3. liberar mesa
  await prisma.table.update({
    where: { id: order.tableId },
    data: {
      status: "FREE",
    },
  });

  // 🧾 4. enviar al print-server (NUEVO SISTEMA)
  await fetch("http://localhost:4000/emit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "PRINT_RECEIPT",
      payload: {
        id: order.id,
        table: order.table,
        items: order.items,
      },
    }),
  });

  return Response.json({ ok: true });
}