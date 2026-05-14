"use client";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/app/stores/uiStore";
import {
  ChefHat,
  Martini,
  ClipboardList,
  Printer,
  X,
  Plus,
  Minus,
  Trash2,
  Flame,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { getItemName } from "@/lib/orderItem";

export function SendModal({
  open,
  activeOrder,
  total,
  printKitchen,
  printBar,
  setPrintKitchen,
  setPrintBar,
  editingNotes,
  setEditingNote,
  flashItemId,
  setFlashItemId,
  mutateOrder,
  onClose,
  onSend,
}: {
  open: boolean;
  activeOrder: any;
  total: number;
  printKitchen: boolean;
  printBar: boolean;
  setPrintKitchen: (v: boolean) => void;
  setPrintBar: (v: boolean) => void;
  editingNotes: Record<number, string>;
  setEditingNote: (id: number, note: string) => void;
  flashItemId: number | null;
  setFlashItemId: (id: number | null) => void;
  mutateOrder: () => Promise<any> | any;
  onClose: () => void;
  onSend: () => Promise<void>;
}) {
  const { darkMode } = useUiStore();

  const pendingKitchen = [...(activeOrder?.items || [])]
    .filter(
      (i: any) =>
        i.status === "PENDING" &&
        i.station === "KITCHEN"
    )
    .sort((a: any, b: any) => {
      const aHasNotes =
        (
          editingNotes[a.id] ??
          a.notes ??
          ""
        ).trim() !== "";

      const bHasNotes =
        (
          editingNotes[b.id] ??
          b.notes ??
          ""
        ).trim() !== "";

      return Number(bHasNotes) - Number(aHasNotes);
    });

  const pendingBar = [...(activeOrder?.items || [])]
    .filter(
      (i: any) =>
        i.status === "PENDING" &&
        i.station === "BAR"
    )
    .sort((a: any, b: any) => {
      const aHasNotes =
        (
          editingNotes[a.id] ??
          a.notes ??
          ""
        ).trim() !== "";

      const bHasNotes =
        (
          editingNotes[b.id] ??
          b.notes ??
          ""
        ).trim() !== "";

      return Number(bHasNotes) - Number(aHasNotes);
    });

  const kitchenCount = pendingKitchen.reduce(
    (sum: number, i: any) =>
      sum + Number(i.quantity || 0),
    0
  );

  const barCount = pendingBar.reduce(
    (sum: number, i: any) =>
      sum + Number(i.quantity || 0),
    0
  );

  const globalPrintEnabled = useMemo(
    () => printKitchen || printBar,
    [printKitchen, printBar]
  );

  useEffect(() => {
    if (!open) return;

    const savedKitchen =
      localStorage.getItem(
        "pos-print-kitchen"
      );

    const savedBar =
      localStorage.getItem(
        "pos-print-bar"
      );

    if (savedKitchen !== null) {
      setPrintKitchen(
        savedKitchen === "true"
      );
    }

    if (savedBar !== null) {
      setPrintBar(savedBar === "true");
    }
  }, [open]);

  useEffect(() => {
    localStorage.setItem(
      "pos-print-kitchen",
      String(printKitchen)
    );
  }, [printKitchen]);

  useEffect(() => {
    localStorage.setItem(
      "pos-print-bar",
      String(printBar)
    );
  }, [printBar]);

  const handleGlobalTickets = () => {
    if (
      printKitchen &&
      printBar
    ) {
      setPrintKitchen(false);
      setPrintBar(false);
      return;
    }

    setPrintKitchen(true);
    setPrintBar(true);
  };

  const patchItemQty = async (
    id: number,
    quantity: number
  ) => {
    await fetch(`/api/orders/items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    });

    await Promise.resolve(
      mutateOrder()
    );
  };

  const saveNote = async (
    id: number,
    currentNotes: string
  ) => {
    const res = await fetch(
      `/api/orders/items/${id}/notes`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          notes: currentNotes,
        }),
      }
    );

    let data: any = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    setEditingNote(
      id,
      data.newItemId
        ? ""
        : currentNotes
    );

    await Promise.resolve(
      mutateOrder()
    );

    if (data.newItemId) {
      setFlashItemId(
        Number(data.newItemId)
      );

      setTimeout(
        () =>
          setFlashItemId(null),
        2200
      );
    }
  };

  if (!open) return null;

  const renderItem = (
    i: any,
    idx: number,
    listLength: number
  ) => (
    <div
      key={i.id}
      className={cn(
        "px-5 py-3",
        "transition-all duration-200",

        idx !== listLength - 1 &&
          (darkMode
            ? "border-b border-zinc-800"
            : "border-b border-zinc-200"),

        flashItemId === i.id &&
          "bg-violet-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          <div
            className={cn(
              "text-sm font-medium shrink-0",

              darkMode
                ? "text-zinc-300"
                : "text-zinc-600"
            )}
          >
            x{i.quantity}
          </div>

          <div
            className={cn(
              "text-sm whitespace-nowrap shrink-0",

              darkMode
                ? "text-white"
                : "text-zinc-900"
            )}
          >
            {getItemName(i)}
          </div>

          <input
            type="text"
            placeholder="Agregar nota..."
            value={
              editingNotes[i.id] ??
              i.notes ??
              ""
            }
            onChange={(e) =>
              setEditingNote(
                i.id,
                e.target.value
              )
            }
            className={cn(
              "h-9 px-3 rounded-xl border",
              "outline-none text-sm transition-all duration-200",
              "flex-1 min-w-[180px]",

              darkMode
                ? `
                  bg-zinc-800
                  border-zinc-700
                  text-white
                  placeholder:text-zinc-500
                  focus:border-violet-500
                `
                : `
                  bg-white
                  border-zinc-200
                  text-zinc-900
                  placeholder:text-zinc-400
                  focus:border-violet-400
                `
            )}
          />

          {(editingNotes[i.id] ??
            i.notes ??
            ""
          ).trim() !==
            (
              i.notes ?? ""
            ).trim() && (
            <button
              className={cn(
                "h-9 px-3 rounded-xl",
                "text-xs font-semibold shrink-0",
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
              onClick={() =>
                saveNote(
                  i.id,
                  editingNotes[
                    i.id
                  ] ?? ""
                )
              }
            >
              Guardar
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              patchItemQty(
                i.id,
                Number(i.quantity) -
                  1
              )
            }
            className={cn(
              "w-9 h-9 rounded-xl border",
              "flex items-center justify-center",
              "transition-all duration-200",

              darkMode
                ? `
                  bg-zinc-800
                  border-zinc-700
                  text-zinc-200
                  hover:bg-zinc-700
                `
                : `
                  bg-white
                  border-zinc-200
                  text-zinc-700
                  hover:bg-zinc-100
                `
            )}
          >
            <Minus size={14} />
          </button>

          <button
            onClick={() =>
              patchItemQty(
                i.id,
                Number(i.quantity) +
                  1
              )
            }
            className={cn(
              "w-9 h-9 rounded-xl border",
              "flex items-center justify-center",
              "transition-all duration-200",

              darkMode
                ? `
                  bg-zinc-800
                  border-zinc-700
                  text-zinc-200
                  hover:bg-zinc-700
                `
                : `
                  bg-white
                  border-zinc-200
                  text-zinc-700
                  hover:bg-zinc-100
                `
            )}
          >
            <Plus size={14} />
          </button>

          {/* SEPARADOR */}
          <div className="w-3 shrink-0" />

          <button
            onClick={() =>
              patchItemQty(i.id, 0)
            }
            className={cn(
              "w-9 h-9 rounded-xl border",
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
            )}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

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
      {/* MODAL */}
      <div
        className={cn(
          "w-full max-w-4xl",
          "rounded-[30px] border",
          "shadow-[0_30px_120px_rgba(0,0,0,0.35)]",
          "overflow-hidden",
          "animate-in zoom-in-95 duration-200",
          "flex flex-col max-h-[92vh]",

          darkMode
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-zinc-200"
        )}
      >
        {/* HEADER */}
        <div
          className={cn(
            "h-[78px] px-6 shrink-0",
            "border-b flex items-center justify-between",

            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl",
                "flex items-center justify-center",
                "shadow-inner",

                darkMode
                  ? "bg-blue-500/15 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              <ClipboardList size={20} />
            </div>

            <div>
              <h2
                className={cn(
                  "text-[15px] font-semibold tracking-tight",

                  darkMode
                    ? "text-white"
                    : "text-zinc-900"
                )}
              >
                Confirmar orden
              </h2>

              <p
                className={cn(
                  "text-sm mt-0.5",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                Revisa los productos antes de enviar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={cn(
              "w-11 h-11 rounded-2xl border",
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
            )}
          >
            <X size={17} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* KITCHEN */}
          {pendingKitchen.length > 0 && (
            <div
              className={cn(
                "rounded-[28px] border overflow-hidden",

                darkMode
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              )}
            >
              <div
                className={cn(
                  "px-5 h-[62px]",
                  "border-b flex items-center justify-between",

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
                        ? "bg-orange-500/15 text-orange-300"
                        : "bg-orange-100 text-orange-700"
                    )}
                  >
                    <ChefHat size={18} />
                  </div>

                  <div
                    className={cn(
                      "text-sm font-semibold",

                      darkMode
                        ? "text-white"
                        : "text-zinc-900"
                    )}
                  >
                    Cocina - {kitchenCount} productos
                  </div>
                </div>

                <div
                  className={cn(
                    "px-3 h-9 rounded-xl",
                    "flex items-center gap-2",
                    "text-xs font-semibold",

                    darkMode
                      ? "bg-orange-500/10 text-orange-300"
                      : "bg-orange-100 text-orange-700"
                  )}
                >
                  <Flame size={14} />
                  Cocina
                </div>
              </div>

              <div>
                {pendingKitchen.map(
                  (i: any, idx: number) =>
                    renderItem(
                      i,
                      idx,
                      pendingKitchen.length
                    )
                )}
              </div>
            </div>
          )}

          {/* BAR */}
          {pendingBar.length > 0 && (
            <div
              className={cn(
                "rounded-[28px] border overflow-hidden",

                darkMode
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              )}
            >
              <div
                className={cn(
                  "px-5 h-[62px]",
                  "border-b flex items-center justify-between",

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
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-cyan-100 text-cyan-700"
                    )}
                  >
                    <Martini size={18} />
                  </div>

                  <div
                    className={cn(
                      "text-sm font-semibold",

                      darkMode
                        ? "text-white"
                        : "text-zinc-900"
                    )}
                  >
                    Bebidas - {barCount} productos
                  </div>
                </div>
              </div>

              <div>
                {pendingBar.map(
                  (i: any, idx: number) =>
                    renderItem(
                      i,
                      idx,
                      pendingBar.length
                    )
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className={cn(
            "border-t p-5 shrink-0",

            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* LEFT */}
            <div
              className={cn(
                "h-12 rounded-2xl border overflow-hidden",
                "flex items-center",

                darkMode
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              )}
            >
              <button
                onClick={
                  handleGlobalTickets
                }
                className={cn(
                  "h-full px-4",
                  "flex items-center gap-2",
                  "text-sm font-semibold transition-all duration-200",
                  "border-r",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200",

                  globalPrintEnabled
                    ? darkMode
                      ? `
                        bg-violet-500/15
                        text-violet-300
                      `
                      : `
                        bg-violet-100
                        text-violet-700
                      `
                    : darkMode
                    ? "text-zinc-500"
                    : "text-zinc-500"
                )}
              >
                <Printer size={15} />
                Tickets
              </button>

              <button
                onClick={() =>
                  setPrintKitchen(
                    !printKitchen
                  )
                }
                className={cn(
                  "h-full px-4",
                  "flex items-center gap-2",
                  "text-sm font-semibold transition-all duration-200",
                  "border-r",

                  darkMode
                    ? "border-zinc-800"
                    : "border-zinc-200",

                  printKitchen
                    ? darkMode
                      ? `
                        bg-orange-500/15
                        text-orange-300
                      `
                      : `
                        bg-orange-100
                        text-orange-700
                      `
                    : darkMode
                    ? "text-zinc-500"
                    : "text-zinc-500"
                )}
              >
                <ChefHat size={15} />
                Cocina
              </button>

              <button
                onClick={() =>
                  setPrintBar(
                    !printBar
                  )
                }
                className={cn(
                  "h-full px-4",
                  "flex items-center gap-2",
                  "text-sm font-semibold transition-all duration-200",

                  printBar
                    ? darkMode
                      ? `
                        bg-cyan-500/15
                        text-cyan-300
                      `
                      : `
                        bg-cyan-100
                        text-cyan-700
                      `
                    : darkMode
                    ? "text-zinc-500"
                    : "text-zinc-500"
                )}
              >
                <Martini size={15} />
                Bebidas
              </button>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* <button
                onClick={onClose}
                className={cn(
                  "h-12 px-6 rounded-2xl border",
                  "font-semibold text-sm",
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
                )}
              >
                Cancelar
              </button> */}

              <button
                onClick={onSend}
                className={cn(
                  "h-12 px-6 rounded-2xl",
                  "font-semibold text-sm",
                  "transition-all duration-200",

                  darkMode
                    ? `
                      bg-blue-500
                      hover:bg-blue-400
                      text-white
                    `
                    : `
                      bg-blue-600
                      hover:bg-blue-500
                      text-white
                    `
                )}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}