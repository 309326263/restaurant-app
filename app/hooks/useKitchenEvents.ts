"use client";

import { useEffect, useRef } from "react";
import type { KitchenEvent } from "@/server/events/types";

type UseKitchenEventsOptions = {
  onItemUpdated?: (payload: {
    orderId: number;
    itemId: number;
  }) => void;
  onOrderUpdated?: (payload: { orderId: number }) => void;
};

type PendingEvents = {
  item?: { orderId: number; itemId: number };
  order?: { orderId: number };
};

export function useKitchenEvents({
  onItemUpdated,
  onOrderUpdated,
}: UseKitchenEventsOptions) {
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const dedupRef = useRef<Record<string, number>>({});
  const flushTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingEvents>({});
  const callbacksRef = useRef({
    onItemUpdated,
    onOrderUpdated,
  });

  callbacksRef.current = {
    onItemUpdated,
    onOrderUpdated,
  };

  useEffect(() => {
    let isUnmounted = false;

    const isKitchenEvent = (
      data: unknown
    ): data is KitchenEvent => {
      if (!data || typeof data !== "object") return false;
      const event = data as Record<string, unknown>;

      if (event.type === "heartbeat") return true;

      if (
        event.type === "order.updated" &&
        typeof event.orderId === "number"
      ) {
        return true;
      }

      if (
        event.type === "item.updated" &&
        typeof event.orderId === "number" &&
        typeof event.itemId === "number"
      ) {
        return true;
      }

      return false;
    };

    const shouldProcessEvent = (event: KitchenEvent) => {
      if (event.type === "heartbeat") return false;

      const key =
        event.type === "item.updated"
          ? `item.updated:${event.orderId}:${event.itemId}`
          : `order.updated:${event.orderId}`;

      const now = Date.now();
      const lastSeen = dedupRef.current[key] ?? 0;
      dedupRef.current[key] = now;

      return now - lastSeen > 500;
    };

    const scheduleFlush = () => {
      if (flushTimerRef.current) return;

      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        const pending = pendingRef.current;
        pendingRef.current = {};

        // Prefer order-level callback when both are queued.
        if (
          pending.order &&
          callbacksRef.current.onOrderUpdated
        ) {
          callbacksRef.current.onOrderUpdated(
            pending.order
          );
          return;
        }

        if (
          pending.item &&
          callbacksRef.current.onItemUpdated
        ) {
          callbacksRef.current.onItemUpdated(
            pending.item
          );
        }
      }, 80);
    };

    const handleEvent = (event: KitchenEvent) => {
      if (!shouldProcessEvent(event)) return;

      if (event.type === "item.updated") {
        pendingRef.current.item = {
          orderId: event.orderId,
          itemId: event.itemId,
        };
      } else if (event.type === "order.updated") {
        pendingRef.current.order = {
          orderId: event.orderId,
        };
      }

      scheduleFlush();
    };

    const connect = () => {
      if (isUnmounted || sourceRef.current) return;

      const source = new EventSource("/api/events/kitchen");
      sourceRef.current = source;

      source.onopen = () => {
        retryAttemptRef.current = 0;
      };

      source.onmessage = (messageEvent) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(messageEvent.data);
        } catch {
          return;
        }

        if (!isKitchenEvent(parsed)) return;
        if (parsed.type === "heartbeat") return;

        handleEvent(parsed);
      };

      source.onerror = () => {
        source.close();
        if (sourceRef.current === source) {
          sourceRef.current = null;
        }

        if (isUnmounted) return;

        const attempt = retryAttemptRef.current + 1;
        retryAttemptRef.current = attempt;
        const delay = Math.min(
          1000 * 2 ** (attempt - 1),
          10000
        );

        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      isUnmounted = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }

      sourceRef.current?.close();
      sourceRef.current = null;
      pendingRef.current = {};
    };
  }, []);
}
