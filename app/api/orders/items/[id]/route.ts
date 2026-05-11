import {
  removeOrderItem,
  updateOrderItem,
} from "@/server/services/orderItem.service";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;

  const itemId = Number(id);

  const body = await req.json();

  const { quantity } = body;

  if (quantity <= 0) {
    await removeOrderItem(itemId);

    return Response.json({
      ok: true,
    });
  }

  await updateOrderItem(itemId, {
    quantity,
  });

  return Response.json({
    ok: true,
  });
}