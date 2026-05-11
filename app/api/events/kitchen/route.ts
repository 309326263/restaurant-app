import { subscribeKitchenEvents } from "@/server/events/kitchen.events";
import type { KitchenEvent } from "@/server/events/types";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const write = (data: KitchenEvent) => {
        if (isClosed) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      controller.enqueue(encoder.encode("retry: 2000\n\n"));

      const unsubscribe = subscribeKitchenEvents((event) => {
        write(event);
      });

      const heartbeat = setInterval(() => {
        write({ type: "heartbeat" });
      }, 15000);

      cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      };

      req.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
