"use client";

export function SendModal({
  open,
  activeOrder,
  total,
  printKitchen,
  printBar,
  setPrintKitchen,
  setPrintBar,
  editingNotes,
  setEditingNote,
  flashItemId,
  setFlashItemId,
  mutateOrder,
  onClose,
  onSend,
}: {
  open: boolean;
  activeOrder: any;
  total: number;
  printKitchen: boolean;
  printBar: boolean;
  setPrintKitchen: (v: boolean) => void;
  setPrintBar: (v: boolean) => void;
  editingNotes: Record<number, string>;
  setEditingNote: (id: number, note: string) => void;
  flashItemId: number | null;
  setFlashItemId: (id: number | null) => void;
  mutateOrder: () => Promise<any> | any;
  onClose: () => void;
  onSend: () => Promise<void>;
}) {
  if (!open) return null;

  const pendingKitchen = (activeOrder?.items || []).filter(
    (i: any) => i.status === "PENDING" && i.station === "KITCHEN"
  );
  const pendingBar = (activeOrder?.items || []).filter(
    (i: any) => i.status === "PENDING" && i.station === "BAR"
  );

  return (
    <div className="send-modal-overlay">
      <div className="send-modal">
        <div className="send-modal-header">
          <div>
            <h2 className="send-modal-title">Confirmar orden</h2>
            <p className="send-modal-subtitle">Revisa los productos antes de enviar</p>
          </div>
          <button onClick={onClose} className="send-close-button">
            ✕
          </button>
        </div>

        <div className="send-products compact-products">
          {pendingKitchen.length > 0 && (
            <div className="station-block">
              <div className="station-header kitchen-station">
                Cocina (<span className="station-count">{pendingKitchen.reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0)}</span>)
              </div>
              <div className="compact-category-items">
                {pendingKitchen.map((i: any) => (
                  <div key={i.id} className={`compact-product-row ${flashItemId === i.id ? "flash-note-item" : ""}`}>
                    <div className="compact-product-info">
                      <span className={`compact-product-name ${flashItemId === i.id ? "flash-note-item" : ""}`}>
                        {i.product?.name || i.customName}
                        {i.variantName ? ` - ${i.variantName}` : ""}
                      </span>
                      <div className="inline-note-wrapper">
                        <input
                          type="text"
                          placeholder="nota..."
                          value={editingNotes[i.id] ?? i.notes ?? ""}
                          onChange={(e) => setEditingNote(i.id, e.target.value)}
                          className="inline-note-input"
                        />
                        {(editingNotes[i.id] ?? i.notes ?? "").trim() !== (i.notes ?? "").trim() && (
                          <button
                            className="confirm-note-button"
                            onClick={async () => {
                              const notes = editingNotes[i.id] ?? "";
                              const res = await fetch(`/api/orders/items/${i.id}/notes`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ notes }),
                              });
                              const data = await res.json();
                              setEditingNote(i.id, data.newItemId ? "" : notes);
                              await Promise.resolve(mutateOrder());
                              if (data.newItemId) {
                                setFlashItemId(Number(data.newItemId));
                                setTimeout(() => setFlashItemId(null), 2200);
                              }
                            }}
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="compact-product-qty">x{i.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pendingBar.length > 0 && (
            <div className="station-block">
              <div className="station-header bar-station">
                Bebidas (<span className="station-count">{pendingBar.reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0)}</span>)
              </div>
              <div className="compact-category-items">
                {pendingBar.map((i: any) => (
                  <div key={i.id} className="compact-product-row">
                    <span className="compact-product-name">
                      {i.product?.name || i.customName}
                      {i.variantName ? ` - ${i.variantName}` : ""}
                    </span>
                    <span className="compact-product-qty">x{i.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="send-options">
          <button
            onClick={() => setPrintKitchen(!printKitchen)}
            className={`print-toggle large-toggle ${printKitchen ? "print-on-kitchen" : "print-off"}`}
          >
            Cocina
          </button>
          <button
            onClick={() => setPrintBar(!printBar)}
            className={`print-toggle large-toggle ${printBar ? "print-on-bar" : "print-off"}`}
          >
            Bebidas
          </button>
        </div>

        <div className="send-total">Total: ${total}</div>

        <div className="send-actions">
          <button onClick={onClose} className="send-cancel">
            Cancelar
          </button>
          <button onClick={onSend} className="send-confirm">
            Enviar a cocina
          </button>
        </div>
      </div>
    </div>
  );
}
