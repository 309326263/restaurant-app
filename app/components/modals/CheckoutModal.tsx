"use client";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/app/stores/uiStore";
import {
  Receipt,
  ArrowLeftRight,
  Printer,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  getItemName,
  getItemPrice,
  getItemQty,
} from "@/lib/orderItem";

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
  setCheckoutView: (
    view: "grouped" | "tickets"
  ) => void;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}) {
  const { darkMode } = useUiStore();

  const [layoutMode, setLayoutMode] = useState<
    "vertical" | "horizontal"
  >("horizontal");

  const hasProducts = useMemo(() => {
    const items = activeOrder?.items || [];

    return items.some((i: any) => getItemQty(i) > 0);
  }, [activeOrder]);

  const formatMXN = (value: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  const handlePrintSignal = (
    view: "grouped" | "tickets"
  ) => {
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

  const groupedArray = Object.values(
    groupedItems || {}
  );

  const kitchenItems = groupedArray.filter(
    (i: any) => i.station !== "BAR"
  );

  const barItems = groupedArray.filter(
    (i: any) => i.station === "BAR"
  );

  const isVertical =
    layoutMode === "vertical";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[300]",
        "flex items-center justify-center",
        "backdrop-blur-sm p-4",
        "animate-in fade-in duration-200",
        darkMode
          ? "bg-black/70"
          : "bg-black/40"
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
            "h-[78px] px-6 flex items-center justify-between border-b shrink-0",
            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
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
                  layoutMode ===
                    "horizontal"
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

        {/* SCROLL GENERAL */}
        <div className="flex-1 overflow-y-auto">
          {/* TOP INFO FIXED */}
          <div
            className={cn(
              "sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4 border-b backdrop-blur-xl",
              darkMode
                ? "bg-zinc-900/95 border-zinc-800"
                : "bg-white/95 border-zinc-200"
            )}
          >
            <div>
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
                Elige el formato para la
                impresión del recibo de pago
              </p>
            </div>

            <div
              className={cn(
                "flex items-center overflow-hidden rounded-2xl border shrink-0",
                darkMode
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-200 bg-zinc-50"
              )}
            >
              <button
                onClick={() =>
                  handlePrintSignal(
                    "grouped"
                  )
                }
                className={cn(
                  "h-10 px-4 flex items-center gap-2 text-sm transition-colors",
                  checkoutView ===
                    "grouped"
                    ? darkMode
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : darkMode
                      ? "text-zinc-300"
                      : "text-zinc-700"
                )}
              >
                <Printer size={14} />
                Resumen
              </button>

              <button
                onClick={() =>
                  handlePrintSignal(
                    "tickets"
                  )
                }
                className={cn(
                  "h-10 px-4 flex items-center gap-2 text-sm border-l transition-colors",
                  darkMode
                    ? "border-zinc-700"
                    : "border-zinc-200",
                  checkoutView ===
                    "tickets"
                    ? darkMode
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : darkMode
                      ? "text-zinc-300"
                      : "text-zinc-700"
                )}
              >
                <Printer size={14} />
                Tickets
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div
            className={cn(
              "p-5 gap-4",
              isVertical
                ? "flex flex-col"
                : "grid grid-cols-2"
            )}
          >
            {/* RESUMEN */}
            <div
              className={cn(
                "rounded-2xl border overflow-hidden flex flex-col",
                darkMode
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              )}
            >
              <div className="px-4 py-3 border-b border-inherit shrink-0">
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
                  "p-4 space-y-6",
                  !isVertical &&
                    "overflow-y-auto max-h-[65vh]"
                )}
              >
                {/* COCINA */}
                <div>
                  <p className="text-sm font-semibold mb-2 text-orange-500">
                    Cocina
                  </p>

                  <div className="space-y-2">
                    {kitchenItems.map(
                      (i: any, idx: number) => {
                        const unitPrice = getItemPrice(i);

                        const quantity = getItemQty(i);

                        return (
                          <div
                            key={`${i.id}-${idx}`}
                            className="flex justify-between text-sm py-1 gap-3"
                          >
                            <div className="flex gap-2 min-w-0">
                              <span
                                className={cn(
                                  "font-semibold shrink-0",
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                )}
                              >
                                x{quantity}
                              </span>

                              <span
                                className={cn(
                                  "truncate",
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                )}
                              >
                                {getItemName(i)}
                              </span>
                            </div>

                            <div className="text-right text-xs shrink-0">
                              {quantity > 1 && (
                                <div className="text-zinc-400">
                                  {formatMXN(
                                    unitPrice
                                  )}
                                </div>
                              )}

                              <div
                                className={
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                }
                              >
                                {formatMXN(
                                  unitPrice * quantity
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* BAR */}
                <div>
                  <p className="text-sm font-semibold mb-2 text-cyan-500">
                    Bebidas
                  </p>

                  <div className="space-y-2">
                    {barItems.map(
                      (i: any, idx: number) => {
                        const unitPrice = getItemPrice(i);

                        const quantity = getItemQty(i);

                        return (
                          <div
                            key={`${i.id}-${idx}`}
                            className="flex justify-between text-sm py-1 gap-3"
                          >
                            <div className="flex gap-2 min-w-0">
                              <span
                                className={cn(
                                  "font-semibold shrink-0",
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                )}
                              >
                                x{quantity}
                              </span>

                              <span
                                className={cn(
                                  "truncate",
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                )}
                              >
                                {getItemName(i)}
                              </span>
                            </div>

                            <div className="text-right text-xs shrink-0">
                              {quantity > 1 && (
                                <div className="text-zinc-400">
                                  {formatMXN(
                                    unitPrice
                                  )}
                                </div>
                              )}

                              <div
                                className={
                                  darkMode
                                    ? "text-white"
                                    : "text-zinc-900"
                                }
                              >
                                {formatMXN(
                                  unitPrice * quantity
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TICKETS */}
            <div
              className={cn(
                "rounded-2xl border overflow-hidden flex flex-col",
                darkMode
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              )}
            >
              <div className="px-4 py-3 border-b border-inherit shrink-0">
                <h3
                  className={
                    darkMode
                      ? "text-white font-semibold"
                      : "text-zinc-900 font-semibold"
                  }
                >
                  Tickets
                </h3>
              </div>

              <div
                className={cn(
                  "p-4 space-y-5",
                  !isVertical &&
                    "overflow-y-auto max-h-[65vh]"
                )}
              >
                {activeOrder?.tickets
                  ?.slice()
                  .reverse()
                  .map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="text-sm"
                    >
                      <div className="flex justify-between text-xs text-zinc-400 mb-3">
                        <span>
                          #{ticket.id}
                        </span>

                        <span>
                          {new Date(
                            ticket.createdAt
                          ).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {ticket.items.map(
                          (
                            i: any,
                            idx: number
                          ) => {
                            const quantity = getItemQty(i);

                            const unitPrice =
                              getItemPrice(i);

                            const totalPrice =
                              unitPrice * quantity;

                            return (
                              <div
                                key={`${i.id}-${idx}`}
                                className="flex justify-between gap-3"
                              >
                                <span
                                  className={cn(
                                    "min-w-0",
                                    darkMode
                                      ? "text-white"
                                      : "text-zinc-900"
                                  )}
                                >
                                  x{quantity}{" "}
                                  {getItemName(i)}
                                </span>

                                <span className="text-xs text-zinc-400 shrink-0">
                                  {formatMXN(
                                    totalPrice
                                  )}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={cn(
            "border-t p-5 flex gap-3 shrink-0",
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
            onClick={() =>
              hasProducts &&
              onCheckout()
            }
            className={cn(
              "h-12 w-full rounded-2xl font-semibold transition-all",
              hasProducts
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
            )}
          >
            {hasProducts
              ? `Cobrar ${formatMXN(
                  total
                )}`
              : "No hay productos"}
          </button>
        </div>
      </div>
    </div>
  );
}
