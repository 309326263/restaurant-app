"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useKitchenEvents } from "@/app/hooks/useKitchenEvents";
import type { ReactNode } from "react";

type BarItem = {
  id: number;
  status: "SENT" | "IN_PROGRESS" | "DONE";
  displayName?: string;
  quantity: number;
  notes?: string | null;
};

type BarState = {
  SENT: BarItem[];
  IN_PROGRESS: BarItem[];
  DONE: BarItem[];
};

export default function BarPage() {
  const { data: orders = [], mutate } = useSWR(
    "/api/kitchen",
    fetcher,
    { refreshInterval: 2000 }
  );

  useKitchenEvents({
    onItemUpdated: () => mutate(),
    onOrderUpdated: () => mutate(),
  });

  const updateBarItem = async (
    itemId: number,
    action: "start" | "complete" | "revert"
  ) => {
    await fetch(`/api/kitchen/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });
  };

  const getBarState = (order: any): BarState | null => {
    const barState = order?.kitchenView?.stations?.BAR;
    if (!barState) return null;

    return {
      SENT: barState.SENT ?? [],
      IN_PROGRESS: barState.IN_PROGRESS ?? [],
      DONE: barState.DONE ?? [],
    };
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#f8fafc",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Bar
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {orders.map((order: any) => {
          const barState = getBarState(order);
          if (!barState) return null;

          const hasVisibleItems =
            barState.SENT.length > 0 ||
            barState.IN_PROGRESS.length > 0 ||
            barState.DONE.length > 0;

          if (!hasVisibleItems) return null;

          return (
            <section
              key={order.id}
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "18px",
                }}
              >
                {order.table?.name ?? `Mesa ${order.id}`}
              </h2>

              <StatusColumn
                title="En preparación"
                items={barState.SENT}
                renderActions={(item) => (
                  <button
                    onClick={() =>
                      updateBarItem(item.id, "start")
                    }
                  >
                    Empezar
                  </button>
                )}
              />

              <StatusColumn
                title="Preparando"
                items={barState.IN_PROGRESS}
                renderActions={(item) => (
                  <>
                    <button
                      onClick={() =>
                        updateBarItem(item.id, "complete")
                      }
                    >
                      Terminar
                    </button>
                    <button
                      onClick={() =>
                        updateBarItem(item.id, "revert")
                      }
                    >
                      Revertir
                    </button>
                  </>
                )}
              />

              <StatusColumn
                title="Listo"
                items={barState.DONE}
                renderActions={(item) => (
                  <button
                    onClick={() =>
                      updateBarItem(item.id, "revert")
                    }
                  >
                    Revertir
                  </button>
                )}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}

function StatusColumn({
  title,
  items,
  renderActions,
}: {
  title: string;
  items: BarItem[];
  renderActions: (item: BarItem) => ReactNode;
}) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: "12px" }}>
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          color: "#93c5fd",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </h3>

      <div style={{ display: "grid", gap: "8px" }}>
        {items.map((item) => (
          <article
            key={item.id}
            style={{
              background: "#1f2937",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {item.displayName ?? "Item"}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9 }}>
              x {item.quantity}
            </div>
            {item.notes ? (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#d1d5db",
                }}
              >
                Nota: {item.notes}
              </div>
            ) : null}
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                gap: "8px",
              }}
            >
              {renderActions(item)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
