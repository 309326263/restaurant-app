"use client";

import { useEffect, useRef } from "react";
import { Surface } from "@/app/ui-system";

type Props = {
  tables: any[];
  selectedTable: number | null;
  onSelectTable: (id: number | null) => void;
  layout: "rail" | "flow";
};

export function TablesRail({
  tables,
  selectedTable,
  onSelectTable,
  layout,
}: Props) {
  const refs = useRef<
    Record<number, HTMLDivElement | null>
  >({});

  useEffect(() => {
    if (
      selectedTable &&
      refs.current[selectedTable]
    ) {
      refs.current[selectedTable]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTable]);

  return (
    <div
      className={
        layout === "rail"
          ? "w-[220px] h-full overflow-y-auto border-r flex flex-col"
          : "w-full flex flex-wrap gap-2 p-2"
      }
    >
      {tables.map((table) => {
        const active =
          selectedTable === table.id;

        return (
          <div
            key={table.id}
            ref={(el) => {
              refs.current[table.id] = el;
            }}
            onClick={() =>
              onSelectTable(
                active ? null : table.id
              )
            }
            className="cursor-pointer"
          >
            <Surface
              className={
                layout === "rail"
                  ? `
                    m-2
                    flex
                    items-center
                    justify-between
                    transition-all
                    ${
                      active
                        ? "ring-2 ring-primary"
                        : ""
                    }
                  `
                  : "w-[200px]"
              }
              padding="sm"
            >
              <span>{table.name}</span>

              <span className="text-xs opacity-60">
                {table.itemsCount ?? 0}
              </span>
            </Surface>
          </div>
        );
      })}
    </div>
  );
}