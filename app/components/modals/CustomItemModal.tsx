"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChefHat,
  Martini,
  Plus,
  X,
} from "lucide-react";

export function CustomItemModal({
  open,
  customItem,
  onClose,
  onChange,
  onAdd,
  darkMode = false,
}: {
  open: boolean;
  customItem: {
    name: string;
    price: string;
    station: "KITCHEN" | "BAR";
  };
  onClose: () => void;
  onChange: (
    patch: Partial<{
      name: string;
      price: string;
      station: "KITCHEN" | "BAR";
    }>
  ) => void;
  onAdd: () => void;
  darkMode?: boolean;
}) {
  const [showErrors, setShowErrors] =
    useState(false);

  if (!open) return null;

  const nameError =
    showErrors &&
    !customItem.name.trim();

  const priceError =
    showErrors &&
    !customItem.price.trim();

  const handleAdd = () => {
    const invalid =
      !customItem.name.trim() ||
      !customItem.price.trim();

    if (invalid) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    onAdd();
  };

  const handleClose = () => {
    setShowErrors(false);
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200]",
        "flex items-center justify-center",
        "backdrop-blur-sm",
        "animate-in fade-in duration-200",
        darkMode
          ? "bg-black/70"
          : "bg-black/40"
      )}
    >

      {/* MODAL */}
      <div
        className={cn(
          "w-full max-w-md mx-4",
          "rounded-3xl border shadow-2xl",
          "overflow-hidden",
          "animate-in zoom-in-95 duration-200",
          "transition-colors duration-200",

          darkMode
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-zinc-200"
        )}
      >

        {/* HEADER */}
        <div
          className={cn(
            "px-5 h-[72px]",
            "border-b",
            "flex items-center justify-between",

            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
          )}
        >

          <div className="flex items-center gap-3">

            <div
              className={cn(
                "w-11 h-11 rounded-2xl",
                "flex items-center justify-center",

                darkMode
                  ? "bg-violet-500/15 text-violet-300"
                  : "bg-violet-100 text-violet-700"
              )}
            >
              <Plus size={18} />
            </div>

            <div>

              <h2 className={cn("text-sm font-semibold tracking-tight",
                 darkMode
                    ? "text-zinc-400 "
                    : "text-muted-foreground "
              )}>
                Producto manual
              </h2>

              <p
                className={cn(
                  "text-xs mt-0.5",

                  darkMode
                    ? "text-zinc-400 "
                    : "text-muted-foreground "
                )}
              >
                Agregar producto personalizado
              </p>

            </div>

          </div>

          {/* CLOSE */}
          <button
            onClick={handleClose}
            className={cn(
              "w-9 h-9 rounded-xl border",
              "flex items-center justify-center",
              "transition-all duration-200",

              darkMode
                ? `
                  bg-red-500/10
                  border-red-500/30
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
            <X size={16} />
          </button>

        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">

          {/* NAME */}
          <div className="space-y-2">

            <div className="flex items-center gap-2">

              <label
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                Nombre
              </label>

              {nameError && (
                <span className="text-[11px] font-semibold text-red-500">
                  * Requerido
                </span>
              )}

            </div>

            <input
              type="text"
              placeholder="Ej. Coca Cola 2L"
              value={customItem.name}
              onChange={(e) =>
                onChange({
                  name: e.target.value,
                })
              }
              className={cn(
                "w-full h-12 rounded-2xl border px-4",
                "outline-none transition-all duration-200",
                "text-sm font-medium",

                nameError
                  ? `
                    border-red-500
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-500/20
                  `
                  : darkMode
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

          </div>

          {/* PRICE */}
          <div className="space-y-2">

            <div className="flex items-center gap-2">

              <label
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                Precio
              </label>

              {priceError && (
                <span className="text-[11px] font-semibold text-red-500">
                  * Requerido
                </span>
              )}

            </div>

            <div className="relative">

              {/* MXN */}
              <div
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2",
                  "text-sm font-semibold pointer-events-none",

                  darkMode
                    ? "text-zinc-400"
                    : "text-zinc-500"
                )}
              >
                MX$
              </div>

              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={customItem.price}
                onChange={(e) =>
                  onChange({
                    price: e.target.value,
                  })
                }
                className={cn(
                  "w-full h-12 rounded-2xl border",
                  "pl-[58px] pr-4",
                  "outline-none transition-all duration-200",
                  "text-sm font-semibold tracking-tight",

                  priceError
                    ? `
                      border-red-500
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-500/20
                    `
                    : darkMode
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

            </div>

          </div>

          {/* STATIONS */}
          <div className="space-y-2">

            <label
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",

                darkMode
                  ? "text-zinc-400"
                  : "text-zinc-500"
              )}
            >
              Destino
            </label>

            <div className="grid grid-cols-2 gap-2">

              {/* KITCHEN */}
              <button
                onClick={() =>
                  onChange({
                    station: "KITCHEN",
                  })
                }
                className={cn(
                  "h-[56px] rounded-2xl border",
                  "transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "font-semibold text-sm",

                  customItem.station ===
                    "KITCHEN"
                    ? darkMode
                      ? `
                        bg-violet-500/20
                        border-violet-500
                        text-violet-200
                      `
                      : `
                        bg-violet-100
                        border-violet-300
                        text-violet-700
                      `
                    : darkMode
                    ? `
                      bg-zinc-800
                      border-zinc-700
                      hover:bg-zinc-700
                    `
                    : `
                      bg-white
                      border-zinc-200
                      hover:bg-zinc-100
                    `
                )}
              >
                <ChefHat size={16} />
                Cocina
              </button>

              {/* BAR */}
              <button
                onClick={() =>
                  onChange({
                    station: "BAR",
                  })
                }
                className={cn(
                  "h-[56px] rounded-2xl border",
                  "transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  "font-semibold text-sm",

                  customItem.station ===
                    "BAR"
                    ? darkMode
                      ? `
                        bg-cyan-500/20
                        border-cyan-500
                        text-cyan-200
                      `
                      : `
                        bg-cyan-100
                        border-cyan-300
                        text-cyan-700
                      `
                    : darkMode
                    ? `
                      bg-zinc-800
                      border-zinc-700
                      hover:bg-zinc-700
                    `
                    : `
                      bg-white
                      border-zinc-200
                      hover:bg-zinc-100
                    `
                )}
              >
                <Martini size={16} />
                Bebidas
              </button>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div
          className={cn(
            "px-5 py-4 border-t",
            "flex items-center justify-end gap-2",

            darkMode
              ? "border-zinc-800"
              : "border-zinc-200"
          )}
        >

          <button
            onClick={handleClose}
            className={cn(
              "h-11 px-5 rounded-2xl border",
              "font-semibold text-sm",
              "transition-all duration-200",

              darkMode
                ? `
                  bg-red-500/10
                  border-red-500/30
                  text-red-300
                  hover:bg-red-500/20
                `
                : `
                  bg-red-50
                  border-red-200
                  text-red-700
                  hover:bg-red-100
                `
            )}
          >
            Cancelar
          </button>

          <button
            onClick={handleAdd}
            className={cn(
              "h-11 px-5 rounded-2xl",
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
            Agregar
          </button>

        </div>

      </div>
    </div>
  );
}