"use client";

import { useState } from "react";
import { TablesRail } from "./TablesRail";
import { OrdersPanel } from "./OrdersPanel";
import { OpsNavbar } from "./OpsNavbar";
import { useOpsState } from "../hooks/useOpsState";
import { useOpsEvents } from "../hooks/useOpsEvents";
import { useUiLayout } from "../state/ui-layout.store";
import { useUiControl } from "../state/ui-control.store";

export function OpsLayout() {
  const { fontScale, sound } = useUiControl();

  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  const { layout } = useUiLayout();

  const {
    tables,
    filteredOrders,
  } = useOpsState(selectedTable);

  useOpsEvents({
    orders: filteredOrders,
    sound,
  });

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        fontSize: `${fontScale}rem`,
      }}
    >
      <OpsNavbar />

      <div className="flex flex-1 overflow-hidden">
        <TablesRail
          tables={tables}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          layout={layout}
        />

        <OrdersPanel
          orders={filteredOrders}
          layout={layout}
        />
      </div>
    </div>
  );
}