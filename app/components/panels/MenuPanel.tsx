"use client";

import { useMemo, useState } from "react";
import { useUiStore } from "@/app/stores/uiStore";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Rows3,
  Moon,
  Sun,
  ChevronRight,
  Soup,
  Beef,
  Fish,
  IceCreamCone,
  CookingPot,
  Salad,
  CupSoda,
  BadgeJapaneseYen,
  PanelLeft,
  BadgeDollarSign,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "@/app/src/components/ui/IconButton";
import { PanelHeader } from "@/app/src/components/ui/PanelHeader";
import { InteractiveCard } from "@/app/src/components/ui/InteractiveCard";
import { useOrderStore } from "@/app/stores/orderStore";
type SidebarLayout = "vertical" | "horizontal";
type ProductsLayout = "list" | "grid";


const categoryIcons: Record<string, any> = {
  Postres: IceCreamCone,
  Entradas: Salad,
  Especialidades: Beef,
  "Sopas y Ramen": Soup,
  "Udon y Tallarines": CookingPot,
  Arroz: BadgeJapaneseYen,
  Sushi: Fish,
  Bebidas: CupSoda,
  "Manual": Plus,
};

const categoryColors: Record<string, string> = {
  Postres: "bg-pink-100 text-pink-700",
  Entradas: "bg-emerald-100 text-emerald-700",
  Especialidades: "bg-orange-100 text-orange-700",
  "Sopas y Ramen": "bg-amber-100 text-amber-700",
  "Udon y Tallarines": "bg-yellow-100 text-yellow-700",
  Arroz: "bg-lime-100 text-lime-700",
  Sushi: "bg-cyan-100 text-cyan-700",
  Bebidas: "bg-sky-100 text-sky-700",
  "Manual": "bg-violet-100 text-violet-700",
};

export function MenuPanel({
  categories,
  openedCategoryId,
  selectedVariant,
  setOpenedCategoryId,
  setSelectedVariant,
  addToPending,
  onOpenCustomItemModal,
}: any) {

  const selectedTable =
  useOrderStore(
    (s) => s.selectedTable
  );

  const triggerTableSelectionError =
    useUiStore(
      (s) =>
        s.triggerTableSelectionError
  );
  const [sidebarLayout, setSidebarLayout] =
    useState<SidebarLayout>("vertical");

  const [productsLayout, setProductsLayout] =
    useState<ProductsLayout>("list");

  const {
    darkMode,
    toggleDarkMode,
  } = useUiStore();

  const [showPrices, setShowPrices] =
    useState(true);

  /**
   * HIDE INTERNAL CATEGORY
   * + ALWAYS ADD MANUAL BUTTON AT THE END
   */
  const visibleCategories = useMemo(() => {
    const filtered = categories.filter(
      (c: any) =>
        c.name !== "Manuales" &&
        c.name !== "Manual"
    );

    return [
      ...filtered,
      {
        id: "manual-category",
        name: "Manual",
        products: [],
      },
    ];
  }, [categories]);

  const activeCategory = useMemo(() => {
    return categories.find(
      (c: any) =>
        c.id === openedCategoryId
    );
  }, [categories, openedCategoryId]);

  return (
    <div
      className={cn(
        "h-full flex flex-col overflow-hidden transition-colors duration-200",
        darkMode
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-900"
      )}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}
      <PanelHeader
        title="Menú"
        description="Sistema POS"
        actions={
          <>
            <IconButton
              onClick={() =>
                toggleDarkMode()
              }
            >
              {darkMode ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </IconButton>

            <IconButton
              onClick={() =>
                setSidebarLayout(
                  sidebarLayout ===
                    "vertical"
                    ? "horizontal"
                    : "vertical"
                )
              }
            >
              <PanelLeft size={16} />
            </IconButton>

            <IconButton
              onClick={() =>
                setProductsLayout(
                  productsLayout ===
                    "list"
                    ? "grid"
                    : "list"
                )
              }
            >
              {productsLayout ===
              "list" ? (
                <LayoutGrid size={16} />
              ) : (
                <Rows3 size={16} />
              )}
            </IconButton>

            <IconButton
              onClick={() =>
                setShowPrices(
                  !showPrices
                )
              }
            >
              <BadgeDollarSign size={16} />
            </IconButton>
          </>
        }
      />
          
      {/* =====================================================
          CONTENT
      ===================================================== */}
      <motion.div
        layout
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
        className={cn(
          "flex-1 gap-2 p-2 min-h-0",
          sidebarLayout === "horizontal"
            ? "flex flex-row overflow-hidden"
            : "flex flex-col overflow-y-auto"
        )}
      >

        {/* =================================================
            CATEGORY BLOCK
        ================================================= */}
        <motion.div
          layout
          transition={{
            duration: 0.25,
            ease: "linear",
          }}
          className={cn(
            "shrink-0 min-h-0",
            sidebarLayout ===
              "horizontal"
              ? "w-[88px] overflow-y-auto"
              : "w-full"
          )}
        >

          <motion.div
            layout
            transition={{
              duration: 0.25,
              ease: "linear",
            }}
            className={cn(
              sidebarLayout ===
                "horizontal"
                ? "flex flex-col gap-1.5 pb-2"
                : `
                  grid gap-2
                  grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
                `
            )}
          >

            {visibleCategories.map(
              (cat: any) => {
                const active =
                  openedCategoryId ===
                  cat.id;

                const Icon =
                  categoryIcons[
                    cat.name
                  ] || Beef;

                return (
                <motion.div
                  layout
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  key={cat.id}
                >
                  <InteractiveCard
                    active={active}
                    onClick={() => {

                      if (
                        cat.name ===
                        "Manual"
                      ) {
                        onOpenCustomItemModal?.();
                        return;
                      }

                      setOpenedCategoryId(
                        active
                          ? null
                          : cat.id
                      );
                    }}
                    className={cn(
                      `
                        flex
                        items-center
                        text-left
                        p-2
                        gap-2
                        min-h-[56px]
                      `,

                      sidebarLayout === "horizontal"
                        ? "justify-center w-full"
                        : "justify-start w-full"
                    )}
                  >

                    {/* ICON */}
                    <div
                      className={cn(
                        "shrink-0 rounded-md flex items-center justify-center",

                        sidebarLayout === "horizontal"
                          ? "w-10 h-10"
                          : "w-8 h-8",

                        categoryColors[
                          cat.name
                        ]
                      )}
                    >
                      <Icon size={14} />
                    </div>

                    {/* TEXT */}
                    {sidebarLayout !== "horizontal" && (
                      <span
                        className={cn(
                          "font-semibold leading-tight text-xs",
                          "break-words whitespace-normal",
                          "text-zinc-900 dark:text-white"
                        )}
                      >
                        {cat.name}
                      </span>
                    )}

                  </InteractiveCard>
                </motion.div>
                );
              }
            )}

          </motion.div>
        </motion.div>

        {/* =================================================
            PRODUCTS BLOCK
        ================================================= */}
        <motion.div
          layout
          transition={{
            duration: 0.18,
            ease: "easeOut",
          }}
          className={cn(
            "flex-1 min-w-0 min-h-0",
            sidebarLayout === "horizontal"
              ? "overflow-y-auto"
              : "overflow-hidden"
          )}
        >

          <div
            className={cn(
              "h-full rounded-md border overflow-hidden transition-colors duration-200",
              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            )}
          >

            {!activeCategory && (
              <div className="h-full flex items-center justify-center p-10">

                <div className="text-center">

                  <div className="text-lg font-semibold">
                    Selecciona una categoría
                  </div>

                  <div
                    className={cn(
                      "text-sm mt-1",
                      darkMode
                        ? "text-zinc-400"
                        : "text-muted-foreground"
                    )}
                  >
                    Elige una categoría para visualizar productos
                  </div>

                </div>

              </div>
            )}

            {activeCategory && (

              <div className="h-full flex flex-col overflow-hidden">

                {/* PRODUCTS */}
                <div className="flex-1 overflow-y-auto p-2">

                  <motion.div
                    layout
                    transition={{
                      duration: 0.18,
                      ease: "easeOut",
                    }}
                    className={cn(
                      productsLayout ===
                        "grid"
                        ? `
                          grid gap-2
                          grid-cols-1
                          md:grid-cols-2
                          xl:grid-cols-3
                        `
                        : "flex flex-col gap-2"
                    )}
                  >

                    {activeCategory.products.map(
                      (prod: any) => {
                        const opened =
                          selectedVariant ===
                          prod.id;

                        return (
                          <motion.div
                            layout
                            transition={{
                              duration: 0.18,
                              ease: "easeOut",
                            }}
                            key={prod.id}
                            className={cn(
                              "group rounded-md border overflow-hidden transition-all duration-200",

                              opened
                                ? darkMode
                                  ? "bg-zinc-800 border-zinc-700 shadow-lg"
                                  : "bg-white border-primary shadow-md ring-1 ring-primary/10"
                                : darkMode
                                ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                                : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                            )}
                          >

                            {/* PRODUCT */}
                            <button
                              onClick={() => {
                                if (!selectedTable) {
                                  triggerTableSelectionError();
                                  return;
                                }

                                if (
                                  prod.variants
                                    ?.length >
                                  0
                                ) {
                                  setSelectedVariant(
                                    opened
                                      ? null
                                      : prod.id
                                  );

                                  return;
                                }
                                
                                addToPending({
                                  ...prod,
                                  variant: null,
                                  variantPrice: 0,
                                });
                              }}
                              className={cn(
                                "w-full p-3 flex items-center justify-between text-left transition-colors min-h-[56px]",
                                darkMode
                                  ? "hover:bg-zinc-800"
                                  : "hover:bg-zinc-50"
                              )}
                            >

                              <div className="min-w-0">

                                <div className="font-semibold truncate text-sm">
                                  {prod.name}
                                </div>

                              </div>

                              <div className="flex items-center gap-3 shrink-0">

                                {showPrices && (
                                  <span
                                    className={cn(
                                      "text-sm font-medium",
                                      darkMode
                                        ? "text-zinc-400"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    $
                                    {
                                      prod.price
                                    }
                                  </span>
                                )}

                                {prod.variants
                                  ?.length >
                                  0 && (
                                  <ChevronRight
                                    size={16}
                                    className={cn(
                                      "transition-transform duration-200",
                                      opened &&
                                        "rotate-90"
                                    )}
                                  />
                                )}

                              </div>

                            </button>

                            {/* VARIANTS */}
                            <AnimatePresence initial={false}>
                              {opened && (
                                <motion.div
                                  layout
                                  initial={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    height:
                                      "auto",
                                    opacity: 1,
                                  }}
                                  exit={{
                                    height: 0,
                                    opacity: 0,
                                  }}
                                  transition={{
                                    duration: 0.18,
                                    ease: "easeOut",
                                  }}
                                  className={cn(
                                    "overflow-hidden border-t",
                                    darkMode
                                      ? "bg-zinc-800 border-zinc-700"
                                      : "bg-zinc-50 border-zinc-200"
                                  )}
                                >

                                  {/* VARIANTS GRID */}
                                  <div
                                    className="
                                      p-2
                                      grid
                                      gap-2
                                      grid-cols-[repeat(auto-fit,minmax(140px,1fr))]
                                    "
                                  >

                                    {prod.variants?.map(
                                      (
                                        v: any
                                      ) => (
                                        <button
                                          key={
                                            v.id
                                          }
                                          onClick={() => {

                                            addToPending({
                                              ...prod,
                                              variant: v.name,
                                              variantPrice: v.price,
                                            });

                                            setSelectedVariant(
                                              null
                                            );
                                          }}
                                          className={cn(
                                            "w-full min-h-[44px]",
                                            "px-3 py-2 rounded-md border",
                                            "text-sm font-medium",
                                            "transition-all duration-200",
                                            "flex items-center justify-center text-center",

                                            darkMode
                                              ? `
                                                bg-zinc-900
                                                border-zinc-700
                                                hover:bg-zinc-700
                                              `
                                              : `
                                                bg-white
                                                border-zinc-200
                                                hover:bg-zinc-100
                                              `
                                          )}
                                        >

                                          <span className="break-words whitespace-normal">

                                            {
                                              v.name
                                            }

                                            {showPrices &&
                                              v.price >
                                                0 &&
                                              ` (+$${v.price})`}

                                          </span>

                                        </button>
                                      )
                                    )}

                                  </div>

                                </motion.div>
                              )}
                            </AnimatePresence>

                          </motion.div>
                        );
                      }
                    )}

                  </motion.div>

                </div>

              </div>
            )}

          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}