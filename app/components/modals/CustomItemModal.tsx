"use client";

export function CustomItemModal({
  open,
  customItem,
  onClose,
  onChange,
  onAdd,
}: {
  open: boolean;
  customItem: { name: string; price: string; station: "KITCHEN" | "BAR" };
  onClose: () => void;
  onChange: (patch: Partial<{ name: string; price: string; station: "KITCHEN" | "BAR" }>) => void;
  onAdd: () => void;
}) {
  if (!open) return null;
  return (
    <div className="send-modal-overlay2">
      <div className="send-modal2">
        <h2 className="send-modal-title2">Producto manual</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={customItem.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="manual-input"
        />
        <input
          type="number"
          placeholder="Precio"
          value={customItem.price}
          onChange={(e) => onChange({ price: e.target.value })}
          className="manual-input"
        />
        <div className="manual-stations">
          <button
            onClick={() => onChange({ station: "KITCHEN" })}
            className={customItem.station === "KITCHEN" ? "station-active" : ""}
          >
            Cocina
          </button>
          <button onClick={() => onChange({ station: "BAR" })} className={customItem.station === "BAR" ? "station-active" : ""}>
            Bebidas
          </button>
        </div>
        <div className="send-actions2">
          <button onClick={onClose} className="send-cancel2">
            Cancelar
          </button>
          <button onClick={onAdd} className="send-confirm2">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
