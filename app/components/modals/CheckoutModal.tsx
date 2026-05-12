"use client";

export function CheckoutModal({
  open,
  selectedTable,
  activeOrder,
  groupedItems,
  total,
  checkoutView,
  setCheckoutView,
  onClose,
  onCheckout,
}: {
  open: boolean;
  selectedTable: any;
  activeOrder: any;
  groupedItems: Record<string, any>;
  total: number;
  checkoutView: "grouped" | "tickets";
  setCheckoutView: (view: "grouped" | "tickets") => void;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="pos-overlay">
      <div className="pos-modal">
        <div className="pos-header">
          <div className="pos-title-block">
            <h2 className="pos-title">{selectedTable?.name}</h2>
            <p className="pos-subtitle">Cobro / Checkout</p>
          </div>
          <button onClick={onClose} className="pos-close">
            ✕
          </button>
        </div>

        <div className="pos-summary">
          <div className="pos-summary-box">
            <span>Items</span>
            <strong>{activeOrder?.items?.length || 0}</strong>
          </div>
          <div className="pos-summary-box">
            <span>Ticket</span>
            <strong>{activeOrder?.tickets?.length || 1}</strong>
          </div>
          <div className="pos-summary-box pos-total">
            <span>Total</span>
            <strong>${total}</strong>
          </div>
        </div>

        <div className="pos-tabs">
          <button onClick={() => setCheckoutView("grouped")} className={`pos-tab ${checkoutView === "grouped" ? "active" : ""}`}>
            Resumen
          </button>
          <button onClick={() => setCheckoutView("tickets")} className={`pos-tab ${checkoutView === "tickets" ? "active" : ""}`}>
            Tickets
          </button>
        </div>

        <div className="pos-content">
          {checkoutView === "grouped" && (
            <div className="pos-list">
              {Object.values(groupedItems || {}).map((i: any) => (
                <div key={i.id} className={`pos-item ${i.station === "BAR" ? "bar" : "kitchen"}`}>
                  <div className="pos-item-right">
                    <span className="pos-qty">x{i.totalQty}</span>
                  </div>
                  <div className="pos-item-name">
                    {i.product?.name || i.customName}
                    {i.variantName ? ` - ${i.variantName}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          {checkoutView === "tickets" && (
            <div className="pos-tickets">
              {activeOrder?.tickets?.slice().reverse().map((ticket: any) => (
                <div key={ticket.id} className="pos-ticket">
                  <div className="pos-ticket-header">
                    Pedido #{ticket.id}
                    <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  {ticket.items.map((i: any) => (
                    <div key={i.id} className={`pos-ticket-item ${i.station === "BAR" ? "bar" : "kitchen"}`}>
                      <span className="pos-qty" style={{ paddingRight: "10px" }}>
                        x{i.quantity}
                      </span>
                      <span className="pos-name">
                        {i.product?.name || i.customName}
                        {i.variantName ? ` - ${i.variantName}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pos-footer">
          <button onClick={onClose} className="pos-btn cancel">
            Volver
          </button>
          <button onClick={onCheckout} className="pos-btn pay">
            Cobrar ¥ {total}
          </button>
        </div>
      </div>
    </div>
  );
}
