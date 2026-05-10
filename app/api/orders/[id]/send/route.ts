import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

  const { kitchen, bar, stations } = await req.json();

  if (!orderId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const now = new Date();

  // =========================
  // 🟡 ENVIAR SOLO LO QUE CORRESPONDE POR ESTACIÓN
  // =========================
  const itemsToSend =
    stations
      ? Object.values(stations).flat()
      : order.items.filter((i) => i.status === "PENDING");

  // =========================
// 🟡 1. ENVIAR A COCINA
// =========================

// =========================
// 🟡 1. CREAR TICKET
// =========================
const ticket = await prisma.kitchenTicket.create({
  data: {
    orderId,
  },
});

// =========================
// 🟡 2. MOVER ITEMS A TICKET
// =========================
await prisma.orderItem.updateMany({
  where: {
    orderId,
    status: "PENDING",
  },
  data: {
    status: "SENT",
    sentAt: now,
    ticketId: ticket.id,
  },
  
});

  // =========================
  // 🔥 UPDATE ORDEN
  // =========================
  await prisma.order.update({
    where: { id: orderId },
    data: {
      lastSentAt: now,
    },
  });

  // =========================
  // 🟢 IMPRESIÓN (SIN CAMBIOS)
  // =========================
  if (kitchen || bar) {
    let event = "";

    if (kitchen && bar) {
      event = "PRINT_KITCHEN_AND_BAR";
    } else if (kitchen) {
      event = "PRINT_KITCHEN";
    } else if (bar) {
      event = "PRINT_BAR";
    }

    await fetch("http://localhost:4000/emit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        payload: {
          id: order.id,
          table: order.table,
          items: order.items,
        },
      }),
    });
  }

  return Response.json({ ok: true });
}