"use client";

import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/app/stores/uiStore";
import { useOrderStore } from "@/app/stores/orderStore";
import { getItemStation } from "@/lib/orderItem";
import { cn } from "@/lib/utils";
import {
  ChefHat,
  Martini,
  Clock3,
  CheckCircle2,
  Receipt,
  Trash2,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";

function formatTimeLabel(
  value: string | Date | null | undefined
) {
  if (!value) return "—";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString(
    "es-MX",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function buildDisplayName(
  item: any
) {
  const base =
    item.product?.name ||
    item.customName ||
    "";

  const variantPart =
    item.variantName
      ? ` - ${item.variantName}`
      : "";

  const note =
    typeof item.notes ===
      "string" &&
    item.notes.trim()
      ? item.notes.trim()
      : "";

  const notePart = note
    ? ` - ${note}`
    : "";

  return `${base}${variantPart}${notePart}`;
}

function sortWithNotesFirst(
  items: any[]
) {
  return [...items].sort(
    (
      a,
      b
    ) => {
      const an =
        typeof a.notes ===
          "string" &&
        a.notes.trim()
          ? 1
          : 0;

      const bn =
        typeof b.notes ===
          "string" &&
        b.notes.trim()
          ? 1
          : 0;

      if (an !== bn) {
        return bn - an;
      }

      return (
        Number(a.id) -
        Number(b.id)
      );
    }
  );
}

function groupByTicketId(
  items: any[]
) {
  const map = new Map<
    string | number,
    any[]
  >();

  for (const item of items) {
    const key =
      item.ticketId ??
      `solo-${item.id}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);
  }

  return [...map.entries()].sort(
    (
      [, aItems],
      [, bItems]
    ) => {
      const ta = Math.min(
        ...aItems.map(
          (i) =>
            new Date(
              i.sentAt ||
                0
            ).getTime()
        )
      );

      const tb = Math.min(
        ...bItems.map(
          (i) =>
            new Date(
              i.sentAt ||
                0
            ).getTime()
        )
      );

      return ta - tb;
    }
  );
}

function PendingQtyCluster({
  darkMode,
  qty,
  onDecrease,
  onIncrease,
}: {
  darkMode: boolean;
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl border overflow-hidden",

        darkMode
          ? "border-zinc-700"
          : "border-zinc-200"
      )}
    >
      <button
        type="button"
        onClick={onDecrease}
        className={cn(
          "w-8 h-8 flex items-center justify-center transition-colors",

          darkMode
            ? "hover:bg-zinc-800"
            : "hover:bg-zinc-100"
        )}
      >
        <Minus size={14} />
      </button>

      <div
        className={cn(
          "w-9 text-center text-sm font-semibold",

          darkMode
            ? "text-zinc-200"
            : "text-zinc-700"
        )}
      >
        {qty}
      </div>

      <button
        type="button"
        onClick={onIncrease}
        className={cn(
          "w-8 h-8 flex items-center justify-center transition-colors",

          darkMode
            ? "hover:bg-zinc-800"
            : "hover:bg-zinc-100"
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CartPanel({
  activeOrder,
  categories: _categories,
  pendingCart,
  total,
  recentItems,
  onDecreasePending,
  onIncreasePending,
  onRemovePending,
  onPendingNoteChange: _onPendingNoteChange,
  onConfirmAddToOrder,
  onOpenSendModal,
  onOpenCheckoutModal,
}: {
  activeOrder: any;
  categories: any[];
  pendingCart: any[];
  total: number;
  recentItems: number[];
  onDecreasePending: (
    id: string | number,
    variant?: string
  ) => void;

  onIncreasePending: (
    id: string | number,
    variant?: string
  ) => void;

  onRemovePending: (
    id: string | number,
    variant?: string
  ) => void;

  onPendingNoteChange: (
    id: string | number,
    variant: string | undefined,
    note: string
  ) => void;

  onConfirmAddToOrder: () => Promise<void>;

  onOpenSendModal: () => void;
  onOpenCheckoutModal: () => void;
}) {
  const selectedTable =
    useOrderStore(
      (s) => s.selectedTable
    );

  const {
    darkMode,
  } = useUiStore();

  const cartScrollRef =
    useRef<HTMLDivElement>(null);

  const [
    showScrollBottom,
    setShowScrollBottom,
  ] = useState(false);

  const orderItems =
    activeOrder?.items || [];

  const showCobrar =
    orderItems.some(
      (i: any) =>
        (i.station ===
          "KITCHEN" ||
          i.station ===
            "BAR") &&
        (i.status ===
          "SENT" ||
          i.status ===
            "DONE")
    );

  const hasAnyItems =
    pendingCart.length >
      0 ||
    orderItems.length > 0;

  const showWaitingProducts =
    !!selectedTable &&
    !hasAnyItems;

  const tableDisplayName =
    activeOrder?.table
      ?.name ??
    selectedTable?.name;

  const pendingKitchenItems =
    orderItems.filter(
      (i: any) =>
        i.status ===
          "PENDING" &&
        getItemStation(i) ===
          "KITCHEN"
    );

  const pendingBarItems =
    orderItems.filter(
      (i: any) =>
        i.status ===
          "PENDING" &&
        getItemStation(i) === "BAR"
    );

  const kitchenSentItems =
    orderItems.filter(
      (i: any) =>
        (i.status ===
          "SENT" ||
          i.status ===
            "IN_PROGRESS") &&
        getItemStation(i) ===
          "KITCHEN"
    );

  const barSentItems =
    orderItems.filter(
      (i: any) =>
        (i.status ===
          "SENT" ||
          i.status ===
            "IN_PROGRESS") &&
        getItemStation(i) === "BAR"
    );

  const pendingCartKitchen =
    pendingCart.filter(
      (p: any) =>
        getItemStation(p) ===
        "KITCHEN"
    );

  const pendingCartBar =
    pendingCart.filter(
      (p: any) =>
        getItemStation(p) === "BAR"
    );

  const tickets =
    activeOrder?.tickets ||
    [];

  useEffect(() => {
    const el = cartScrollRef.current;

    if (!el) return;

    const handleScroll = () => {
      const isNearBottom =
        el.scrollHeight -
          el.scrollTop -
          el.clientHeight <
        120;

      setShowScrollBottom(
        !isNearBottom
      );
    };

    handleScroll();

    el.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      el.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [activeOrder]);

  const patchItemQty =
    async (
      id: number,
      quantity: number
    ) => {
      await fetch(
        `/api/orders/items/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );
    };

  const deleteOrderItem =
    async (id: number) => {
      await patchItemQty(
        id,
        0
      );
    };

  const deleteButtonClass =
    cn(
      "w-8 h-8 shrink-0 rounded-lg border",
      "flex items-center justify-center",
      "transition-all duration-200",

      darkMode
        ? `
          bg-red-500/10
          border-red-500/20
          text-red-300
          hover:bg-red-500/20
        `
        : `
          bg-red-50
          border-red-200
          text-red-600
          hover:bg-red-100
        `
    );

  const continuousRowClass =
    cn(
      "flex items-center min-h-11 px-3",
      "border-b last:border-b-0",

      darkMode
        ? "border-zinc-800 bg-zinc-950"
        : "border-zinc-200 bg-zinc-50"
    );

  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden transition-colors duration-200",
        darkMode
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-900"
      )}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className={cn(
          "h-[60px] shrink-0 border-b px-4",
          "flex items-center justify-between gap-3",
          "transition-colors duration-200",

          darkMode
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-zinc-200"
        )}
      >

        <div>

          <h3 className="text-sm font-semibold tracking-tight">
            Orden actual
          </h3>

          <p
            className={cn(
              "text-[11px] mt-0.5",

              darkMode
                ? "text-zinc-400"
                : "text-muted-foreground"
            )}
          >
            Control de pedidos
          </p>

        </div>

        <div className="flex items-center gap-3 shrink-0">

          {tableDisplayName && (
            <span className="text-sm font-bold whitespace-nowrap">
              {tableDisplayName}
            </span>
          )}

          {showCobrar && (
            <button
              onClick={
                onOpenCheckoutModal
              }
              className={cn(
                "h-9 px-4 rounded-xl border",
                "text-xs font-semibold",
                "transition-all duration-200",
                "flex items-center gap-2",

                darkMode
                  ? `
                    bg-emerald-500/15
                    border-emerald-500/20
                    text-emerald-300
                    hover:bg-emerald-500/20
                  `
                  : `
                    bg-emerald-50
                    border-emerald-200
                    text-emerald-700
                    hover:bg-emerald-100
                  `
              )}
            >
              <Receipt size={14} />
              Cobrar
            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          SCROLL AREA
      ===================================================== */}
      <div
        ref={cartScrollRef}
        className="flex-1 overflow-y-auto min-h-0 p-2 space-y-3"
      >

        {/* =====================================================
            PENDING CART
        ===================================================== */}
        {pendingCart.length > 0 && (

          <div
            className={cn(
              "rounded-2xl border overflow-hidden",
              "transition-colors duration-200",

              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            )}
          >

            <div
              className={cn(
                "h-12 px-4 border-b",
                "flex items-center justify-between",

                darkMode
                  ? "border-zinc-800"
                  : "border-zinc-200"
              )}
            >

              <div>

                <h3 className="text-sm font-semibold">
                  Carrito pendiente
                </h3>

              </div>

              <span
                className={cn(
                  "text-[11px] font-medium",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                {pendingCart.length} productos
              </span>

            </div>

            <div>

              {pendingCartKitchen.length >
                0 && (
                <>
                  <div
                    className={cn(
                      "px-3 py-2 text-xs font-semibold border-b",

                      darkMode
                        ? "border-zinc-800 text-zinc-300"
                        : "border-zinc-200 text-zinc-700"
                    )}
                  >
                    Cocina
                  </div>

                  {pendingCartKitchen.map(
                    (p: any) => (
                      <div
                        key={`${p.id}-${p.variant}`}
                        className={
                          continuousRowClass
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            onRemovePending(
                              p.id,
                              p.variant
                            )
                          }
                          className={
                            deleteButtonClass
                          }
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                          {p.customName ||
                            p.displayName ||
                            p.name}
                        </div>

                        <PendingQtyCluster
                          darkMode={
                            darkMode
                          }
                          qty={p.qty}
                          onDecrease={() =>
                            onDecreasePending(
                              p.id,
                              p.variant
                            )
                          }
                          onIncrease={() =>
                            onIncreasePending(
                              p.id,
                              p.variant
                            )
                          }
                        />

                      </div>
                    )
                  )}
                </>
              )}

              {pendingCartBar.length >
                0 && (
                <>
                  <div
                    className={cn(
                      "px-3 py-2 text-xs font-semibold border-b",

                      darkMode
                        ? "border-zinc-800 text-zinc-300"
                        : "border-zinc-200 text-zinc-700"
                    )}
                  >
                    Bebidas
                  </div>

                  {pendingCartBar.map(
                    (p: any) => (
                      <div
                        key={`bar-p-${p.id}-${p.variant}`}
                        className={
                          continuousRowClass
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            onRemovePending(
                              p.id,
                              p.variant
                            )
                          }
                          className={
                            deleteButtonClass
                          }
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                          {p.customName ||
                            p.displayName ||
                            p.name}
                        </div>

                        <PendingQtyCluster
                          darkMode={
                            darkMode
                          }
                          qty={p.qty}
                          onDecrease={() =>
                            onDecreasePending(
                              p.id,
                              p.variant
                            )
                          }
                          onIncrease={() =>
                            onIncreasePending(
                              p.id,
                              p.variant
                            )
                          }
                        />

                      </div>
                    )
                  )}
                </>
              )}

              <div
                className={cn(
                  "p-3 border-t",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <button
                  onClick={async () => {
                    await onConfirmAddToOrder();

                    onOpenSendModal();
                  }}
                  className={cn(
                    "w-full h-12 rounded-2xl",
                    "font-semibold text-sm",
                    "transition-all duration-200",

                    darkMode
                      ? `
                        bg-violet-500
                        hover:bg-violet-400
                        text-white
                      `
                      : `
                        bg-violet-600
                        hover:bg-violet-500
                        text-white
                      `
                  )}
                >
                  Agregar a orden
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            ORDER STATUS BLOCKS
        ===================================================== */}
        <div className="space-y-3">

          {/* PENDING */}
          {orderItems.some(
            (i: any) =>
              i.status ===
              "PENDING"
          ) && (
            <div
              className={cn(
                "rounded-2xl border overflow-hidden",

                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              )}
            >

              <div
                className={cn(
                  "h-14 px-4 border-b",
                  "flex items-center justify-between",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <div className="flex items-center gap-3">

                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl",
                      "flex items-center justify-center",

                      darkMode
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    <Clock3 size={18} />
                  </div>

                  <div>

                    <h3 className="text-sm font-semibold">
                      Pendientes
                    </h3>

                    <p
                      className={cn(
                        "text-[11px]",

                        darkMode
                          ? "text-zinc-400"
                          : "text-muted-foreground"
                      )}
                    >
                      Aún no enviados
                    </p>

                  </div>

                </div>

                <button
                  onClick={
                    onOpenSendModal
                  }
                  className={cn(
                    "h-9 px-4 rounded-xl",
                    "text-xs font-semibold transition-all duration-200",

                    darkMode
                      ? `
                        bg-violet-500
                        hover:bg-violet-400
                        text-white
                      `
                      : `
                        bg-violet-600
                        hover:bg-violet-500
                        text-white
                      `
                  )}
                >
                  Confirmar
                </button>

              </div>

              <div>

                {pendingKitchenItems.length >
                  0 && (
                  <>
                    <div
                      className={cn(
                        "px-3 py-2 text-xs font-semibold border-b",

                        darkMode
                          ? "border-zinc-800 text-zinc-300"
                          : "border-zinc-200 text-zinc-700"
                      )}
                    >
                      Cocina
                    </div>

                    {pendingKitchenItems.map(
                      (i: any) => (
                        <div
                          key={i.id}
                          className={
                            continuousRowClass
                          }
                        >

                          <button
                            type="button"
                            onClick={() =>
                              deleteOrderItem(
                                Number(
                                  i.id
                                )
                              )
                            }
                            className={
                              deleteButtonClass
                            }
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                          <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                            {i.product
                              ?.name ||
                              i.customName}

                            {i.variantName
                              ? ` - ${i.variantName}`
                              : ""}
                          </div>

                          <PendingQtyCluster
                            darkMode={
                              darkMode
                            }
                            qty={Number(
                              i.quantity
                            )}
                            onDecrease={async () =>
                              patchItemQty(
                                i.id,
                                Number(
                                  i.quantity
                                ) -
                                  1
                              )
                            }
                            onIncrease={async () =>
                              patchItemQty(
                                i.id,
                                Number(
                                  i.quantity
                                ) +
                                  1
                              )
                            }
                          />

                        </div>
                      )
                    )}
                  </>
                )}

                {pendingBarItems.length >
                  0 && (
                  <>
                    <div
                      className={cn(
                        "px-3 py-2 text-xs font-semibold border-b",

                        darkMode
                          ? "border-zinc-800 text-zinc-300"
                          : "border-zinc-200 text-zinc-700"
                      )}
                    >
                      Bebidas
                    </div>

                    {pendingBarItems.map(
                      (i: any) => (
                        <div
                          key={i.id}
                          className={
                            continuousRowClass
                          }
                        >

                          <button
                            type="button"
                            onClick={() =>
                              deleteOrderItem(
                                Number(
                                  i.id
                                )
                              )
                            }
                            className={
                              deleteButtonClass
                            }
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                          <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                            {i.product
                              ?.name ||
                              i.customName}

                            {i.variantName
                              ? ` - ${i.variantName}`
                              : ""}
                          </div>

                          <PendingQtyCluster
                            darkMode={
                              darkMode
                            }
                            qty={Number(
                              i.quantity
                            )}
                            onDecrease={async () =>
                              patchItemQty(
                                i.id,
                                Number(
                                  i.quantity
                                ) -
                                  1
                              )
                            }
                            onIncrease={async () =>
                              patchItemQty(
                                i.id,
                                Number(
                                  i.quantity
                                ) +
                                  1
                              )
                            }
                          />

                        </div>
                      )
                    )}
                  </>
                )}

              </div>

            </div>
          )}

          {/* KITCHEN */}
          {kitchenSentItems.length >
            0 && (
            <div
              className={cn(
                "rounded-2xl border overflow-hidden",

                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              )}
            >

              <div
                className={cn(
                  "h-14 px-4 border-b",
                  "flex items-center gap-3",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl",
                    "flex items-center justify-center",

                    darkMode
                      ? "bg-orange-500/15 text-orange-300"
                      : "bg-orange-100 text-orange-700"
                  )}
                >
                  <ChefHat size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    En cocina
                  </h3>

                  <p
                    className={cn(
                      "text-[11px]",

                      darkMode
                        ? "text-zinc-400"
                        : "text-muted-foreground"
                    )}
                  >
                    Preparando alimentos
                  </p>

                </div>

              </div>

              <div className="p-3 space-y-3">

                {groupByTicketId(
                  kitchenSentItems
                ).map(
                  ([
                    ticketKey,
                    ticketItems,
                  ]) => {
                    const sorted =
                      sortWithNotesFirst(
                        ticketItems
                      );

                    const first =
                      sorted[0];

                    const ticketMeta =
                      tickets.find(
                        (
                          t: any
                        ) =>
                          t.id ===
                          first.ticketId
                      );

                    const headerTime =
                      formatTimeLabel(
                        first.sentAt ||
                          ticketMeta?.createdAt
                      );

                    const orderLabel =
                      typeof ticketKey ===
                      "number"
                        ? `#${ticketKey}`
                        : `#${first.id}`;

                    return (
                      <div
                        key={`kitchen-${String(ticketKey)}`}
                        className={cn(
                          "rounded-xl border overflow-hidden",

                          darkMode
                            ? "border-zinc-800"
                            : "border-zinc-200"
                        )}
                      >

                        <div
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-xs font-semibold border-b",

                            darkMode
                              ? "border-zinc-800 bg-zinc-950"
                              : "border-zinc-200 bg-zinc-50"
                          )}
                        >

                          <span>
                            Orden{" "}
                            {orderLabel}
                          </span>

                          <span
                            className={cn(
                              "font-medium tabular-nums",

                              darkMode
                                ? "text-zinc-400"
                                : "text-zinc-500"
                            )}
                          >
                            {headerTime}
                          </span>

                        </div>

                        <div>

                          {sorted.map(
                            (
                              i: any
                            ) => (
                              <div
                                key={i.id}
                                className={cn(
                                  continuousRowClass,

                                  darkMode
                                    ? "bg-zinc-950"
                                    : "bg-zinc-50"
                                )}
                              >

                                <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">
                                  {buildDisplayName(
                                    i
                                  )}
                                </div>

                                <span
                                  className={cn(
                                    "text-xs font-semibold shrink-0 pl-2",

                                    darkMode
                                      ? "text-orange-300"
                                      : "text-orange-700"
                                  )}
                                >
                                  x
                                  {
                                    i.quantity
                                  }
                                </span>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* BAR */}
          {barSentItems.length >
            0 && (
            <div
              className={cn(
                "rounded-2xl border overflow-hidden",

                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              )}
            >

              <div
                className={cn(
                  "h-14 px-4 border-b",
                  "flex items-center gap-3",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl",
                    "flex items-center justify-center",

                    darkMode
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "bg-cyan-100 text-cyan-700"
                  )}
                >
                  <Martini size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    En bar
                  </h3>

                  <p
                    className={cn(
                      "text-[11px]",

                      darkMode
                        ? "text-zinc-400"
                        : "text-muted-foreground"
                    )}
                  >
                    Preparando bebidas
                  </p>

                </div>

              </div>

              <div className="p-3 space-y-3">

                {groupByTicketId(
                  barSentItems
                ).map(
                  ([
                    ticketKey,
                    ticketItems,
                  ]) => {
                    const sorted =
                      sortWithNotesFirst(
                        ticketItems
                      );

                    const first =
                      sorted[0];

                    const ticketMeta =
                      tickets.find(
                        (
                          t: any
                        ) =>
                          t.id ===
                          first.ticketId
                      );

                    const headerTime =
                      formatTimeLabel(
                        first.sentAt ||
                          ticketMeta?.createdAt
                      );

                    const orderLabel =
                      typeof ticketKey ===
                      "number"
                        ? `#${ticketKey}`
                        : `#${first.id}`;

                    return (
                      <div
                        key={`bar-${String(ticketKey)}`}
                        className={cn(
                          "rounded-xl border overflow-hidden",

                          darkMode
                            ? "border-zinc-800"
                            : "border-zinc-200"
                        )}
                      >

                        <div
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-xs font-semibold border-b",

                            darkMode
                              ? "border-zinc-800 bg-zinc-950"
                              : "border-zinc-200 bg-zinc-50"
                          )}
                        >

                          <span>
                            Orden{" "}
                            {orderLabel}
                          </span>

                          <span
                            className={cn(
                              "font-medium tabular-nums",

                              darkMode
                                ? "text-zinc-400"
                                : "text-zinc-500"
                            )}
                          >
                            {headerTime}
                          </span>

                        </div>

                        <div>

                          {sorted.map(
                            (
                              i: any
                            ) => (
                              <div
                                key={i.id}
                                className={cn(
                                  continuousRowClass,

                                  recentItems.includes(
                                    Number(
                                      i.id
                                    )
                                  ) &&
                                    "ring-2 ring-inset ring-cyan-500/40",

                                  darkMode
                                    ? "bg-zinc-950"
                                    : "bg-zinc-50"
                                )}
                              >

                                <div className="flex-1 min-w-0 px-1 text-sm font-medium truncate">
                                  {buildDisplayName(
                                    i
                                  )}
                                </div>

                                <span
                                  className={cn(
                                    "text-xs font-semibold shrink-0 pl-2",

                                    darkMode
                                      ? "text-cyan-300"
                                      : "text-cyan-700"
                                  )}
                                >
                                  x
                                  {
                                    i.quantity
                                  }
                                </span>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* DONE */}
          {orderItems.some(
            (i: any) =>
              i.status === "DONE"
          ) && (
            <div
              className={cn(
                "rounded-2xl border overflow-hidden",

                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              )}
            >

              <div
                className={cn(
                  "h-14 px-4 border-b",
                  "flex items-center gap-3",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl",
                    "flex items-center justify-center",

                    darkMode
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  <CheckCircle2
                    size={18}
                  />
                </div>

                <div>

                  <h3 className="text-sm font-semibold">
                    Listos
                  </h3>

                  <p
                    className={cn(
                      "text-[11px]",

                      darkMode
                        ? "text-zinc-400"
                        : "text-muted-foreground"
                    )}
                  >
                    Productos terminados
                  </p>

                </div>

              </div>

              <div className="p-3 space-y-2">

                {orderItems
                  .filter(
                    (i: any) =>
                      i.status ===
                      "DONE"
                  )
                  .map((i: any) => (
                    <div
                      key={i.id}
                      className={cn(
                        "rounded-xl border p-3",
                        "flex items-center justify-between",

                        darkMode
                          ? `
                            bg-zinc-950
                            border-zinc-800
                          `
                          : `
                            bg-zinc-50
                            border-zinc-200
                          `
                      )}
                    >

                      <div className="text-sm font-medium">
                        {i.product
                          ?.name ||
                          i.customName}

                        {i.variantName
                          ? ` - ${i.variantName}`
                          : ""}
                      </div>

                      <span
                        className={cn(
                          "text-xs font-semibold",

                          darkMode
                            ? "text-emerald-300"
                            : "text-emerald-700"
                        )}
                      >
                        x{i.quantity}
                      </span>

                    </div>
                  ))}

              </div>

            </div>
          )}

        </div>

        {/* =====================================================
            TOTAL
        ===================================================== */}
        <div
          className={cn(
            "rounded-2xl border p-4",
            "sticky bottom-0 backdrop-blur-xl",

            darkMode
              ? `
                bg-zinc-900/90
                border-zinc-800
              `
              : `
                bg-white/90
                border-zinc-200
              `
          )}
        >

          <div className="flex items-center justify-between gap-3">

            <div>

              <p
                className={cn(
                  "text-xs font-medium uppercase tracking-wide",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                Total
              </p>

              {showWaitingProducts ? (
                <p
                  className={cn(
                    "text-base font-semibold mt-1",

                    darkMode
                      ? "text-zinc-300"
                      : "text-zinc-700"
                  )}
                >
                  Esperando productos
                </p>
              ) : (
                <h2 className="text-2xl font-bold tracking-tight">
                  $
                  {Number(
                    total || 0
                  ).toFixed(2)}
                </h2>
              )}

            </div>

            {showCobrar && (
              <button
                onClick={
                  onOpenCheckoutModal
                }
                className={cn(
                  "h-12 px-5 rounded-2xl",
                  "font-semibold text-sm",
                  "transition-all duration-200 shrink-0",

                  darkMode
                    ? `
                      bg-white
                      text-black
                      hover:bg-zinc-200
                    `
                    : `
                      bg-black
                      text-white
                      hover:bg-zinc-800
                    `
                )}
              >
                Cobrar
              </button>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          SCROLL BUTTON
      ===================================================== */}
      {showScrollBottom && (
        <button
          onClick={() => {
            cartScrollRef.current?.scrollTo(
              {
                top: cartScrollRef
                  .current
                  .scrollHeight,
                behavior: "smooth",
              }
            );
          }}
          className={cn(
            "absolute bottom-6 right-6",
            "w-11 h-11 rounded-2xl border",
            "flex items-center justify-center",
            "shadow-xl transition-all duration-200",

            darkMode
              ? `
                bg-zinc-900
                border-zinc-800
                hover:bg-zinc-800
              `
              : `
                bg-white
                border-zinc-200
                hover:bg-zinc-100
              `
          )}
        >
          <ChevronDown size={18} />
        </button>
      )}

    </div>
  );
}
