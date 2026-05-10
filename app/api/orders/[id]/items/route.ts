import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: any) {
  const { id } = await params;
  const orderId = Number(id);

  const { items } = await req.json();

  for (const item of items) {
    // 🔍 buscar si ya existe ese producto + variante en la orden
    const existing = await prisma.orderItem.findFirst({
      where: {
        orderId,

        productId: item.productId ?? null,
        customName: item.customName ?? null,

        variantName: item.variantName || null,
        status: "PENDING",
      }
    });

    if (existing) {
      // ➕ si existe → sumar cantidad
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + item.quantity,
          
          notes: item.note ?? existing.notes, // opcional pero útil
        },
      });
    } else {
      // 🆕 si no existe → crear nuevo
      await prisma.orderItem.create({
        data: {
          orderId: orderId,

          // =========================
          // MENU ITEM
          // =========================
          productId: item.productId ?? null,

          // =========================
          // CUSTOM ITEM
          // =========================
          customName: item.customName ?? null,
          customPrice: item.customPrice ?? null,

          // =========================
          // COMMON
          // =========================
          quantity: item.quantity,

          variantName: item.variantName || null,
          variantPrice: item.variantPrice || 0,
          station: item.station,

          notes: item.notes ?? null,
        },
      });
    }
  }

  return Response.json({ ok: true });
}