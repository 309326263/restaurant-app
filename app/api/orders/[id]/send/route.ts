import { createKitchenTickets } from "@/server/services/kitchenTicket.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

  const body = await req.json();
  const kitchen = body.kitchen ?? body.printKitchen;
  const bar = body.bar ?? body.printBar;

  if (!orderId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const result = await createKitchenTickets(orderId);

  if (!result) {
    return Response.json({ ok: false }, { status: 404 });
  }

  const { order, printedItems } = result;

  // =========================
  // 🟢 IMPRESIÓN (solo ítems del envío actual)
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
        events: [event],
        payload: {
          id: order.id,
          table: order.table,
          items: printedItems,
        },
      }),
    });
  }

  return Response.json({ ok: true });
}