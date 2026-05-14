"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

import { HomeLayout } from "@/app/components/layout/HomeLayout";
import { TablesPanel } from "@/app/components/panels/TablesPanel";
import { MenuPanel } from "@/app/components/panels/MenuPanel";
import { CartPanel } from "@/app/components/panels/CartPanel";

import { SendModal } from "@/app/components/modals/SendModal";
import { CheckoutModal } from "@/app/components/modals/CheckoutModal";
import { CustomItemModal } from "@/app/components/modals/CustomItemModal";

import { useCartStore } from "@/app/stores/cartStore";
import { useUiStore } from "@/app/stores/uiStore";
import { useOrderStore } from "@/app/stores/orderStore";

import { useKitchenSync } from "@/app/hooks/useKitchenSync";
import { useOrderTotals } from "@/app/hooks/useOrderTotals";

import { getItemName, getItemPrice, getItemQty } from "@/lib/orderItem";

import { LeftSidebarShell } from "@/app/components/layout/LeftSidebarShell";

export default function Home() {
  const [printKitchen, setPrintKitchen] = useState(true);
  const [printBar, setPrintBar] = useState(false);

  const [customItem, setCustomItem] = useState({
    name: "",
    price: "",
    station: "KITCHEN" as "KITCHEN" | "BAR",
  });

  const { data: tables = [], mutate: mutateTables } =
    useSWR("/api/tables", fetcher);

  const {
    selectedTable,
    activeOrder,
    groupedItems: groupedItemsFromStore,
    setSelectedTable,
    setActiveOrder,
    setComputedOrderData,
    confirmAddToOrder,
    checkout,
    sendToKitchen,
  } = useOrderStore();

  const { data: orderData, mutate: mutateOrder } = useSWR(
    selectedTable ? `/api/tables/${selectedTable.id}/order` : null,
    fetcher
  );

  const { data: categories = [] } =
    useSWR("/api/categories", fetcher);

  useEffect(() => {
    setActiveOrder(orderData ?? null);
  }, [orderData, setActiveOrder]);

  const {
    pendingCart,
    addToPending,
    addCustomItem,
    increasePending,
    decreasePending,
    removePending,
    updatePendingNote,
    clearPending,
  } = useCartStore();

  const {
    showCustomItemModal,
    showSendModal,
    showCheckoutModal,

    selectedVariant,
    openedCategoryId,

    checkoutView,
    editingNotes,
    flashItemId,

    darkMode,

    setShowCustomItemModal,
    setShowSendModal,
    setShowCheckoutModal,

    setSelectedVariant,
    setOpenedCategoryId,

    setCheckoutView,
    setEditingNote,
    setFlashItemId,
  } = useUiStore();

  const refreshOrder = () => mutateOrder();

  const { recentItems } =
    useKitchenSync(activeOrder, refreshOrder);

  const { groupedItems, total } =
    useOrderTotals(activeOrder, pendingCart);

  useEffect(() => {
    setComputedOrderData({
      groupedItems,
      total,
    });
  }, [groupedItems, total, setComputedOrderData]);

  const actions = useMemo(
    () => ({
      mutateOrder,
      mutateTables,
    }),
    [mutateOrder, mutateTables]
  );

  const onSelectTable = (table: any) => {
    setSelectedTable(table);
    clearPending();
  };

  const onConfirmAddToOrder = async () => {
    const ok = await confirmAddToOrder({
      ...actions,
      pendingCart,
    });

    if (ok) {
      clearPending();
      await mutateOrder();
    }
  };

  const onSend = async () => {
    await onConfirmAddToOrder();

    if (!activeOrder?.id) return;

    await sendToKitchen(activeOrder.id, {
      printKitchen,
      printBar,
    });

    setShowSendModal(false);
    await mutateOrder();
  };

  /* =========================================================
     🧾 CHECKOUT FIXADO (IMPRESIÓN REAL + TOTAL CORRECTO)
  ========================================================= */
  const onCheckout = async () => {
    const ok = await checkout(actions);

    if (!ok || !activeOrder?.id) return;

    const res = await fetch(`/api/orders/${activeOrder.id}`);
    if (!res.ok) return;

    const order = await res.json();

    const items = order.items || [];

    const receiptItems = items
      .filter((i: any) => getItemQty(i) > 0)
      .map((i: any) => ({
        id: i.id,
        displayName: getItemName(i),
        quantity: getItemQty(i) || 1,
        unitPrice: getItemPrice(i),
        station: i.station,
        variantName: i.variantName ?? null,
        notes: i.notes ?? null,
        type: i.type,
        productId: i.productId ?? null,
      }));

    const total = receiptItems.reduce(
      (sum: number, i: any) =>
        sum + i.quantity * i.unitPrice,
      0
    );

    await fetch("http://localhost:4000/emit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: ["PRINT_RECEIPT"],
        payload: {
          id: order.id,
          table: order.table,
          items: receiptItems,
          total,
          ticketId: order.id,
        },
      }),
    });

    clearPending();
    setShowCheckoutModal(false);
  };

  return (
    <HomeLayout
      tablesPanel={
        <LeftSidebarShell>
          <TablesPanel
            tables={tables}
            selectedTable={selectedTable}
            onSelectTable={onSelectTable}
          />
        </LeftSidebarShell>
      }
      menuPanel={
        <MenuPanel
          categories={categories}
          openedCategoryId={openedCategoryId}
          selectedVariant={selectedVariant}
          setOpenedCategoryId={setOpenedCategoryId}
          setSelectedVariant={setSelectedVariant}
          addToPending={addToPending}
          onOpenCustomItemModal={() =>
            setShowCustomItemModal(true)
          }
        />
      }
      cartPanel={
        <CartPanel
          activeOrder={activeOrder}
          categories={categories}
          pendingCart={pendingCart}
          total={total}
          recentItems={recentItems}
          onDecreasePending={decreasePending}
          onIncreasePending={increasePending}
          onRemovePending={removePending}
          onPendingNoteChange={updatePendingNote}
          onConfirmAddToOrder={onConfirmAddToOrder}
          onOpenSendModal={() => setShowSendModal(true)}
          onOpenCheckoutModal={() => setShowCheckoutModal(true)}
        />
      }
      modals={
        <>
          <CustomItemModal
            open={showCustomItemModal}
            darkMode={darkMode}
            customItem={customItem}
            onClose={() => setShowCustomItemModal(false)}
            onChange={(patch) =>
              setCustomItem((prev) => ({ ...prev, ...patch }))
            }
            onAdd={() => {
              if (!customItem.name || !customItem.price) return;

              addCustomItem(customItem);

              setCustomItem({
                name: "",
                price: "",
                station: "KITCHEN",
              });

              setShowCustomItemModal(false);
            }}
          />

          <SendModal
            open={showSendModal}
            activeOrder={activeOrder}
            total={total}
            printKitchen={printKitchen}
            printBar={printBar}
            setPrintKitchen={setPrintKitchen}
            setPrintBar={setPrintBar}
            editingNotes={editingNotes}
            setEditingNote={setEditingNote}
            flashItemId={flashItemId}
            setFlashItemId={setFlashItemId}
            mutateOrder={mutateOrder}
            onClose={() => setShowSendModal(false)}
            onSend={onSend}
          />

          <CheckoutModal
            open={showCheckoutModal}
            selectedTable={selectedTable}
            activeOrder={activeOrder}
            groupedItems={groupedItemsFromStore}
            total={total}
            checkoutView={checkoutView}
            setCheckoutView={setCheckoutView}
            onClose={() => setShowCheckoutModal(false)}
            onCheckout={onCheckout}
          />
        </>
      }
    />
  );
}