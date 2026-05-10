import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: any
) {

  const { id } = await params;

  const itemId = Number(id);

  // 🔥 AQUÍ
  const { notes } = await req.json();

  const item = await prisma.orderItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!item) {
    return Response.json(
      { ok: false },
      { status: 404 }
    );
  }

  // =========================
  // SI ES SOLO 1
  // =========================

  if (item.quantity === 1) {

    await prisma.orderItem.update({
      where: {
        id: itemId,
      },
      data: {
        notes,
      },
    });

    return Response.json({
      ok: true,
    });
  }

  // =========================
  // SI HAY MÁS DE 1
  // → separar item
  // =========================

  await prisma.orderItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity: item.quantity - 1,

      // 🔥 limpiar nota original
      notes: null,
    },
  });
  const newItem =
  await prisma.orderItem.create({
    data: {

      orderId: item.orderId,

      productId: item.productId,

      qty: 1,

      variantName: item.variantName,
      variantPrice: item.variantPrice,

      station: item.station,

      status: item.status,

      notes,
    },
  });

  return Response.json({
    ok: true,
    newItemId: newItem.id,
  });
}