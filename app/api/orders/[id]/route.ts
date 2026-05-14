import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return Response.json(
        { ok: false, error: "Order ID inválido" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        items: true,
      },
    });

    if (!order) {
      return Response.json(
        { ok: false, error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    return Response.json(order);
  } catch (error) {
    console.error(error);

    return Response.json(
      { ok: false, error: "Error al cargar orden" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 🔥 FIX NEXT 15+
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return Response.json(
        { ok: false, error: "Order ID inválido" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
      },
    });

    return Response.json({ ok: true, order });
  } catch (error) {
    console.error(error);

    return Response.json(
      { ok: false, error: "Error al cerrar orden" },
      { status: 500 }
    );
  }
}