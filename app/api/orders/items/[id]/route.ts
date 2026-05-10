import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params;

  const itemId = Number(id);

  const body = await req.json();

  const { quantity } = body;

  if (quantity <= 0) {

    await prisma.orderItem.delete({
      where: {
        id: itemId,
      },
    });

    return Response.json({
      ok: true,
    });
  }

  await prisma.orderItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity,
    },
  });

  return Response.json({
    ok: true,
  });
}