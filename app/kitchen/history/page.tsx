"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function History() {
  const router = useRouter();

  // 🔥 estado filtro
  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  // 🔥 data
  const { data: orders = [] } = useSWR(
    "/api/kitchen/history",
    fetcher
  );

  const { data: tables = [] } = useSWR(
    "/api/tables",
    fetcher
  );

  // 🔥 filtro
  const filteredOrders = (
    selectedTable
      ? orders.filter(
          (o: any) => o.tableId === selectedTable
        )
      : orders
  ).sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
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
          {tables.map((t: any) => (
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

          {filteredOrders.map((order: any) => (
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
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* ITEMS */}
              <div className="flex flex-col gap-2">
                {order.items.map((i: any) => (
                  <div
                    key={i.id}
                    className="flex justify-between items-center gap-4 text-sm border-b border-zinc-100 pb-2"
                  >
                    {/* 🔥 NOMBRE COMPLETO */}
                    <span className="font-medium text-zinc-800">
                      {i.variantName
                        ? `${i.product?.name || i.customName} - ${i.variantName}`
                        : i.product?.name || i.customName}{" "}
                      x {i.quantity}
                    </span>

                    {/* STATUS */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
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