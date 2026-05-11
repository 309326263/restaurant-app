import { createOrder } from "@/server/services/order.service";




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

    const order = await createOrder({ tableId, items });

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