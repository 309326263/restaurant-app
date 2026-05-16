"use client";

import { Surface, Button } from "@/app/ui-system";
import { getOrderColor } from "../lib/order-ui-state";
import { useEffect, useState } from "react";
export function OrdersPanel({
  orders,
  layout,
}: {
  orders: any[];
  layout: "rail" | "flow";
}) {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  useEffect(() => {
    const handler = (e: any) => {
      const order = e.detail;

      setHighlighted(order.id);

      setTimeout(() => {
        setHighlighted(null);
      }, 4000);
    };

    window.addEventListener("kitchen:new-order", handler);

    return () =>
      window.removeEventListener("kitchen:new-order", handler);
  }, []);
  return (
   <div
      className={
        layout === "rail"
          ? "flex-1 overflow-y-auto p-3 transition-all duration-200"
          : "flex flex-wrap gap-3 p-3 transition-all duration-200"
      }
    >
      {orders.map((order) => (
        <Surface
          key={order.id}
          className={`mb-3 transition-all duration-200 ${
            highlighted === order.id
              ? "ring-2 ring-blue-400 shadow-lg"
              : ""
          }`}
        >

          <div className="flex justify-between text-sm font-semibold ring-2 ring-blue-400 animate-pulse">
            <span>Mesa {order.table?.name}</span>
            <span className="opacity-50">
              #{order.id}
            </span>
          </div>

          <div className="flex gap-2 items-center">
  
            <button
              className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
                order.done ? "bg-green-500 border-green-500" : ""
              }`}
            >
              {order.done ? "✓" : ""}
            </button>

            <span>
              {order.quantity} - {order.displayName}
              {order.variant && ` (${order.variant})`}
              {order.note && ` - ${order.note}`}
            </span>

          </div>

          <div className="flex justify-end mt-3">
            <Button size="sm" variant="danger">
              Liberar mesa
            </Button>
          </div>
        </Surface>
      ))}
    </div>
  );
}