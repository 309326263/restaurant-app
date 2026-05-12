"use client";

export function TablesPanel({
  tables,
  selectedTable,
  onSelectTable,
}: {
  tables: any[];
  selectedTable: any | null;
  onSelectTable: (table: any) => void;
}) {
  return (
    <div className="home-sidebar">
      <div className="panel-scroll">
        {tables.map((t: any) => (
          <button
            key={t.id}
            onClick={() => onSelectTable(t)}
            className={`table-button ${
              selectedTable?.id === t.id
                ? "table-active"
                : t.status === "OCCUPIED"
                  ? "table-occupied"
                  : "table-free"
            }`}
          >
            <div className="flex justify-between">
              <span>{t.name}</span>
              <span className="text-xs">{t.status}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
