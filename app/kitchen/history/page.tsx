"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import type {
  KitchenItem,
  KitchenOrder,
  KitchenTable,
} from "@/app/types/kitchen";

function getOrderTime(order: KitchenOrder) {
  const timestamp = new Date(order.createdAt).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : Number(order.id);
}

function formatOrderDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export default function History() {
  const router = useRouter();

  // 🔥 estado filtro
  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  // 🔥 data
  const { data: orders = [] } = useSWR<KitchenOrder[]>(
    "/api/kitchen/history",
    fetcher
  );

  const { data: tables = [] } = useSWR<KitchenTable[]>(
    "/api/tables",
    fetcher
  );

  // 🔥 filtro
  const filteredOrders = (
    selectedTable
      ? orders.filter(
          (o: KitchenOrder) => o.tableId === selectedTable
        )
      : orders
  ).sort(
    (a: KitchenOrder, b: KitchenOrder) =>
      getOrderTime(b) - getOrderTime(a)
  );

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ClipboardList size={30} />

              <span>
                Historial de cocina
              </span>

              <span className="text-zinc-500 text-xl font-medium">
                厨房履歴
              </span>
            </h1>
          </div>

          {/* 🔥 BOTÓN VOLVER */}
          <button
            onClick={() => router.push("/kitchen")}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl transition"
          >
            <ArrowLeft size={18} />

            <span>Volver a cocina</span>
          </button>
        </div>

        {/* 🔥 FILTRO SCROLL HORIZONTAL */}
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-3 mb-6 border-b border-zinc-300">

          {/* TODAS */}
          <button
            onClick={() => setSelectedTable(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedTable === null
                ? "bg-black text-white"
                : "bg-white border border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            Todas
          </button>

          {/* MESAS */}
          {tables.map((t: KitchenTable) => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedTable === t.id
                  ? "bg-black text-white"
                  : "bg-white border border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* 🔥 LISTADO */}
        <div className="flex flex-col gap-4">

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200">
              <p className="text-zinc-500">
                No hay órdenes
              </p>
            </div>
          )}

          {filteredOrders.map((order: KitchenOrder) => (
            <div
              key={order.id}
              className="border border-zinc-200 rounded-2xl p-4 shadow-sm bg-white"
            >
              {/* HEADER ORDEN */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">
                    #{order.id} — {order.table.name}
                  </span>

                  <span className="text-xs text-zinc-400">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              <div className="flex flex-col gap-2">
                {(order.items ?? []).map((i: KitchenItem) => (
                  <div
                    key={i.id}
                    className="flex justify-between items-center gap-4 text-sm border-b border-zinc-100 pb-2"
                  >
                    {/* 🔥 ITEM */}
                    <div className="flex flex-col flex-1 min-w-0">

                      {/* 🔥 NOMBRE + CANTIDAD + NOTA */}
                      <span className="font-medium text-zinc-800 break-words">
                        <span className="font-bold mr-2">
                          {i.quantity}
                        </span>

                        <span>
                          {i.displayName}
                        </span>

                        {i.notes?.trim() ? (
                          <span className="text-zinc-500 font-normal">
                            {" "}— {i.notes}
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${
                        i.status === "DONE"
                          ? "bg-green-100 text-green-700"
                          : i.status === "SENT"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}