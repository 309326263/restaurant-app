import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tableId = Number(id);

  const order = await prisma.order.findFirst({
    where: {
      tableId,
      status: "OPEN", // 🔥 CLAVE: solo activa
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },

      tickets: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
    },
  });

  return Response.json(
  order
    ? {
        id: order.id,
        items: order.items,
        tickets: order.tickets,
      }
    : null
);
}