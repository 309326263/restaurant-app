import { prisma } from "@/lib/prisma";
import {
  emitItemUpdated,
  emitOrderUpdated,
} from "@/server/events/kitchen.events";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

   if (!orderId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const itemsToComplete = await prisma.orderItem.findMany({
    where: {
      orderId: orderId,
      status: {
        in: ["SENT", "IN_PROGRESS"],
      },
    },
  });

  // 🔥 marcar TODO lo enviado como listo
  await prisma.orderItem.updateMany({
    where: {
      orderId: orderId,
      status: {
        in: ["SENT", "IN_PROGRESS"],
      },
    },
    data: {
      status: "DONE",
    },
  });

  for (const item of itemsToComplete) {
    emitItemUpdated(orderId, item.id);
  }

  emitOrderUpdated(orderId);

  console.log("READY endpoint hit", orderId);
  return Response.json({ ok: true });
}