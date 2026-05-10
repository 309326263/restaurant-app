"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect, useRef, useState } from "react";
import "./kitchen.css";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";

export default function Kitchen() {

  const categoryOrder: Record<string, number> = {
    "Postres": 1,
    "Entradas": 2,
    "Especialidades": 3,
    "Sopas y Ramen": 4,
    "Udon y Tallarines": 5,
    "Arroz": 6,
    "Sushi": 7,
  };
  const router = useRouter();

  const { data: orders = [], mutate } = useSWR(
    "/api/kitchen",
    fetcher,
    { refreshInterval: 2000 }
  );

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // 🔥 AUDIO REAL DOM
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔥 mostrar botón volver al inicio
  const [showBackButton, setShowBackButton] = useState(false);

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

  const scrollToStart = () => {
    const el = canvasRef.current;

    if (!el) return;

    el.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = canvasRef.current;

    if (!el) return;

    const scroll = el.scrollLeft;

    requestAnimationFrame(() => {
      el.scrollLeft = scroll;
    });
  }, [orders]);

  const [focusedOrder, setFocusedOrder] =
    useState<number | null>(null);

  const [fontSize, setFontSize] = useState(18);

  const prevRef = useRef<Record<number, number>>({});

  const [flash, setFlash] = useState<number[]>([]);

  const [orderPositionMap, setOrderPositionMap] =
    useState<Record<number, number>>({});

  // 🔥 sidebar highlight
  const [highlightedOrders, setHighlightedOrders] =
    useState<number[]>([]);

  const releaseOrder = async (orderId: number) => {
    await fetch(`/api/orders/${orderId}/ready`, {
      method: "POST",
    });

    mutate();
  };

  // SIDEBAR
  const orderRefs =
    useRef<Record<number, HTMLDivElement>>({});

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const SIDEBAR_WIDTH = 140;

  const scrollToOrder = (orderId: number) => {
    const container = canvasRef.current;

    const el = orderRefs.current[orderId];

    if (!container || !el) return;

    const left = el.offsetLeft - SIDEBAR_WIDTH;

    container.scrollTo({
      left: left < 0 ? 0 : left,
      behavior: "smooth",
    });

    // 🔥 highlight card
    setFocusedOrder(orderId);

    setTimeout(() => {
      setFocusedOrder(null);
    }, 2000);
  };

  // 🔥 DOUBLE BEEP
  function playDoubleBeep() {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch((err) => {
      console.log("play blocked", err);
    });

    setTimeout(() => {
      if (!audioRef.current) return;

      audioRef.current.currentTime = 0;

      audioRef.current.play().catch((err) => {
        console.log(
          "second beep blocked",
          err
        );
      });
    }, 180);
  }

  // 🔥 DETECCIÓN DE NUEVOS ITEMS
  useEffect(() => {
    if (!orders) return;

    const next: Record<number, number> = {};

    let changedOrders: number[] = [];

    orders.forEach((order: any) => {
      const count =
        order.items?.filter(
          (i: any) =>
            i.status === "SENT" &&
            i.station === "KITCHEN"
        ).length || 0;

      const prev = prevRef.current[order.id] || 0;

      if (count > prev) {
        changedOrders.push(order.id);
      }

      next[order.id] = count;
    });

    if (changedOrders.length) {
      setFlash(changedOrders);

      setTimeout(() => setFlash([]), 500);

      // 🔥 BEEP
      playDoubleBeep();

      // 🔥 sidebar highlight 30s
      setHighlightedOrders((prev) => [
        ...new Set([...prev, ...changedOrders]),
      ]);

      setTimeout(() => {
        setHighlightedOrders((prev) =>
          prev.filter(
            (id) => !changedOrders.includes(id)
          )
        );
      }, 30000);
    }

    prevRef.current = next;
  }, [orders]);

  // 🔥 mantener posición estable
  useEffect(() => {
    if (!orders.length) return;

    setOrderPositionMap((prev) => {
      const updated = { ...prev };

      let max = Object.keys(prev).length;

      orders.forEach((order: any) => {
        if (updated[order.id] === undefined) {
          updated[order.id] = max;

          max++;
        }
      });

      return updated;
    });
  }, [orders]);

  
  const sortedOrders = [...orders]
      .map((order: any) => {
        const visible = order.items.filter(
          (i: any) =>
            i.status === "SENT" &&
            i.station === "KITCHEN"
        );

        const minCategory =
        visible.length
          ? visible.reduce((min: number, i: any) => {
              const rank = categoryOrder[i.product?.categoryId as any] ?? 9999;
              return rank < min ? rank : min;
            }, 9999)
          : 9999;

        return { ...order, _catOrder: minCategory };
      })
      .sort((a: any, b: any) => {
        const diff = a._catOrder - b._catOrder;

        if (diff !== 0) return diff;

        return (
          new Date(a.createdAt ?? a.id).getTime() -
          new Date(b.createdAt ?? b.id).getTime()
        );
      });
  // 🔥 agrupar por ticket
  function groupByTicket(items: any[]) {
    const map: Record<number, any[]> = {};

    items.forEach((i) => {
      const key = i.ticketId || 0;

      if (!map[key]) map[key] = [];

      map[key].push(i);
    });

    return Object.entries(map).sort(
      (a: any, b: any) =>
        new Date(b[1][0].sentAt).getTime() -
        new Date(a[1][0].sentAt).getTime()
    );
  }

  // 🔥 highlight últimos 2 min
  const isRecent = (date: string) => {
    const diff =
      Date.now() - new Date(date).getTime();

    return diff < 120000;
  };

  return (
    <>
      {/* 🔥 AUDIO */}
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
          } as any
        }
        onClick={() => {
          audioRef.current
            ?.play()
            .then(() => {
              if (audioRef.current) {
                audioRef.current.pause();

                audioRef.current.currentTime = 0;
              }
            })
            .catch(() => {});
        }}
      >
        {showBackButton && (
          <button
            className="kitchen-back-btn"
            onClick={scrollToStart}
          >
            ⬅
          </button>
        )}

        <div className="kitchen-header-bar">
          <div className="kitchen-title">
            <span className="kitchen-icon">
              🍳
            </span>

            <span className="kitchen-text">
              Cocina
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginLeft: "auto",
            }}
          >
            <button
              onClick={() =>
                router.push("/kitchen/history")
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid #3f3f46",
                background: "#27272a",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <History size={18} />

              <span className="history-label">
                注文履歴
              </span>
            </button>

            <div className="kitchen-font-controls">
              <button
                onClick={() =>
                  setFontSize((s) =>
                    Math.max(12, s - 2)
                  )
                }
              >
                A-
              </button>

              <button
                onClick={() =>
                  setFontSize((s) =>
                    Math.min(30, s + 2)
                  )
                }
              >
                A+
              </button>
            </div>
          </div>
        </div>

        <div
          className="kitchen-canvas"
          ref={canvasRef}
        >
          <div className="kitchen-track">

            {/* SIDEBAR */}
            <div
              className={`kitchen-overlay ${
                sidebarOpen ? "open" : ""
              }`}
            >
              <div className="kitchen-overlay-list">
                {sortedOrders.map((order: any) => {
                  const visibleItems =
                    order.items.filter(
                      (i: any) =>
                        i.status === "SENT" &&
                        i.station === "KITCHEN"
                    );

                  if (!visibleItems.length)
                    return null;

                  const count =
                    visibleItems.length;

                  const isActive =
                    highlightedOrders.includes(
                      order.id
                    );

                  return (
                    <button
                      key={order.id}
                      className={`kitchen-overlay-item ${
                        isActive ? "blink" : ""
                      }`}
                      onClick={() =>
                        scrollToOrder(order.id)
                      }
                    >
                      {order.table.name} (
                      {count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARDS */}
            {sortedOrders.map((order: any) => {
              const visible =
                order.items.filter(
                  (i: any) =>
                    i.status === "SENT" &&
                    i.station === "KITCHEN"
                );

              if (!visible.length) return null;

              return (
                <div
                  key={order.id}
                  ref={(el) => {
                    if (el)
                      orderRefs.current[
                        order.id
                      ] = el;
                  }}
                  className={`kitchen-card ${
                    flash.includes(order.id) ? "flash" : ""
                  } ${
                    focusedOrder === order.id ? "focus-card" : ""
                  }`}
                  data-cat={
                    order.items?.[0]?.product?.categoryId
                  }
                >
                  <div
                    className={`category-line ${
                      order.items?.[0]?.product?.categoryId === 1
                        ? "line-orange"
                        : order.items?.[0]?.product?.categoryId === 8
                        ? "line-green"
                        : order.items?.[0]?.product?.categoryId === 5
                        ? "line-purple-top"
                        : ""
                    }`}
                  />
                  <div className="kitchen-card-header">
                    <span className="kitchen-table">
                      {order.table.name}
                    </span>
                  </div>

                  <div className="kitchen-items">
                    {groupByTicket(visible).map(
                      (
                        [ticketId, items]: any
                      ) => {
                        const sentTime =
                          items[0]?.sentAt;

                        const highlight =
                          sentTime &&
                          isRecent(sentTime);

                        return (
                          <div
                            key={ticketId}
                            className={`kitchen-block ${
                              highlight
                                ? "kitchen-block-new"
                                : ""
                            }`}
                          >
                            <div className="kitchen-time">
                              {sentTime
                                ? new Date(
                                    sentTime
                                  ).toLocaleTimeString()
                                : ""}
                            </div>

                            {items.map(
                              (item: any) => (
                                <div
                                  key={item.id}
                                  className="kitchen-item"
                                >
                                  {item.variantName
                                    ? `${item.product?.name || item.customName} - ${item.variantName}`
                                    : item.product
                                        .name}{" "}
                                  x {item.quantity}
                                </div>
                              )
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <button
                    className="kitchen-btn"
                    onClick={() =>
                      releaseOrder(order.id)
                    }
                  >
                    Liberar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}