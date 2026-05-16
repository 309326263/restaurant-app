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
import "./kitchen-os.css";
import { useRouter } from "next/navigation";
import type {
  KitchenItemAction,
  KitchenOrder,
  KitchenPendingAction,
} from "@/app/types/kitchen";
import {
  KitchenHeaderOS,
  type KitchenLayoutMode,
} from "@/app/components/kitchen/KitchenHeaderOS";
import { KitchenTablesRail } from "@/app/components/kitchen/KitchenTablesRail";
import { KitchenCard } from "@/app/components/kitchen/KitchenCard";
import { KitchenToolbarButton } from "@/app/components/ui/kitchen/primitives";
import { kitchenLayout } from "@/app/components/ui/kitchen/tokens";
import { cn } from "@/lib/cn";
import { getKitchenVisibleItems } from "./lib/kitchenVisibility";
import { sortKitchenOrders } from "./lib/kitchenSorting";
import {
  detectChangedOrders,
  isRecent,
} from "./lib/kitchenEffects";
import { playDoubleBeep } from "./lib/kitchenAudio";
import { theme } from "@/app/src/lib/ui/theme";

export default function Kitchen() {
  const router = useRouter();

  const { data: orders = [], mutate } = useSWR<KitchenOrder[]>(
    "/api/kitchen",
    fetcher,
    {
      refreshInterval: 2000,
    }
  );

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevRef = useRef<Record<number, number>>({});
  const orderRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<number[]>([]);
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const [showBackButton, setShowBackButton] = useState(false);
  const [showEndButton, setShowEndButton] = useState(false);
  const [focusedOrder, setFocusedOrder] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [navbarCollapsed, setNavbarCollapsed] = useState(false);
  const [layoutMode, setLayoutMode] = useState<KitchenLayoutMode>("horizontal");
  const [visualOrderIds, setVisualOrderIds] = useState<number[]>([]);
  const [flash, setFlash] = useState<number[]>([]);
  const [highlightedOrders, setHighlightedOrders] = useState<number[]>([]);
  const [pendingActions, setPendingActions] = useState<KitchenPendingAction[]>([]);

  const sortedOrders = useMemo(
    () => sortKitchenOrders(orders),
    [orders]
  );

  const visibleSortedOrders = useMemo(
    () =>
      sortedOrders.filter(
        (order) => getKitchenVisibleItems(order).length > 0
      ),
    [sortedOrders]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisualOrderIds((prev) => {
        const visibleIds = visibleSortedOrders.map((order) => order.id);
        const kept = prev.filter((id) => visibleIds.includes(id));
        const added = visibleIds.filter((id) => !kept.includes(id));

        return [...kept, ...added];
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [visibleSortedOrders]);

  const visualOrders = useMemo(() => {
    const byId = new Map(
      visibleSortedOrders.map((order) => [order.id, order])
    );

    return visualOrderIds
      .map((id) => byId.get(id))
      .filter((order): order is KitchenOrder => Boolean(order));
  }, [visibleSortedOrders, visualOrderIds]);

  const releaseOrder = useCallback(async (orderId: number) => {
    const pendingKey: KitchenPendingAction = `release:${orderId}`;

    if (pendingActions.includes(pendingKey)) return;

    setPendingActions((prev) => [...prev, pendingKey]);

    const controller = new AbortController();
    controllersRef.current.add(controller);

    try {
      const response = await fetch(`/api/orders/${orderId}/ready`, {
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Release order failed: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    } finally {
      controllersRef.current.delete(controller);

      if (isMountedRef.current) {
        setPendingActions((prev) =>
          prev.filter((key) => key !== pendingKey)
        );
      }
    }
  }, [pendingActions]);

  const updateKitchenItem = useCallback(async (
    itemId: number,
    action: KitchenItemAction
  ) => {
    const pendingKey: KitchenPendingAction = `item:${itemId}`;

    if (pendingActions.includes(pendingKey)) return;

    setPendingActions((prev) => [...prev, pendingKey]);

    const controller = new AbortController();
    controllersRef.current.add(controller);

    try {
      const response = await fetch(`/api/kitchen/items/${itemId}`, {
        method: "PATCH",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Item ${action} failed`);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    } finally {
      controllersRef.current.delete(controller);

      if (isMountedRef.current) {
        setPendingActions((prev) =>
          prev.filter((key) => key !== pendingKey)
        );
      }
    }
  }, [pendingActions]);

  const scrollToStart = useCallback(() => {
    canvasRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  const scrollToEnd = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, []);

  const scrollToOrder = useCallback((orderId: number) => {
    const container = canvasRef.current;
    const el = orderRefs.current[orderId];
    if (!container || !el) return;

    if (layoutMode === "horizontal") {
      container.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setFocusedOrder(orderId);

    const timeout = window.setTimeout(() => {
      if (isMountedRef.current) setFocusedOrder(null);
    }, 2000);

    timeoutsRef.current.push(timeout);
  }, []);

  useKitchenEvents({
    onItemUpdated: () => mutate(),
    onOrderUpdated: () => mutate(),
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
      controllersRef.current.forEach((c) => c.abort());
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/beep.mp3" preload="auto" />

      <main
        className={cn(
          kitchenLayout.shell,
          theme.surface.page
        )}
        style={
          {
            "--kitchen-font": `${fontSize}px`,
          } as CSSProperties
        }
        onClick={() => audioRef.current?.play().catch(() => {})}
      >
        <KitchenTablesRail
          orders={visualOrders}
          highlightedOrders={highlightedOrders}
          focusedOrder={focusedOrder}
          onSelectOrder={scrollToOrder}
        />

        <section className={cn(kitchenLayout.workArea, "bg-transparent")}>
          <KitchenHeaderOS
            collapsed={navbarCollapsed}
            layoutMode={layoutMode}
            onHistory={() => router.push("/kitchen/history")}
            onDecreaseFont={() => setFontSize((s) => Math.max(12, s - 2))}
            onIncreaseFont={() => setFontSize((s) => Math.min(30, s + 2))}
            onToggleLayout={() =>
              setLayoutMode((m) => (m === "horizontal" ? "flow" : "horizontal"))
            }
            onToggleCollapsed={() => setNavbarCollapsed((v) => !v)}
          />

          <div className={cn(kitchenLayout.ordersViewport, "bg-transparent")}>
            <div
              ref={canvasRef}
              className={cn(
                layoutMode === "horizontal"
                  ? kitchenLayout.horizontalCanvas
                  : kitchenLayout.gridCanvas,
                "kitchen-os-scrollbar bg-transparent"
              )}
            >
              <div
                className={
                  layoutMode === "horizontal"
                    ? kitchenLayout.horizontalTrack
                    : kitchenLayout.gridTrack
                }
              >
                {visualOrders.map((order) => {
                  const visible = getKitchenVisibleItems(order);

                  return (
                    <div
                      key={order.id}
                      ref={(el) => {
                        orderRefs.current[order.id] = el;
                      }}
                      className={
                        layoutMode === "horizontal"
                          ? kitchenLayout.orderWrap
                          : "min-h-0"
                      }
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

            {layoutMode === "horizontal" && (
              <div className={kitchenLayout.floatingControls}>
                {showBackButton ? (
                  <KitchenToolbarButton
                    className="pointer-events-auto"
                    onClick={scrollToStart}
                  >
                    ←
                  </KitchenToolbarButton>
                ) : (
                  <span />
                )}

                {showEndButton ? (
                  <KitchenToolbarButton
                    className="pointer-events-auto"
                    onClick={scrollToEnd}
                  >
                    →
                  </KitchenToolbarButton>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}