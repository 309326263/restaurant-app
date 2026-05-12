"use client";

import { useEffect, useRef, useState } from "react";

const kitchenCategories = [
  "Postres",
  "Entradas",
  "Especialidades y Paquetes",
  "Sopas y Ramen",
  "Udon y Tallarines",
  "Arroz",
  "Sushi",
  "Bebidas",
];

export function CartPanel({
  activeOrder,
  categories,
  pendingCart,
  total,
  recentItems,
  onDecreasePending,
  onIncreasePending,
  onRemovePending,
  onPendingNoteChange,
  onConfirmAddToOrder,
  onOpenSendModal,
  onOpenCheckoutModal,
}: {
  activeOrder: any;
  categories: any[];
  pendingCart: any[];
  total: number;
  recentItems: number[];
  onDecreasePending: (id: string | number, variant?: string) => void;
  onIncreasePending: (id: string | number, variant?: string) => void;
  onRemovePending: (id: string | number, variant?: string) => void;
  onPendingNoteChange: (id: string | number, variant: string | undefined, note: string) => void;
  onConfirmAddToOrder: () => Promise<void>;
  onOpenSendModal: () => void;
  onOpenCheckoutModal: () => void;
}) {
  const cartScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    const el = cartScrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollBottom(!isNearBottom);
    };
    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [activeOrder]);

  const patchItemQty = async (id: number, quantity: number) => {
    await fetch(`/api/orders/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  };

  return (
    <div className="home-cart">
      <div className="order-title">
        <h3 className="order-subtitle">Orden Actual</h3>
        {activeOrder?.items?.some((i: any) => i.status === "SENT" || i.status === "DONE") && (
          <button onClick={onOpenCheckoutModal} className="sent-checkout-button">
            Cobrar
          </button>
        )}
      </div>

      <div ref={cartScrollRef} className="panel-scroll">
        {pendingCart.map((p: any) => (
          <div key={`${p.id}-${p.variant}`} className="pending-item">
            <span className="flex-1">
              {p.customName || p.displayName || p.name}
              <input
                type="text"
                placeholder="Nota (sin sal, etc)"
                value={p.note || ""}
                onChange={(e) => onPendingNoteChange(p.id, p.variant, e.target.value)}
                className="note-input"
              />
            </span>
            <div className="pending-controls">
              <button onClick={() => onDecreasePending(p.id, p.variant)} className="qty-button">
                -
              </button>
              <span>{p.qty}</span>
              <button onClick={() => onIncreasePending(p.id, p.variant)} className="qty-button">
                +
              </button>
              <button onClick={() => onRemovePending(p.id, p.variant)} className="delete-button">
                x
              </button>
            </div>
          </div>
        ))}

        {pendingCart.length > 0 && (
          <button
            onClick={async () => {
              await onConfirmAddToOrder();
              onOpenSendModal();
            }}
            className="big-button button-blue"
          >
            Agregar a orden
          </button>
        )}

        <div className="order-section">
          {activeOrder?.items?.some((i: any) => i.status === "PENDING") && (
            <div className="status-block pending-block">
              <div className="pending-header">
                <div>
                  <h3 className="status-title">Pendientes</h3>
                  <p className="status-subtitle">Aún no enviados</p>
                </div>
                <button onClick={onOpenSendModal} className="confirm-pending-button">
                  Confirmar
                </button>
              </div>

              {kitchenCategories.map((categoryName) => {
                const category = categories.find((c: any) => c.name === categoryName);
                if (!category) return null;
                const items = (activeOrder?.items || []).filter(
                  (i: any) =>
                    i.status === "PENDING" &&
                    i.station === "KITCHEN" &&
                    (i.isCustom || category.products.some((p: any) => String(p.id) === String(i.product?.id)))
                );
                if (items.length === 0) return null;
                return (
                  <div key={categoryName} className="compact-category-block">
                    <div className="compact-category-header">{categoryName}</div>
                    <div className="compact-category-items">
                      {items.map((i: any) => (
                        <div key={i.id} className="compact-product-row">
                          <span className="compact-product-name">
                            {i.product?.name || i.customName}
                            {i.variantName ? ` - ${i.variantName}` : ""}
                          </span>
                          <div className="order-controls">
                            <button
                              onClick={async () => patchItemQty(i.id, Number(i.quantity) - 1)}
                              className="qty-button"
                            >
                              -
                            </button>
                            <span>{i.quantity}</span>
                            <button
                              onClick={async () => patchItemQty(i.id, Number(i.quantity) + 1)}
                              className="qty-button"
                            >
                              +
                            </button>
                            <button onClick={async () => patchItemQty(i.id, 0)} className="delete-button">
                              x
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(activeOrder?.items || []).some((i: any) => i.status === "PENDING" && i.station === "BAR") && (
                <div className="compact-category-block">
                  <div className="compact-category-header">Bebidas</div>
                  <div className="compact-category-items">
                    {(activeOrder?.items || [])
                      .filter((i: any) => i.status === "PENDING" && i.station === "BAR")
                      .map((i: any) => (
                        <div
                          key={i.id}
                          className={`compact-product-row ${recentItems.includes(Number(i.id)) ? "recent-item" : ""}`}
                        >
                          <span className="compact-product-name">
                            {i.product?.name || i.customName}
                            {i.variantName ? ` - ${i.variantName}` : ""}
                          </span>
                          <span className="status-qty">x{i.quantity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeOrder?.items?.some((i: any) => i.status === "SENT" && i.station === "KITCHEN") && (
            <div className="status-block kitchen-block">
              <div className="status-block-header">
                <div>
                  <h3 className="status-title">En cocina</h3>
                  <p className="status-subtitle">Enviado a cocina</p>
                </div>
                <span className="kitchen-badge">🍳</span>
              </div>
              {kitchenCategories.map((categoryName) => {
                const category = categories.find((c: any) => c.name === categoryName);
                if (!category) return null;
                const items = (activeOrder?.items || []).filter(
                  (i: any) =>
                    i.status === "SENT" &&
                    i.station === "KITCHEN" &&
                    (i.isCustom || category.products.some((p: any) => String(p.id) === String(i.product?.id)))
                );
                if (items.length === 0) return null;
                return (
                  <div key={categoryName} className="compact-category-block">
                    <div className="compact-category-items">
                      {items.map((i: any) => (
                        <div key={i.id} className="compact-product-row">
                          <span className="compact-product-name">
                            {i.product?.name || i.customName}
                            {i.variantName ? ` - ${i.variantName}` : ""}
                          </span>
                          <span className="status-qty">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeOrder?.items?.some((i: any) => i.status === "SENT" && i.station === "BAR") && (
            <div className="status-block bar-block">
              <div className="status-block-header">
                <div>
                  <h3 className="status-title">En bar</h3>
                  <p className="status-subtitle">Preparando bebidas</p>
                </div>
                <span className="kitchen-badge">🍹</span>
              </div>
              <div className="compact-category-block">
                <div className="compact-category-header">Bebidas</div>
                <div className="compact-category-items">
                  {(activeOrder?.items || [])
                    .filter((i: any) => i.status === "SENT" && i.station === "BAR")
                    .slice()
                    .reverse()
                    .map((i: any) => (
                      <div key={i.id} className="compact-product-row">
                        <span className="compact-product-name">
                          {i.product?.name || i.customName}
                          {i.variantName ? ` - ${i.variantName}` : ""}
                        </span>
                        <span className="status-qty">x{i.quantity}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeOrder?.items?.some((i: any) => i.status === "DONE") && (
            <div className="status-block done-block">
              <div className="status-block-header">
                <div>
                  <h3 className="status-title">Listos</h3>
                  <p className="status-subtitle">Productos terminados</p>
                </div>
                <span className="done-badge">✓</span>
              </div>
              <div className="status-items">
                {(activeOrder?.items || [])
                  .filter((i: any) => i.status === "DONE")
                  .map((i: any) => (
                    <div key={i.id} className="status-ite">
                      <span>
                        {i.product?.name || i.customName}
                        {i.variantName ? ` - ${i.variantName}` : ""}
                      </span>
                      <span className="status-qty">x{i.quantity}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="total-box">
            <p className="total-text">Total: ${total}</p>
            <button onClick={onOpenCheckoutModal} className="big-button button-black">
              Cobrar
            </button>
          </div>
        </div>

        {showScrollBottom && (
          <button
            onClick={() => {
              cartScrollRef.current?.scrollTo({
                top: cartScrollRef.current.scrollHeight,
                behavior: "smooth",
              });
            }}
            className="scroll-bottom-button"
          >
            ↓
          </button>
        )}
      </div>
    </div>
  );
}
