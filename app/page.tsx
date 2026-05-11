"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import {
  getItemName,
  getItemStation,
  isCustomItem
} from "@/lib/orderItem";


import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useKitchenEvents } from "@/app/hooks/useKitchenEvents";

import "./home.css";

export default function Home() {

  const isManualItem = (item: any) => {
    return !item.productId && item.customName;
  };

  // Producto personalizado modal
  const [showCustomItemModal, setShowCustomItemModal] =
  useState(false);

const [customItem, setCustomItem] = useState({
  name: "",
  price: "",
  station: "KITCHEN",
});




// Notas ediciones

  const [editingNotes, setEditingNotes] = useState<any>({});
  const [flashItemId, setFlashItemId] = useState<number | null>(null);
 
// Efecto para marcar productos recientes (agregados o modificados en los últimos 10 segundos)
  const [recentItems, setRecentItems] = useState<number[]>([]);
  const previousIdsRef = useRef<number[]>([]);

  const markRecentItem = (id: number) => {

    setRecentItems((prev) => [
      ...prev,
      id,
    ]);

    setTimeout(() => {
      setRecentItems((prev) =>
        prev.filter((x) => x !== id)
      );
    }, 10000);
  };

const categoryConfig = [
  { id: "postres", name: "Postres", icon: "🍰" },
  { id: "entradas", name: "Entradas", icon: "🥗" },
  { id: "especialidades", name: "Especialidades", icon: "🍱" },
  { id: "sopas", name: "Sopas y Ramen", icon: "🍲" },
  { id: "udon", name: "Udon y Tallarines", icon: "🍝" },
  { id: "arroz", name: "Arroz", icon: "🍚" },
  { id: "sushi", name: "Sushi", icon: "🍣" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
];

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

const iconMap = Object.fromEntries(
  categoryConfig.map((c) => [c.name, c.icon])
);
  

// 🔥 boton scroll 
  const [showScrollBottom, setShowScrollBottom] =
  useState(false);

  const cartScrollRef = useRef<HTMLDivElement>(null);

  
    

  const [printKitchen, setPrintKitchen] = useState(true);
  const [printBar, setPrintBar] = useState(false);

  // 🔥 categoría abierta
  const [openedCategoryId, setOpenedCategoryId] =
    useState<number | null>(null);

  // 🔥 variantes abiertas
  const [selectedVariant, setSelectedVariant] =
    useState<any>(null);

  const [showSendModal, setShowSendModal] =
  useState(false);

  const [showCheckoutModal, setShowCheckoutModal] =
  useState(false);

  const [checkoutView, setCheckoutView] =
    useState<"grouped" | "tickets">(
      "grouped"
    );

  const sendToKitchen = async () => {
    if (!activeOrder?.id) return;

    const payload = {
      orderId: activeOrder.id,
      printKitchen,
      printBar,
    };

    const res = await fetch(
      `/api/orders/${activeOrder.id}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) return;
  };

  const [selectedTable, setSelectedTable] =
    useState<any | null>(null);

  const [pendingCart, setPendingCart] =
    useState<any[]>([]);

  // 🔥 TABLES
  const {
    data: tables = [],
    mutate: mutateTables,
  } = useSWR("/api/tables", fetcher);

  // 🔥 ORDER
  const {
    data: activeOrder,
    mutate: mutateOrder,
  } = useSWR(
    selectedTable
      ? `/api/tables/${selectedTable.id}/order`
      : null,
    fetcher
  );

  useKitchenEvents({
    onItemUpdated: ({ orderId }) => {
      if (activeOrder?.id === orderId) {
        mutateOrder();
      }
    },
    onOrderUpdated: ({ orderId }) => {
      if (activeOrder?.id === orderId) {
        mutateOrder();
      }
    },
  });

  // 🔥 CATEGORIES
  const { data: categories = [] } = useSWR(
    "/api/categories",
    fetcher
  );

  // =========================
  // PENDING CART
  // =========================

  const increasePending = (
    id: number,
    variant?: string
  ) => {
    setPendingCart((prev) =>
      prev.map((p) =>
        p.id === id &&
        p.variant === variant
          ? {
              ...p,
              qty: p.qty + 1,
            }
          : p
      )
    );
  };

  const decreasePending = (
    id: number,
    variant?: string
  ) => {
    setPendingCart((prev) =>
      prev
        .map((p) =>
          p.id === id &&
          p.variant === variant
            ? {
                ...p,
                qty: p.qty - 1,
              }
            : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  const removePending = (
    id: number,
    variant?: string
  ) => {
    setPendingCart((prev) =>
      prev.filter(
        (p) =>
          !(
            p.id === id &&
            p.variant === variant
          )
      )
    );
  };

  const addToPending = (product: any) => {
    if (!selectedTable) return;

    setPendingCart((prev) => {
      const exists = prev.find(
        (p) =>
          p.id === product.id &&
          p.variant === product.variant
      );

      if (exists) {
        return prev.map((p) =>
          p.id === product.id &&
          p.variant === product.variant
            ? {
                ...p,
                qty: p.qty + 1,
              }
            : p
        );
      }

      return [
        ...prev,
        {
          ...product,
          station: product.station,
          displayName: product.variant
            ? `${product.name} - ${product.variant}`
            : product.name,
          qty: 1,
          note: "", // 👈 NUEVO
        },
      ];
    });
  };


  function addCustomItem() {

    if (!customItem.name || !customItem.price)
      return;

    setPendingCart((prev: any) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,

        customName: customItem.name,

        customPrice: Number(customItem.price),

        qty: 1,

        station: customItem.station,

        isCustom: true,
      },
    ]);

    setShowCustomItemModal(false);

    setCustomItem({
      name: "",
      price: "",
      station: "KITCHEN",
    });
  }

  // =========================
  // SELECT TABLE
  // =========================

  const selectTable = (table: any) => {
    setSelectedTable(table);
    setPendingCart([]);
  };

  // =========================
  // CONFIRM ORDER
  // =========================

  const confirmAddToOrder = async () => {
    if (!selectedTable) return;

    if (pendingCart.length === 0)
      return;

    if (!activeOrder?.id) {
      const res = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tableId: selectedTable.id,
            items: pendingCart.map(
              (p) => ({

                productId:
                  p.isCustom
                    ? null
                    : p.id,

                customName:
                  p.customName ?? null,

                customPrice:
                  p.customPrice ?? null,

                quantity: p.qty ?? p.quantity ?? 1,

                variantName:
                  p.variant || null,

                variantPrice:
                  p.variantPrice || 0,

                station: p.station,
              })
            ),
          }),
        }
      );

      const data = await res.json();

      if (!data.ok) {
        alert("Error creando orden");
        return;
      }
    } else {
      await fetch(
        `/api/orders/${activeOrder.id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items: pendingCart.map(
              (p) => ({
                productId:
                  p.isCustom
                    ? null
                    : p.id,
                customName:
                  p.customName ?? null,
                customPrice:
                  p.customPrice ?? null,
                quantity: p.qty ?? p.quantity ?? 1,
                variantName:
                  p.variant || null,
                variantPrice:
                  p.variantPrice || 0,
                station: p.station,
              })
            ),
          }),
        }
      );
    }

    setPendingCart([]);

    mutateOrder();
    mutateTables();
  };

  // =========================
  // CHECKOUT
  // =========================

  const checkout = async () => {
    if (!activeOrder?.id) return;

    const res = await fetch(
      `/api/orders/${activeOrder.id}/checkout`,
      {
        method: "POST",
      }
    );

    if (res.ok) {
      alert("Cobrado");

      setSelectedTable(null);
      setPendingCart([]);

      mutateOrder();
      mutateTables();
    }
  };

  // =========================
  // TOTAL
  // =========================

    const total =
    (activeOrder?.items?.reduce(
      (sum: number, i: any) =>
        sum +
        (
          (i.customPrice ?? i.product?.price ?? 0) +
          (i.variantPrice || 0)
        ) *
          i.quantity,
      0
    ) || 0) +
    pendingCart.reduce(
      (sum, p) =>
        sum +
        (
          (p.customPrice ?? p.price ?? 0) +
          (p.variantPrice || 0)
        ) *
          p.qty,
      0
    );

    const groupedItems = useMemo(() => {

      return activeOrder?.items?.reduce(
        (acc: any, item: any) => {

          const key =
            `${item.product?.name || item.customName}-${
              item.variantName || ""
            }`;

          if (!acc[key]) {

            acc[key] = {
              ...item,
              totalQty: 0,
            };

          }

          acc[key].totalQty +=
            item.quantity;

          return acc;

        },
        {}
      );

    }, [activeOrder]);

  // =========================
  // UI
  // =========================

  // Scroll bottom button

  useEffect(() => {

    const el = cartScrollRef.current;

    if (!el) return;

    const handleScroll = () => {

      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;

      setShowScrollBottom(!isNearBottom);
    };

    handleScroll();

    el.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      el.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [activeOrder]);

// Marcar productos recientes (agregados o modificados en los últimos 10 segundos)

  useEffect(() => {

      if (!activeOrder?.items) return;

      const previousIds =
        previousIdsRef.current;

      activeOrder.items.forEach((item: any) => {

        const alreadyExists =
          previousIds.includes(item.id);

        if (
          !alreadyExists &&
          (
            item.status === "SENT" ||
            item.status === "DONE"
          )
        ) {
          markRecentItem(item.id);
        }

      });

      previousIdsRef.current =
        activeOrder.items.map(
          (i: any) => i.id
        );

    }, [activeOrder]);



    

  return (
  <main className="home-layout">

    {/* ================================= */}
    {/* TOP NAVBAR */}
    {/* ================================= */}

    <div className="top-navbar">

      <div className="top-left">
        <h1 className="top-logo">
          SatoSan
        </h1>

        <span className="top-subtitle">
          Restaurant Dashboard
        </span>
      </div>

      <div className="top-nav-links">

        <button className="top-nav-button top-nav-active">
          Dashboard
        </button>

        <button className="top-nav-button">
          Cocina
        </button>

        <button className="top-nav-button">
          Historial
        </button>

        <button className="top-nav-button">
          Productos
        </button>

      </div>

    </div>

    {/* ================================= */}
    {/* CONTENIDO */}
    {/* ================================= */}

    <div className="home-content">

      {/* ================================= */}
      {/* MESAS */}
      {/* ================================= */}

      <div className="home-sidebar">

        <div className="panel-scroll">

          {tables.map((t: any) => (
            <button
              key={t.id}
              onClick={() =>
                selectTable(t)
              }
              className={`table-button ${
                selectedTable?.id === t.id
                  ? "table-active"
                  : t.status ===
                    "OCCUPIED"
                  ? "table-occupied"
                  : "table-free"
              }`}
            >
              <div className="flex justify-between">
                <span>{t.name}</span>

                <span className="text-xs">
                  {t.status}
                </span>
              </div>
            </button>
          ))}

        </div>
      </div>

      {/* ================================= */}
      {/* MENU */}
      {/* ================================= */}

      <div className="home-menu">

        <div className="panel-scroll">

          {/* GRID CATEGORÍAS */}
          <div className="categories-grid">

              {kitchenCategories.map((catName) => {

                const cat = categories.find(
                  (c: any) => c.name === catName
                );

                if (!cat) return null;

                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setOpenedCategoryId(
                        openedCategoryId === cat.id ? null : cat.id
                      )
                    }
                    className={`category-button ${
                      openedCategoryId === cat.id ? "category-active" : ""
                    }`}
                  >

                    <span className="category-icon">
                      {iconMap[cat.name]}
                    </span>

                    <span className="category-text">
                      {cat.name}
                    </span>

                  </button>
                  
                );
              })}

              <button
                onClick={() =>
                  setShowCustomItemModal(true)
                }
                className="custom-item-button"
              >
                + Producto manual
              </button>

            </div>  

          {/* PANEL DESPLEGABLE */}
          {categories.map((cat: any) => {

            if (
              openedCategoryId !== cat.id
            )
              return null;

            return (
              <div
                key={cat.id}
                className="category-panel"
              >
                <h2 className="category-title">
                  {cat.name}
                </h2>

                <div className="product-list">

                  {cat.products.map(
                    (prod: any) => (
                      <div
                        key={prod.id}
                        className="product-card"
                      >

                        {/* PRODUCTO */}
                        <div
                          onClick={() => {
                            if (
                              prod
                                .variants
                                ?.length > 0
                            ) {
                              setSelectedVariant(
                                selectedVariant ===
                                  prod.id
                                  ? null
                                  : prod.id
                              );
                            } else {
                              addToPending({
                                ...prod,
                                displayName:
                                  prod.name,
                                variant:
                                  null,
                                variantPrice: 0,
                              });
                            }
                          }}
                          className="product-main"
                        >
                          <span className="product-name">
                            {prod.name}
                          </span>

                          <span className="product-price">
                            ${prod.price}
                          </span>
                        </div>

                        {/* VARIANTES */}
                        <div
                          className={`variant-panel ${
                            selectedVariant ===
                            prod.id
                              ? "variant-visible"
                              : "variant-hidden"
                          }`}
                        >
                          <div className="variant-content">

                            {prod.variants?.map(
                              (v: any) => (
                                <button
                                  key={v.id}
                                  onClick={() => {
                                    addToPending({
                                      ...prod,
                                      displayName: `${prod.name} - ${v.name}`,
                                      variant:
                                        v.name,
                                      variantPrice:
                                        v.price,
                                    });

                                    setSelectedVariant(
                                      null
                                    );
                                  }}
                                  className="variant-button"
                                >
                                  {v.name}

                                  {v.price > 0
                                    ? ` (+$${v.price})`
                                    : ""}
                                </button>
                              )
                            )}

                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ================================= */}
      {/* PANEL DERECHO */}
      {/* ================================= */}

      <div className="home-cart">
        <div className="order-title">

              <h3 className="order-subtitle">
                Orden Actual
              </h3>

              {activeOrder?.items?.some(
                (i: any) => i.status === "SENT" || i.status === "DONE"
              ) && (
                <button
                    onClick={() =>
                      setShowCheckoutModal(true)
                    }
                    className="sent-checkout-button"
                  >
                    Cobrar
                </button>
              )}

            </div>

        

        <div
            ref={cartScrollRef}
            className="panel-scroll"
          >

          {pendingCart.map((p) => (
            
            <div
              key={`${p.id}-${p.variant}`}
              className="pending-item"
            >

              <span className="flex-1">
                {p.customName ||
                  p.displayName ||
                  p.name}

                  <input
                    type="text"
                    placeholder="Nota (sin sal, etc)"
                    value={p.note || ""}
                    onChange={(e) => {
                      setPendingCart((prev) =>
                        prev.map((x) =>
                          x.id === p.id && x.variant === p.variant
                            ? { ...x, note: e.target.value }
                            : x
                        )
                      );
                    }}
                    className="note-input"
                  />
              </span>

              <div className="pending-controls">

                <button
                  onClick={() =>
                    decreasePending(
                      p.id,
                      p.variant
                    )
                  }
                  className="qty-button"
                >
                  -
                </button>

                <span>{p.qty}</span>

                <button
                  onClick={() =>
                    increasePending(
                      p.id,
                      p.variant
                    )
                  }
                  className="qty-button"
                >
                  +
                </button>

                <button
                  onClick={() =>
                    removePending(
                      p.id,
                      p.variant
                    )
                  }
                  className="delete-button"
                >
                  x
                </button>

              </div>
            </div>
          ))}

          {/* BOTONES */}


          {pendingCart.length > 0 && (
            <button
              onClick={async () => {

                // 🔥 primero agrega los productos a la orden
                await confirmAddToOrder();

                // 🔥 refresca la orden para que aparezcan como PENDING
                await mutateOrder();

                // 🔥 limpia carrito temporal
                //setPendingCart([]);

                // 🔥 abre modal con los PENDING reales
                setShowSendModal(true);
              }}
              className="big-button button-blue"
            >
              Agregar a orden
            </button>
          )}

          {/* ORDEN */}

<div 

className="order-section">

  {/* ============================== */}
  {/* PENDIENTES */}
  {/* ============================== */}

  {activeOrder?.items?.some(
    (i: any) => i.status === "PENDING"
  ) && (

    <div className="status-block pending-block">

      <div className="pending-header">

        <div>
          <h3 className="status-title">
            Pendientes
          </h3>

          <p className="status-subtitle">
            Aún no enviados
          </p>
        </div>

        <button
          onClick={() =>
            setShowSendModal(true)
          }
          className="confirm-pending-button"
        >
          Confirmar
        </button>

      </div>

      {/* COCINA */}

      {kitchenCategories.map((categoryName) => {

        const category = categories.find(
          (c: any) =>
            c.name === categoryName
        );

        if (!category) return null;

        const items =
          activeOrder.items.filter(
            (i: any) =>
              i.status === "PENDING" &&
              (i.station) === "KITCHEN" &&
              
              category.products.some(
                (p: any) =>
                  p.id === i.product?.id
              )
          );

        if (items.length === 0)
          return null;

        return (
          <div
            key={categoryName}
            className="compact-category-block"
          >

            <div className="compact-category-header">
              {categoryName}
            </div>

            <div className="compact-category-items">

              {items.map((i: any) => (

                <div
                  key={i.id}
                  className="compact-product-row"
                >

                  <span className="compact-product-name">

                    {i.product?.name || i.customName}

                    {i.variantName
                      ? ` - ${i.variantName}`
                      : ""}

                  </span>

                  <div className="order-controls">

                    <button
                      onClick={async () => {

                        await fetch(
                          `/api/orders/items/${i.id}`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type":
                                "application/json",
                            },
                            body: JSON.stringify({
                              quantity:
                                i.quantity - 1,
                            }),
                          }
                        );

                        mutateOrder();
                      }}
                      className="qty-button"
                    >
                      -
                    </button>

                    <span>
                      {i.quantity}
                    </span>

                    <button
                      onClick={async () => {

                        await fetch(
                          `/api/orders/items/${i.id}`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type":
                                "application/json",
                            },
                            body: JSON.stringify({
                              quantity:
                                i.quantity + 1,
                            }),
                          }
                        );

                        mutateOrder();
                      }}
                      className="qty-button"
                    >
                      +
                    </button>

                    <button
                      onClick={async () => {

                        await fetch(
                          `/api/orders/items/${i.id}`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type":
                                "application/json",
                            },
                            body: JSON.stringify({
                              quantity: 0,
                            }),
                          }
                        );

                        mutateOrder();
                      }}
                      className="delete-button"
                    >
                      x
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        );
      })}

      {/* BAR */}

      {activeOrder.items.some(
        (i: any) =>
          i.status === "PENDING" &&
          (i.station) === "BAR"
      ) && (

        <div className="compact-category-block">

          <div className="compact-category-header">
            Bebidas
          </div>

          <div className="compact-category-items">

            {activeOrder.items
              .filter(
                (i: any) =>
                  i.status === "PENDING" &&
                  (i.station) === "BAR"
              )
              .map((i: any) => (

                <div
                  key={i.id}
                  className={`compact-product-row ${
                    recentItems.includes(i.id)
                      ? "recent-item"
                      : ""
                  }`}
                >

                  <span className="compact-product-name">

                    {i.product?.name || i.customName}

                    {i.variantName
                      ? ` - ${i.variantName}`
                      : ""}

                  </span>

                  <span className="status-qty">
                    x{i.quantity}
                  </span>

                </div>

              ))}

          </div>

        </div>
      )}

    </div>
  )}

  {/* ============================== */}
  {/* EN COCINA */}
  {/* ============================== */}

  {activeOrder?.items?.some(
    (i: any) =>
      i.status === "SENT" &&
      (i.station) === "KITCHEN"
  ) && (

    <div className="status-block kitchen-block">

      <div className="status-block-header">

        <div>
          <h3 className="status-title">
            En cocina
          </h3>

          <p className="status-subtitle">
            Enviado a cocina
          </p>
        </div>

        <span className="kitchen-badge">
          🍳
        </span>

      </div>

      {kitchenCategories.map((categoryName) => {

        const category = categories.find(
          (c: any) =>
            c.name === categoryName
        );

        if (!category) return null;

        const items =
          activeOrder.items.filter(
            (i: any) =>
              i.status === "SENT" &&
              (i.station) === "KITCHEN" &&
              category.products.some(
                (p: any) =>
                  p.id === i.product?.id
              )
          );

        if (items.length === 0)
          return null;

        return (
          <div
            key={categoryName}
            className="compact-category-block"
          >

           

            <div className="compact-category-items">

              {items.map((i: any) => (

                <div
                  key={i.id}
                  className="compact-product-row"
                >

                    <span className="compact-product-name">
                      {i.product?.name || i.customName}

                      {i.variantName
                        ? ` - ${i.variantName}`
                        : ""}
                    </span>

                   

                  <span className="status-qty">
                    x{i.quantity}
                  </span>

                </div>

              ))}

            </div>

          </div>
        );
      })}

    </div>
  )}

  {/* ============================== */}
  {/* EN BAR */}
  {/* ============================== */}

  {activeOrder?.items?.some(
    (i: any) =>
      i.status === "SENT" &&
      (i.station) === "BAR"
  ) && (

    <div className="status-block bar-block">

      <div className="status-block-header">

        <div>
          <h3 className="status-title">
            En bar
          </h3>

          <p className="status-subtitle">
            Preparando bebidas
          </p>
        </div>

        <span className="kitchen-badge">
          🍹
        </span>

      </div>

      <div className="compact-category-block">

        <div className="compact-category-header">
          Bebidas
        </div>

        <div className="compact-category-items">

          {activeOrder.items
            .filter(
              (i: any) =>
                i.status === "SENT" &&
                (i.station) === "BAR"
            )
            .slice()
            .reverse()
            
            .map((i: any) => (

              <div
                key={i.id}
                className="compact-product-row"
              >

                <span className="compact-product-name">

                  {i.product?.name || i.customName}

                  {i.variantName
                    ? ` - ${i.variantName}`
                    : ""}

                </span>

                <span className="status-qty">
                  x{i.quantity}
                </span>

              </div>

            ))}

        </div>

      </div>

    </div>
  )}

  {/* ============================== */}
  {/* LISTOS */}
  {/* ============================== */}

  {activeOrder?.items?.some(
    (i: any) => i.status === "DONE"
  ) && (

    <div className="status-block done-block">

      <div className="status-block-header">

        <div>
          <h3 className="status-title">
            Listos
          </h3>

          <p className="status-subtitle">
            Productos terminados
          </p>
        </div>

        <span className="done-badge">
          ✓
        </span>

      </div>

      <div className="status-items">

        {activeOrder.items
          .filter(
            (i: any) =>
              i.status === "DONE"
          )
          .map((i: any) => (

            <div
              key={i.id}
              className={"status-ite"}
            >

              <span>

                {i.product?.name || i.customName}

                {i.variantName
                  ? ` - ${i.variantName}`
                  : ""}

              </span>

              <span className="status-qty">
                x{i.quantity}
              </span>

            </div>

          ))}

      </div>

    </div>
  )}


                {/* TOTAL */}

                <div className="total-box">

                  <p className="total-text">
                    Total: ${total}
                  </p>

                  <button
                    onClick={() =>
                      setShowCheckoutModal(true)
                    }
                    className="big-button button-black"
                  >
                    Cobrar
                  </button>

                </div>  

          </div>

        
        {showScrollBottom && (
          <button
            onClick={() => {
              cartScrollRef.current?.scrollTo({
                top:
                  cartScrollRef.current.scrollHeight,
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
    </div>
      {/* ================================= */}
      {/* CUSTOM PRODUCT MODAL */}
      {/* ================================= */}

      {showCustomItemModal && (

        <div className="send-modal-overlay2">

          <div className="send-modal2">

            <h2 className="send-modal-title2">
              Producto manual
            </h2>

            <input
              type="text"
              placeholder="Nombre"
              value={customItem.name}
              onChange={(e) =>
                setCustomItem({
                  ...customItem,
                  name: e.target.value,
                })
              }
              className="manual-input"
            />

            <input
              type="number"
              placeholder="Precio"
              value={customItem.price}
              onChange={(e) =>
                setCustomItem({
                  ...customItem,
                  price: e.target.value,
                })
              }
              className="manual-input"
            />

            <div className="manual-stations">

              <button
                onClick={() =>
                  setCustomItem({
                    ...customItem,
                    station: "KITCHEN",
                  })
                }
                className={
                  customItem.station === "KITCHEN"
                    ? "station-active"
                    : ""
                }
              >
                Cocina
              </button>

              <button
                onClick={() =>
                  setCustomItem({
                    ...customItem,
                    station: "BAR",
                  })
                }
                className={
                  customItem.station === "BAR"
                    ? "station-active"
                    : ""
                }
              >
                Bebidas
              </button>

            </div>

            <div className="send-actions2">

              <button
                onClick={() =>
                  setShowCustomItemModal(false)
                }
                className="send-cancel2"
              >
                Cancelar
              </button>

              <button
                onClick={addCustomItem}
                className="send-confirm2"
              >
                Agregar
              </button>

            </div>

          </div>

        </div>

      )}

    {/* ================================= */}
    {/* SEND MODAL */}
    {/* ================================= */}

    {showSendModal && (
      <div className="send-modal-overlay">

        <div className="send-modal">

          {/* HEADER */}

          <div className="send-modal-header">

            <div>
              <h2 className="send-modal-title">
                Confirmar orden
              </h2>

              <p className="send-modal-subtitle">
                Revisa los productos antes de enviar
              </p>
            </div>

            <button
              onClick={() =>
                setShowSendModal(false)
              }
              className="send-close-button"
            >
              ✕
            </button>

          </div>

       

          {/* PRODUCTOS */}

          {/* ================================= */}
          {/* PRODUCTOS PENDING REALES */}
          {/* ================================= */}

          <div className="send-products compact-products">

            {/* ================================ */}
            {/* 🍜 COCINA */}
            {/* ================================ */}

            {activeOrder?.items?.some(
              (i: any) =>
                i.status === "PENDING" &&
                (i.station) === "KITCHEN"
            ) && (
              <div className="station-block">

                <div className="station-header kitchen-station">
                  Cocina (

                  <span className="station-count">
                    {
                      activeOrder?.items
                        ?.filter(
                          (i: any) =>
                            i.status === "PENDING" &&
                            (i.station) === "KITCHEN"
                        )
                        .reduce(
                          (sum: number, i: any) =>
                            sum + i.quantity,
                          0
                        )
                    }

                    
                  
                  </span>
                  )
                </div>

                <div className="compact-category-items">

                  {kitchenCategories.flatMap((categoryName) => {

                    const category = categories.find(
                      (c: any) =>
                        c.name === categoryName
                    );

                    if (!category) return [];

                    return activeOrder.items
                        .filter(
                          (i: any) =>
                            i.status === "PENDING" &&
                            (i.station) === "KITCHEN" &&
                            (
                              i.isCustom || // 👈 esto es clave
                              category.products.some(
                                (p: any) =>
                                  p.id === i.product?.id
                              )
                            )
                        )
                      .sort((a: any, b: any) => {

                        // 🔥 notas primero
                        if (a.notes && !b.notes) return -1;
                        if (!a.notes && b.notes) return 1;

                        // luego más nuevos arriba
                        return b.id - a.id;
                      })
                      .map((i: any) => (

                        <div
                          key={i.id}
                          className={`compact-product-row ${
                            flashItemId === i.id
                              ? "flash-note-item"
                              : ""
                          }`}
                        >

                          <div className="compact-product-info">

                            <span
                              className={`compact-product-name ${
                                flashItemId === i.id
                                  ? "flash-note-item"
                                  : ""
                              }`}
                            >
                              {i.product?.name || i.customName}

                              {i.variantName
                                ? ` - ${i.variantName}`
                                : ""}
                            </span>

                            <div className="inline-note-wrapper">

                              <input
                                type="text"
                                placeholder="nota..."
                                value={
                                  editingNotes[i.id] ??
                                  i.notes ??
                                  ""
                                }
                                onChange={(e) => {

                                  setEditingNotes((prev: any) => ({
                                    ...prev,
                                    [i.id]: e.target.value,
                                  }));

                                
                                }}
                                className="inline-note-input"
                              />

                              {(editingNotes[i.id] ?? i.notes ?? "").trim() !==
                                (i.notes ?? "").trim() && (

                                <button
                                  className="confirm-note-button"
                                  onClick={async () => {

                                    const notes =
                                      editingNotes[i.id];

                                    const res = await fetch(
                                      
                                      `/api/orders/items/${i.id}/notes`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type":
                                            "application/json",
                                        },
                                        body: JSON.stringify({
                                          notes,
                                        }),
                                      }
                                    );

                                    const data = await res.json();
                                    setEditingNotes((prev: any) => ({
                                      ...prev,

                                      [i.id]: data.newItemId
                                        ? ""
                                        : notes,
                                    }));

                                    

                                    mutateOrder();

                                    if (data.newItemId) {

                                      setFlashItemId(
                                        data.newItemId
                                      );

                                      setTimeout(() => {
                                        setFlashItemId(null);
                                      }, 2200);
                                    }
                                  }}
                                >
                                  Confirmar
                                </button>
                              )}

                              {(editingNotes[i.id] ?? i.notes ?? "").trim() ===
                                (i.notes ?? "").trim() &&
                                (i.notes ?? "").trim() !== "" && (

                                <div className="saved-note-check">
                                  ✔
                                </div>
                              )}
                                                  

                            </div>

                          </div> 

                          <div className="pending-controls">

                            <button
                              onClick={async () => {

                                await fetch(
                                  `/api/orders/items/${i.id}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type":
                                        "application/json",
                                    },
                                    body: JSON.stringify({
                                      quantity:
                                        i.quantity - 1,
                                    }),
                                  }
                                );

                                mutateOrder();
                              }}
                              className="qty-button"
                            >
                              -
                            </button>

                            <span className="compact-product-qty">
                              x{i.quantity}
                            </span>

                            <button
                              onClick={async () => {

                                await fetch(
                                  `/api/orders/items/${i.id}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type":
                                        "application/json",
                                    },
                                    body: JSON.stringify({
                                      quantity:
                                        i.quantity + 1,
                                    }),
                                  }
                                );

                                mutateOrder();
                              }}
                              className="qty-button"
                            >
                              +
                            </button>

                          </div>

                        </div>

                      ));
                  })}

                </div>

              </div>
            )}

            {/* ================================ */}
            {/* 🍹 BAR */}
            {/* ================================ */}

            {activeOrder?.items?.some(
              (i: any) =>
                i.status === "PENDING" &&
                (i.station) === "BAR"
            ) && (
              <div className="station-block">

                <div className="station-header bar-station">
                  Bebidas (
                  <span className="station-count">
                    {
                      activeOrder?.items
                        ?.filter(
                          (i: any) =>
                            i.status === "PENDING" &&
                            (i.station) === "BAR"
                        )
                        .reduce(
                          (sum: number, i: any) =>
                            sum + i.quantity,
                          0
                        )
                    }
                  </span>)
                </div>

                <div className="compact-category-items">

                  {activeOrder.items
                    .filter(
                      (i: any) =>
                        i.status === "PENDING" &&
                        (i.station) === "BAR"
                    )
                    .map((i: any) => (

                      <div
                        key={i.id}
                        className="compact-product-row"
                      >

                        <span className="compact-product-name">
                          
                          {i.product?.name || i.customName}
                          {i.variantName
                            ? ` - ${i.variantName}`
                            : ""}

                          
                        </span>

                        <div className="pending-controls">

                          <button
                            onClick={async () => {

                              await fetch(
                                `/api/orders/items/${i.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },
                                  body: JSON.stringify({
                                    quantity:
                                      i.quantity - 1,
                                  }),
                                }
                              );

                              mutateOrder();
                            }}
                            className="qty-button"
                          >
                            -
                          </button>

                          <span className="compact-product-qty">
                            x{i.quantity}
                          </span>

                          <button
                            onClick={async () => {

                              await fetch(
                                `/api/orders/items/${i.id}`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },
                                  body: JSON.stringify({
                                    quantity:
                                      i.quantity + 1,
                                  }),
                                }
                              );

                              mutateOrder();
                            }}
                            className="qty-button"
                          >
                            +
                          </button>

                        </div>

                      </div>

                    ))}

                </div>

              </div>
            )}

          </div>

          {/* PRINT OPTIONS */}

          <div className="send-options">

            <button
              onClick={() =>
                setPrintKitchen(
                  !printKitchen
                )
              }
              className={`print-toggle large-toggle ${
                printKitchen
                  ? "print-on-kitchen"
                  : "print-off"
              }`}
            >
              Cocina
            </button>

            <button
              onClick={() =>
                setPrintBar(!printBar)
              }
              className={`print-toggle large-toggle ${
                printBar
                  ? "print-on-bar"
                  : "print-off"
              }`}
            >
              Bebidas
            </button>

          </div>

          {/* TOTAL */}

          <div className="send-total">
            Total: ${total}
          </div>

          {/* ACTIONS */}

          <div className="send-actions">

            <button
              onClick={() =>
                setShowSendModal(false)
              }
              className="send-cancel"
            >
              Cancelar
            </button>

            <button
              onClick={async () => {

                await confirmAddToOrder();

                setTimeout(async () => {
                  await sendToKitchen();
                }, 300);

                setShowSendModal(false);
              }}
              className="send-confirm"
            >
              Enviar a cocina
            </button>

          </div>

        </div>

      </div>

      
    )}

    {/* ================================= */}
{/* CHECKOUT MODAL */}
{/* ================================= */}

{showCheckoutModal && (

  <div className="pos-overlay">

    <div className="pos-modal">

      {/* ===================== */}
      {/* HEADER POS */}
      {/* ===================== */}

      <div className="pos-header">

        <div className="pos-title-block">

          <h2 className="pos-title">
             {selectedTable?.name}
          </h2>

          <p className="pos-subtitle">
            Cobro / Checkout
          </p>

        </div>

        <button
          onClick={() => setShowCheckoutModal(false)}
          className="pos-close"
        >
          ✕
        </button>

      </div>

      {/* ===================== */}
      {/* RESUMEN RÁPIDO */}
      {/* ===================== */}

      <div className="pos-summary">

        <div className="pos-summary-box">
          <span>Items</span>
          <strong>
            {activeOrder?.items?.length || 0}
          </strong>
        </div>

        <div className="pos-summary-box">
          <span>Ticket</span>
          <strong>
            {activeOrder?.tickets?.length || 1}
          </strong>
        </div>

        <div className="pos-summary-box pos-total">
          <span>Total</span>
          <strong>${total}</strong>
        </div>

      </div>

      {/* ===================== */}
      {/* TABS */}
      {/* ===================== */}

      <div className="pos-tabs">

        <button
          onClick={() => setCheckoutView("grouped")}
          className={`pos-tab ${
            checkoutView === "grouped" ? "active" : ""
          }`}
        >
          Resumen
        </button>

        <button
          onClick={() => setCheckoutView("tickets")}
          className={`pos-tab ${
            checkoutView === "tickets" ? "active" : ""
          }`}
        >
          Tickets
        </button>

      </div>

      {/* ===================== */}
      {/* CONTENT */}
      {/* ===================== */}

      <div className="pos-content">

        {/* ===== RESUMEN ===== */}
        {checkoutView === "grouped" && (

          <div className="pos-list">

            {Object.values(groupedItems || {}).map((i: any) => (

              <div
                key={i.id}
                className={`pos-item ${
                  (i.station) === "BAR"
                    ? "bar"
                    : "kitchen"
                }`}
              >
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

        {/* ===== TICKETS ===== */}
        {checkoutView === "tickets" && (

          <div className="pos-tickets">

            {activeOrder?.tickets?.slice().reverse().map((ticket: any) => (

              <div key={ticket.id} className="pos-ticket">

                <div className="pos-ticket-header">
                  Pedido #{ticket.id}
                  <span>
                    {new Date(ticket.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {ticket.items.map((i: any) => (
                  <div
                    key={i.id}
                    className={`pos-ticket-item ${
                      (i.station) === "BAR"
                        ? "bar"
                        : "kitchen"
                    }`}
                  >
                    {/* cantidad primero */}
                    <span className="pos-qty" style={{ paddingRight: '10px' }}>
                      x{i.quantity}
                    </span>

                    {/* nombre del producto */}
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

      {/* ===================== */}
      {/* FOOTER ACTIONS */}
      {/* ===================== */}

      <div className="pos-footer">

        <button
          onClick={() => setShowCheckoutModal(false)}
          className="pos-btn cancel"
        >
          Volver
        </button>

        <button
          onClick={async () => {
            await checkout();
            setShowCheckoutModal(false);
          }}
          className="pos-btn pay"
        >
          Cobrar ¥ {total}
        </button>

      </div>

    </div>

  </div>

)}
  </main>
);
}