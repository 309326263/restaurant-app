import { prisma } from "@/lib/prisma";
import { ItemStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

   if (!orderId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // 🔥 marcar TODO lo enviado como listo
  await prisma.orderItem.updateMany({
    where: {
      orderId: orderId,
      status: "SENT",
    },
    data: {
      status: "DONE",
    },
  });
console.log("READY endpoint hit", orderId);
  return Response.json({ ok: true });
}