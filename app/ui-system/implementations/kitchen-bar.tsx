"use client";

import { useState } from "react";
import { OrderLayout } from "../patterns/order-layout";
import { Surface } from "../primitives/Surface";
import { useTheme } from "../theme/theme";
import { Button } from "../components/button";

type KitchenBarProps = {
  header?: React.ReactNode;
  tables: any[];
  orders: any[];
  onSelectTable: (id: number) => void;
  onReleaseTable: (id: number) => void;
  onToggleItem: (itemId: number) => void;
};

export function KitchenBar({
  header,
  tables,
  orders,
  onSelectTable,
  onReleaseTable,
  onToggleItem,
}: KitchenBarProps) {
  const { theme } = useTheme();

  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  return (
    <OrderLayout
      header={header}
      primary={
        <div className="flex flex-col gap-2 p-2">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => {
                setSelectedTable(table.id);
                onSelectTable(table.id);
              }}
              className="cursor-pointer"
            >
              <Surface
                padding="sm"
                variant="base"
                className="
                  flex
                  items-center
                  justify-between
                  transition-all
                "
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {table.name}
                  </span>

                  <span
                    style={{
                      color: theme.muted,
                    }}
                    className="text-xs"
                  >
                    {table.itemsCount ?? 0} items
                  </span>
                </div>
              </Surface>
            </div>
          ))}
        </div>
      }
      secondary={
        <div className="flex flex-col gap-3 p-3">
          {orders
            .filter((o) =>
              selectedTable
                ? o.tableId ===
                  selectedTable
                : true
            )
            .map((order) => (
              <Surface
                key={order.id}
                variant="base"
                padding="md"
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    Mesa{" "}
                    {order.table?.name}
                  </div>

                  <div className="text-xs opacity-60">
                    #{order.id}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {order.items?.map(
                    (item: any) => (
                      <div
                        key={item.id}
                        className="
                          flex
                          items-center
                          justify-between
                          text-sm
                        "
                      >
                        <div className="flex gap-2">
                          <span className="font-semibold">
                            {item.quantity}
                          </span>

                          <span>
                            {
                              item.displayName
                            }
                          </span>

                          {item.variant && (
                            <span
                              style={{
                                color:
                                  theme.muted,
                              }}
                            >
                              {
                                item.variant
                              }
                            </span>
                          )}

                          {item.note && (
                            <span
                              style={{
                                color:
                                  theme.muted,
                              }}
                            >
                              - {item.note}
                            </span>
                          )}
                        </div>

                        <div
                          onClick={() =>
                            onToggleItem(
                              item.id
                            )
                          }
                          className="
                            w-5
                            h-5
                            border
                            rounded-sm
                            flex
                            items-center
                            justify-center
                            cursor-pointer
                          "
                          style={{
                            borderColor:
                              theme.border,
                          }}
                        >
                          {item.done
                            ? "✓"
                            : ""}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <div
                    onClick={() =>
                      onReleaseTable(
                        order.tableId
                      )
                    }
                  >
                    <Button
                      variant="danger"
                      size="sm"
                    >
                      Liberar mesa
                    </Button>
                  </div>
                </div>
              </Surface>
            ))}
        </div>
      }
    />
  );
}