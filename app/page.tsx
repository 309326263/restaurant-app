"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import "./home.css";
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

export default function Home() {
  const [printKitchen, setPrintKitchen] = useState(true);
  const [printBar, setPrintBar] = useState(false);
  const [customItem, setCustomItem] = useState<{
    name: string;
    price: string;
    station: "KITCHEN" | "BAR";
  }>({ name: "", price: "", station: "KITCHEN" });

  const { data: tables = [], mutate: mutateTables } = useSWR("/api/tables", fetcher);
  const {
    selectedTable,
    activeOrder,
    groupedItems: groupedItemsFromStore,
    total: totalFromStore,
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
  const { data: categories = [] } = useSWR("/api/categories", fetcher);

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
  const { recentItems } = useKitchenSync(activeOrder, refreshOrder);
  const { groupedItems, total } = useOrderTotals(activeOrder, pendingCart);
  useEffect(() => {
    setComputedOrderData({ groupedItems, total });
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

  const onCheckout = async () => {
    const ok = await checkout(actions);
    if (ok) {
      clearPending();
      setShowCheckoutModal(false);
    }
  };

  return (
    <HomeLayout
      tablesPanel={
        <TablesPanel tables={tables} selectedTable={selectedTable} onSelectTable={onSelectTable} />
      }
      menuPanel={
        <MenuPanel
          categories={categories}
          openedCategoryId={openedCategoryId}
          selectedVariant={selectedVariant}
          setOpenedCategoryId={setOpenedCategoryId}
          setSelectedVariant={setSelectedVariant}
          addToPending={addToPending}
          onOpenCustomItemModal={() => setShowCustomItemModal(true)}
        />
      }
      cartPanel={
        <CartPanel
          activeOrder={activeOrder}
          categories={categories}
          pendingCart={pendingCart}
          total={totalFromStore}
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
            customItem={customItem}
            onClose={() => setShowCustomItemModal(false)}
            onChange={(patch) => setCustomItem((prev) => ({ ...prev, ...patch }))}
            onAdd={() => {
              if (!customItem.name || !customItem.price) return;
              addCustomItem(customItem);
              setCustomItem({ name: "", price: "", station: "KITCHEN" });
              setShowCustomItemModal(false);
            }}
          />
          <SendModal
            open={showSendModal}
            activeOrder={activeOrder}
            total={totalFromStore}
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
            total={totalFromStore}
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
