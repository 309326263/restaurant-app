"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useKitchenEvents } from "@/app/hooks/useKitchenEvents";
import "./kitchen.css";
import { useRouter } from "next/navigation";
import type {
  KitchenItemAction,
  KitchenOrder,
  KitchenPendingAction,
} from "@/app/types/kitchen";
import { KitchenHeader } from "@/app/components/kitchen/KitchenHeader";
import { KitchenSidebar } from "@/app/components/kitchen/KitchenSidebar";
import { KitchenCard } from "@/app/components/kitchen/KitchenCard";
import { getKitchenVisibleItems } from "./lib/kitchenVisibility";
import { sortKitchenOrders } from "./lib/kitchenSorting";
import {
  detectChangedOrders,
  isRecent,
} from "./lib/kitchenEffects";
import { playDoubleBeep } from "./lib/kitchenAudio";

const SIDEBAR_WIDTH = 140;
const SIDEBAR_OPEN = true;

export default function Kitchen() {
  const router = useRouter();

  const { data: orders = [], mutate } = useSWR<
    KitchenOrder[]
  >("/api/kitchen", fetcher, {
    refreshInterval: 2000,
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevRef = useRef<Record<number, number>>({});
  const orderRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<number[]>([]);
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const [showBackButton, setShowBackButton] =
    useState(false);
  const [focusedOrder, setFocusedOrder] =
    useState<number | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [flash, setFlash] = useState<number[]>([]);
  const [highlightedOrders, setHighlightedOrders] =
    useState<number[]>([]);
  const [pendingActions, setPendingActions] = useState<
    KitchenPendingAction[]
  >([]);

  const sortedOrders = useMemo(
    () => sortKitchenOrders(orders),
    [orders]
  );

  const releaseOrder = useCallback(async (orderId: number) => {
    const pendingKey: KitchenPendingAction = `release:${orderId}`;

    if (pendingActions.includes(pendingKey)) return;

    setPendingActions((prev) => [...prev, pendingKey]);

    if (process.env.NODE_ENV === "development") {
      console.log("[kitchen] release order", orderId);
    }

    const controller = new AbortController();
    controllersRef.current.add(controller);

    try {

      const response = await fetch(
        `/api/orders/${orderId}/ready`,
        {
          method: "POST",
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Release order failed: ${response.status}`
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("[kitchen] release order failed", {
          orderId,
          error,
        });
      }
    } finally {
      controllersRef.current.delete(controller);

      if (isMountedRef.current) {
        setPendingActions((prev) =>
          prev.filter((key) => key !== pendingKey)
        );
      }
    }
  }, [pendingActions]);

  const updateKitchenItem = useCallback(
    async (
      itemId: number,
      action: KitchenItemAction
    ) => {
      const pendingKey: KitchenPendingAction = `item:${itemId}`;

      if (pendingActions.includes(pendingKey)) return;

      setPendingActions((prev) => [...prev, pendingKey]);

      if (process.env.NODE_ENV === "development") {
        console.log(`[kitchen] item ${action}`, itemId);
      }

      const controller = new AbortController();
      controllersRef.current.add(controller);

      try {

        const response = await fetch(
          `/api/kitchen/items/${itemId}`,
          {
            method: "PATCH",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Item ${action} failed: ${response.status}`
          );
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("[kitchen] item action failed", {
            itemId,
            action,
            error,
          });
        }
      } finally {
        controllersRef.current.delete(controller);

        if (isMountedRef.current) {
          setPendingActions((prev) =>
            prev.filter((key) => key !== pendingKey)
          );
        }
      }
    },
    [pendingActions]
  );

  const scrollToStart = useCallback(() => {
    const el = canvasRef.current;

    if (!el) return;

    el.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }, []);

  const scrollToOrder = useCallback((orderId: number) => {
    const container = canvasRef.current;
    const el = orderRefs.current[orderId];

    if (!container || !el) return;

    const left = el.offsetLeft - SIDEBAR_WIDTH;

    if (document.body.contains(container) && document.body.contains(el)) {
      container.scrollTo({
        left: left < 0 ? 0 : left,
        behavior: "smooth",
      });
    }

    setFocusedOrder(orderId);

    const timeout = window.setTimeout(() => {
      if (isMountedRef.current) {
        setFocusedOrder(null);
      }
    }, 2000);

    timeoutsRef.current.push(timeout);
  }, []);

  const unlockAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio
      .play()
      .then(() => {
        if (audioRef.current === audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      })
      .catch(() => {});
  }, []);

  useKitchenEvents({
    onItemUpdated: () => {
      if (isMountedRef.current) {
        mutate();
      }
    },
    onOrderUpdated: () => {
      if (isMountedRef.current) {
        mutate();
      }
    },
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      timeoutsRef.current.forEach((timeout) => {
        window.clearTimeout(timeout);
      });

      timeoutsRef.current = [];

      controllersRef.current.forEach((controller) => {
        controller.abort();
      });

      controllersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const el = canvasRef.current;

    if (!el) return;

    const handleScroll = () => {
      setShowBackButton(el.scrollLeft > 50);
    };

    el.addEventListener("scroll", handleScroll);

    return () =>
      el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;

    if (!el) return;

    const scroll = el.scrollLeft;

    const frame = requestAnimationFrame(() => {
      if (
        isMountedRef.current &&
        canvasRef.current === el
      ) {
        el.scrollLeft = scroll;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [orders]);

  useEffect(() => {
    const { next, changedOrderIds } = detectChangedOrders(
      orders,
      prevRef.current
    );

    if (changedOrderIds.length) {
      setFlash(changedOrderIds);

      const flashTimeout = window.setTimeout(() => {
        if (isMountedRef.current) {
          setFlash([]);
        }
      }, 500);

      timeoutsRef.current.push(flashTimeout);

      const beepTimeout = playDoubleBeep(audioRef.current);

      if (beepTimeout !== undefined) {
        timeoutsRef.current.push(beepTimeout);
      }

      setHighlightedOrders((prev) => [
        ...new Set([...prev, ...changedOrderIds]),
      ]);

      const highlightTimeout = window.setTimeout(() => {
        if (isMountedRef.current) {
          setHighlightedOrders((prev) =>
            prev.filter(
              (id) => !changedOrderIds.includes(id)
            )
          );
        }
      }, 30000);

      timeoutsRef.current.push(highlightTimeout);
    }

    prevRef.current = next;
  }, [orders]);

  return (
    <>
      <audio
        ref={audioRef}
        src="/beep.mp3"
        preload="auto"
      />

      <main
        className="kitchen-bg"
        style={
          {
            "--kitchen-font": `${fontSize}px`,
          } as CSSProperties
        }
        onClick={unlockAudio}
      >
        {showBackButton && (
          <button
            className="kitchen-back-btn"
            onClick={scrollToStart}
          >
            ⬅
          </button>
        )}

        <KitchenHeader
          onHistory={() => router.push("/kitchen/history")}
          onDecreaseFont={() =>
            setFontSize((s) => Math.max(12, s - 2))
          }
          onIncreaseFont={() =>
            setFontSize((s) => Math.min(30, s + 2))
          }
        />

        <div className="kitchen-canvas" ref={canvasRef}>
          <div className="kitchen-track">
            <KitchenSidebar
              orders={sortedOrders}
              highlightedOrders={highlightedOrders}
              open={SIDEBAR_OPEN}
              onSelectOrder={scrollToOrder}
            />

            {sortedOrders.map((order) => {
              const visible = getKitchenVisibleItems(order);

              if (!visible.length) return null;

              return (
                <div
                  key={order.id}
                  ref={(el) => {
                    orderRefs.current[order.id] = el;
                  }}
                >
                  <KitchenCard
                    order={order}
                    visibleItems={visible}
                    isFlashing={flash.includes(order.id)}
                    isFocused={focusedOrder === order.id}
                    isReleasePending={pendingActions.includes(
                      `release:${order.id}`
                    )}
                    pendingActions={pendingActions}
                    onRelease={releaseOrder}
                    onUpdateItem={updateKitchenItem}
                    isRecent={isRecent}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
