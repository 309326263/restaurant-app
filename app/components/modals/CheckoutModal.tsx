"use client";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/app/stores/uiStore";
import { Receipt, ArrowLeftRight } from "lucide-react";
import { useState, useMemo } from "react";

export function CheckoutModal({
  open,
  selectedTable,
  activeOrder,
  groupedItems,
  total,
  checkoutView,
  setCheckoutView,
  onClose,
  onCheckout,
}: {
  open: boolean;
  selectedTable: any;
  activeOrder: any;
  groupedItems: Record<string, any>;
  total: number;
  checkoutView: "grouped" | "tickets";
  setCheckoutView: (view: "grouped" | "tickets") => void;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}) {
  const { darkMode } = useUiStore();

  const [layoutMode, setLayoutMode] = useState<"vertical" | "horizontal">(
    "horizontal"
  );

  /* -----------------------------
     FIX: productos reales
  ------------------------------*/
  const hasProducts = useMemo(() => {
    const items = activeOrder?.items || [];
    return items.some((i: any) => Number(i.quantity || 0) > 0);
  }, [activeOrder]);

  /* -----------------------------
     FIX: precios robustos (IMPORTANTE)
  ------------------------------*/
  const resolvePrice = (i: any) => {
    return (
      Number(i.price) ||
      Number(i.variantPrice) ||
      Number(i.product?.price) ||
      0
    );
  };

  const formatMXN = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  /* -----------------------------
     PRINT FIX (señal real)
  ------------------------------*/
  const handlePrintSignal = (view: "grouped" | "tickets") => {
    window.dispatchEvent(
      new CustomEvent("checkout-print", {
        detail: {
          view,
          orderId: activeOrder?.id,
          tableId: activeOrder?.tableId,
        },
      })
    );

    setCheckoutView(view);
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[300]",
        "flex items-center justify-center",
        "backdrop-blur-sm p-4",
        "animate-in fade-in duration-200",
        darkMode ? "bg-black/70" : "bg-black/40"
      )}
    >
      <div
        className={cn(
          "w-full max-w-6xl",
          "rounded-[30px] border overflow-hidden",
          "shadow-[0_30px_120px_rgba(0,0,0,0.35)]",
          "flex flex-col max-h-[92vh]",
          darkMode
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-zinc-200"
        )}
      >
        {/* HEADER */}
        <div
          className={cn(
            "h-[78px] px-6 flex items-center justify-between border-b",
            darkMode ? "border-zinc-800" : "border-zinc-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                darkMode
                  ? "bg-green-500/15 text-green-300"
                  : "bg-green-100 text-green-600"
              )}
            >
              <Receipt size={18} />
            </div>

            <div>
              <h2
                className={
                  darkMode
                    ? "text-white font-semibold"
                    : "text-zinc-900 font-semibold"
                }
              >
                {selectedTable?.name}
              </h2>
              <p
                className={
                  darkMode
                    ? "text-zinc-400 text-sm"
                    : "text-zinc-500 text-sm"
                }
              >
                Cobro / Checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLayoutMode(
                  layoutMode === "horizontal"
                    ? "vertical"
                    : "horizontal"
                )
              }
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center",
                darkMode
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700"
              )}
            >
              <ArrowLeftRight size={16} />
            </button>

            <button
              onClick={onClose}
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center",
                darkMode
                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                  : "bg-red-50 border-red-200 text-red-600"
              )}
            >
              ✕
            </button>
          </div>
        </div>

        {/* INTRO */}
        <div className="px-6 py-4">
          <p
            className={
              darkMode
                ? "text-white font-semibold"
                : "text-zinc-900 font-semibold"
            }
          >
            Formato del recibo de pago
          </p>
          <p
            className={
              darkMode
                ? "text-zinc-400 text-sm"
                : "text-zinc-500 text-sm"
            }
          >
            Elige la visualización y presentación de los productos consumidos
          </p>
        </div>

        {/* CONTENT */}
        <div
          className={cn(
            "flex-1 overflow-hidden p-5 gap-4",
            layoutMode === "horizontal"
              ? "grid grid-cols-2"
              : "flex flex-col overflow-y-auto"
          )}
        >
          {/* RESUMEN */}
          <div
            className={cn(
              "rounded-2xl border overflow-hidden",
              darkMode
                ? "bg-zinc-950 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            )}
          >
            <div className="px-4 py-3 border-b">
              <h3
                className={
                  darkMode
                    ? "text-white font-semibold"
                    : "text-zinc-900 font-semibold"
                }
              >
                Resumen
              </h3>
            </div>

            <div
              className={cn(
                "p-4 space-y-4",
                layoutMode === "vertical"
                  ? "max-h-[65vh] overflow-y-auto"
                  : ""
              )}
            >
              {/* COCINA */}
              <div>
                <p className="text-sm font-semibold mb-2 text-orange-500">
                  Cocina
                </p>

                {Object.values(groupedItems || {})
                  .filter((i: any) => i.station !== "BAR")
                  .map((i: any) => {
                    const price = resolvePrice(i);

                    return (
                      <div
                        key={i.id}
                        className="flex justify-between text-sm py-1"
                      >
                        <div className="flex gap-2">
                          <span className="font-semibold">
                            x{i.totalQty}
                          </span>
                          <span
                            className={
                              darkMode
                                ? "text-white"
                                : "text-zinc-900"
                            }
                          >
                            {i.product?.name}
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <div className="text-zinc-400">
                            {formatMXN(price)}
                          </div>
                          <div
                            className={
                              darkMode
                                ? "text-white"
                                : "text-zinc-900"
                            }
                          >
                            {formatMXN(price * i.totalQty)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* BEBIDAS */}
              <div>
                <p className="text-sm font-semibold mb-2 text-cyan-500">
                  Bebidas
                </p>

                {Object.values(groupedItems || {})
                  .filter((i: any) => i.station === "BAR")
                  .map((i: any) => {
                    const price = resolvePrice(i);

                    return (
                      <div
                        key={i.id}
                        className="flex justify-between text-sm py-1"
                      >
                        <div className="flex gap-2">
                          <span className="font-semibold">
                            x{i.totalQty}
                          </span>
                          <span
                            className={
                              darkMode
                                ? "text-white"
                                : "text-zinc-900"
                            }
                          >
                            {i.product?.name}
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <div className="text-zinc-400">
                            {formatMXN(price)}
                          </div>
                          <div
                            className={
                              darkMode
                                ? "text-white"
                                : "text-zinc-900"
                            }
                          >
                            {formatMXN(price * i.totalQty)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* TICKETS */}
          <div
            className={cn(
              "rounded-2xl border overflow-hidden",
              darkMode
                ? "bg-zinc-950 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            )}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3
                className={
                  darkMode
                    ? "text-white font-semibold"
                    : "text-zinc-900 font-semibold"
                }
              >
                Tickets
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintSignal("grouped")}
                  className={cn(
                    "text-xs px-2 py-1 rounded-lg border",
                    checkoutView === "grouped"
                      ? "bg-violet-500/20 text-violet-300"
                      : "text-zinc-400"
                  )}
                >
                  Resumen
                </button>

                <button
                  onClick={() => handlePrintSignal("tickets")}
                  className={cn(
                    "text-xs px-2 py-1 rounded-lg border",
                    checkoutView === "tickets"
                      ? "bg-violet-500/20 text-violet-300"
                      : "text-zinc-400"
                  )}
                >
                  Tickets
                </button>
              </div>
            </div>

            <div
              className={cn(
                "p-4 space-y-3",
                layoutMode === "vertical"
                  ? "max-h-[65vh] overflow-y-auto"
                  : ""
              )}
            >
              {activeOrder?.tickets
                ?.slice()
                .reverse()
                .map((ticket: any) => (
                  <div key={ticket.id} className="text-sm">
                    <div className="flex justify-between text-xs text-zinc-400 mb-2">
                      <span>#{ticket.id}</span>
                      <span>
                        {new Date(
                          ticket.createdAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>

                    {ticket.items.map((i: any) => {
                      const price = resolvePrice(i);

                      return (
                        <div
                          key={i.id}
                          className="flex justify-between"
                        >
                          <span>
                            x{i.quantity} {i.product?.name}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {formatMXN(price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={cn(
            "border-t p-5 flex gap-3",
            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
          )}
        >
          <button
            onClick={onClose}
            className={cn(
              "h-12 w-full rounded-2xl font-semibold border",
              darkMode
                ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                : "bg-zinc-50 border-zinc-200 text-zinc-700"
            )}
          >
            Volver
          </button>

          <button
            disabled={!hasProducts}
            onClick={() => hasProducts && onCheckout()}
            className={cn(
              "h-12 w-full rounded-2xl font-semibold transition-all",
              hasProducts
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
            )}
          >
            {hasProducts
              ? `Cobrar ${formatMXN(total)}`
              : "No hay productos"}
          </button>
        </div>
      </div>
    </div>
  );
}