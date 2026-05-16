"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useOpsState(selectedTable: number | null) {
  const { data: tables = [] } = useSWR(
    "/api/tables",
    fetcher
  );

  const { data: orders = [] } = useSWR(
    "/api/orders",
    fetcher
  );

  const filteredOrders = selectedTable
    ? orders.filter((o: any) => o.tableId === selectedTable)
    : orders;

  return {
    tables,
    orders,
    filteredOrders,
  };
}