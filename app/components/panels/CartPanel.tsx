"use client";

import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/app/stores/uiStore";
import { useOrderStore } from "@/app/stores/orderStore";
import { getItemName, getItemStation } from "@/lib/orderItem";
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
  CarTaxiFront,
  FastForwardIcon,
} from "lucide-react";
import { SectionCard } from "@/app/src/components/ui/SectionCard";
import { theme } from "@/app/src/lib/ui/theme";
import { SectionHeader } from "@/app/src/components/ui/SectionHeader";
import  { StatusIcon } from "@/app/src/components/ui/StatusIcon"
import { SectionLabel } from "@/app/src/components/ui/SectionLabel";
import { RowItem } from "@/app/src/components/ui/RowItem";
import { PrimaryButton } from "@/app/src/components/ui/PrimaryButton";
import { DangerButton } from "@/app/src/components/ui/DangerButton";
import { QuantityControl } from "@/app/src/components/ui/QuantityControl";

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
  const base = getItemName(item).trim();

  const note =
    typeof item.notes ===
      "string" &&
    item.notes.trim()
      ? item.notes.trim()
      : "";

  const notePart = note
    ? ` - ${note}`
    : "";

  return `${base || "Item"}${notePart}`;
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

function PendingQuantityCluster({
  darkMode,
  quantity,
  onDecrease,
  onIncrease,
}: {
  darkMode: boolean;
  quantity: number;
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
        {quantity}
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
    displayName?: string
  ) => void;

  onIncreasePending: (
    id: string | number,
    displayName?: string
  ) => void;

  onRemovePending: (
    id: string | number,
    displayName?: string
  ) => void;

  onPendingNoteChange: (
    id: string | number,
    displayName: string | undefined,
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


  return (
    <div
      className={cn(
        `
          h-full
          flex
          flex-col
          overflow-hidden
          transition-colors
          duration-200
        `,
        theme.surface.page
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

          <SectionCard
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

                  <StatusIcon variant="products">
                    <FastForwardIcon size={18} />
                  </StatusIcon>

                  <div>

                    <h3 className="text-sm font-semibold">
                      Creando orden
                    </h3>

                    </div>

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
                  <SectionLabel>
                    Cocina
                  </SectionLabel>

                  {pendingCartKitchen.map(
                    (p: any) => (
                      <RowItem
                        key={`${p.id}-${p.displayName}`}
                      >

                        <DangerButton
                          onClick={() =>
                            onRemovePending(
                              p.id,
                              p.displayName
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </DangerButton>

                        <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                          {p.displayName || "Item"}
                        </div>

                        <QuantityControl
                          quantity={p.quantity}
                          onDecrease={() =>
                            onDecreasePending(
                              p.id,
                              p.displayName
                            )
                          }
                          onIncrease={() =>
                            onIncreasePending(
                              p.id,
                              p.displayName
                            )
                          }
                        />

                      </RowItem>
                    )
                  )}
                </>
              )}

              {pendingCartBar.length >
                0 && (
                <>
                  <SectionLabel>
                    Bebidas
                  </SectionLabel>

                  {pendingCartBar.map(
                    (p: any) => (
                      <RowItem
                        key={`bar-p-${p.id}-${p.displayName}`}
                      >

                        <DangerButton
                          onClick={() =>
                            onRemovePending(
                              p.id,
                              p.displayName
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </DangerButton>

                        <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                          {p.displayName || "Item"}
                        </div>

                        <QuantityControl
                          quantity={p.quantity}
                          onDecrease={() =>
                            onDecreasePending(
                              p.id,
                              p.displayName
                            )
                          }
                          onIncrease={() =>
                            onIncreasePending(
                              p.id,
                              p.displayName
                            )
                          }
                        />

                      </RowItem>
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

                <PrimaryButton
                  className="w-full"
                  onClick={async () => {
                    await onConfirmAddToOrder();

                    onOpenSendModal();
                  }}
                >
                  Agregar a orden
                </PrimaryButton>

              </div>

            </div>

          </SectionCard>
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
            <SectionCard>

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

                  <StatusIcon variant="kitchen">
                    <Clock3 size={18} />
                  </StatusIcon>

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

                <PrimaryButton
                  className="h-9 px-4 rounded-xl text-xs"
                  onClick={
                    onOpenSendModal
                  }
                >
                  Confirmar
                </PrimaryButton>

              </div>

              <div>

                {pendingKitchenItems.length >
                  0 && (
                  <>
                    <SectionLabel>
                      Cocina
                    </SectionLabel>

                    {pendingKitchenItems.map(
                      (i: any) => (
                        <RowItem
                          key={i.id}
                        >

                          <DangerButton
                            onClick={() =>
                              deleteOrderItem(
                                Number(i.id)
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </DangerButton>

                          <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                            {i.displayName || "Item"}
                          </div>

                          <QuantityControl
                            
                            quantity={Number(
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

                        </RowItem>
                      )
                    )}
                  </>
                )}

                {pendingBarItems.length >
                  0 && (
                  <>
                    <SectionLabel>
                      Bebidas
                    </SectionLabel>

                    {pendingBarItems.map(
                      (i: any) => (
                        <RowItem
                          key={i.id}
                        >

                          <DangerButton
                            onClick={() =>
                              deleteOrderItem(
                                Number(i.id)
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </DangerButton>

                          <div className="flex-1 min-w-0 px-2 text-sm font-semibold truncate">
                            {i.displayName || "Item"}
                          </div>

                          <QuantityControl
                            
                            quantity={Number(
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

                        </RowItem>
                      )
                    )}
                  </>
                )}

              </div>

            </SectionCard>
          )}

          {/* KITCHEN */}
          {kitchenSentItems.length >
            0 && (
            <SectionCard>

              <SectionHeader
                title="En cocina"
                description="Preparando alimentos"
                icon={
                  <StatusIcon variant="kitchen">
                    <ChefHat size={18} />
                  </StatusIcon>
                }
              />

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
                              <RowItem
                                key={i.id}
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

                              </RowItem>
                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </SectionCard>
          )}

          {/* BAR */}
          {barSentItems.length >
            0 && (
            <SectionCard>

             <SectionHeader
              title="En bar"
              description="Preparando bebidas"
             
              icon={
                <StatusIcon variant="bar">
                  <Martini size={18} />
                </StatusIcon>
              }
            />

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
                              <RowItem
                                key={i.id}
                                className={cn(
                                  recentItems.includes(
                                    Number(i.id)
                                  ) &&
                                    "ring-2 ring-inset ring-cyan-500/40"
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

                              </RowItem>
                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </SectionCard>
          )}

          {/* DONE */}
          {orderItems.some(
            (i: any) =>
              i.status === "DONE"
          ) && (
            <SectionCard>

              <div
                className={cn(
                  "h-14 px-4 border-b",
                  "flex items-center gap-3",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200"
                )}
              >

                <StatusIcon variant="success">
                  <CheckCircle2 size={18} />
                </StatusIcon>

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
                        {i.displayName || "Item"}
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

            </SectionCard>
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

