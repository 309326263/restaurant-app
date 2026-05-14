"use client";

import { TableButton } from "@/app/components/pos-ui/TableButton";
import { TableSidebar } from "@/app/components/pos-ui/TableSidebar";
import { useUiStore } from "@/app/stores/uiStore";
import { cn } from "@/lib/utils";

export function TablesPanel({
  tables,
  selectedTable,
  onSelectTable,
}: {
  tables: any[];
  selectedTable: any | null;
  onSelectTable: (table: any) => void;
}) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <TableSidebar>
      
      {tables.map((t: any) => (
        <TableButton
          key={t.id}
          status={t.status}
          active={selectedTable?.id === t.id}
          collapsed={sidebarCollapsed}
          onClick={() => onSelectTable(t)}
        >
          <span
            className={cn(
              "transition-opacity duration-150 whitespace-nowrap",
              sidebarCollapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100"
            )}
          >
            {t.name}
          </span>

          {sidebarCollapsed && (
            <span>
              {`M${String(t.name).replace(/\D/g, "")}`}
            </span>
          )}

          {!sidebarCollapsed && (
            <span className="text-xs opacity-70">{t.status}</span>
          )}
        </TableButton>
      ))}
      
    </TableSidebar>
  );
}