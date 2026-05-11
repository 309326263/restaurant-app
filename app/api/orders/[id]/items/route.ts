import { addItemsToOrder } from "@/server/services/orderItem.service";

export async function POST(req: Request, { params }: any) {
  const { id } = await params;
  const orderId = Number(id);

  const { items } = await req.json();

  await addItemsToOrder(orderId, items);

  return Response.json({ ok: true });
}