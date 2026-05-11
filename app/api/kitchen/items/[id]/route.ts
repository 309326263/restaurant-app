import {
  completeItem,
  revertItem,
  startItem,
} from "@/server/services/kitchenFlow.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const itemId = Number(id);

  if (!itemId) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { action } = await req.json();

  if (action === "start") {
    await startItem(itemId);
    return Response.json({ ok: true });
  }

  if (action === "complete") {
    await completeItem(itemId);
    return Response.json({ ok: true });
  }

  if (action === "revert") {
    await revertItem(itemId);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false }, { status: 400 });
}
