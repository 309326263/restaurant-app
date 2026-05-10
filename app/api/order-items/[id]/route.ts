import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: any
) {
  const { id } = await params;
  const itemId = Number(id);

  const { quantity } = await req.json();

  if (quantity <= 0) {
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    return Response.json({ ok: true, deleted: true });
  }

  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return Response.json({ ok: true, item });
}


export async function DELETE(
  req: Request,
  { params }: any
) {
  const { id } = await params;
  const itemId = Number(id);

  await prisma.orderItem.delete({
    where: { id: itemId },
  });

  return Response.json({ ok: true });
}