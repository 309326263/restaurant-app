import { prisma } from "@/lib/prisma";




export async function POST(req: Request) {

    
  try {
    const body = await req.json();

    const { tableId, items } = body;

    if (!tableId || !items || items.length === 0) {
      return Response.json(
        { ok: false, error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        tableId,
        status: "OPEN",
        items: {
          create: items.map((item: any) => ({
            type: item.isCustom ? "CUSTOM" : "PRODUCT",
            
            productId:
            item.productId && !isNaN(Number(item.productId))
              ? Number(item.productId)
              : null,

            customName: item.customName ?? null,
            customPrice: item.customPrice ?? null,

            quantity: item.quantity ?? item.qty ?? 1,

            variantName: item.variantName ?? null,
            variantPrice: item.variantPrice ?? null,

            station: item.station,

            status: "PENDING",

            notes: item.notes ?? null,
          })),
        },
      },
    });

    return Response.json({ ok: true, order });
  } catch (error) {
    console.error("🔥 CREATE ORDER ERROR:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error creando orden",
      },
      { status: 500 }
    );
  }
}