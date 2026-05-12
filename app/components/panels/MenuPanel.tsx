"use client";

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

const iconMap = Object.fromEntries(categoryConfig.map((c) => [c.name, c.icon]));

export function MenuPanel({
  categories,
  openedCategoryId,
  selectedVariant,
  setOpenedCategoryId,
  setSelectedVariant,
  addToPending,
  onOpenCustomItemModal,
}: {
  categories: any[];
  openedCategoryId: number | null;
  selectedVariant: number | null;
  setOpenedCategoryId: (id: number | null) => void;
  setSelectedVariant: (id: number | null) => void;
  addToPending: (product: any) => void;
  onOpenCustomItemModal: () => void;
}) {
  return (
    <div className="home-menu">
      <div className="panel-scroll">
        <div className="categories-grid">
          {kitchenCategories.map((catName) => {
            const cat = categories.find((c: any) => c.name === catName);
            if (!cat) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setOpenedCategoryId(openedCategoryId === cat.id ? null : cat.id)}
                className={`category-button ${openedCategoryId === cat.id ? "category-active" : ""}`}
              >
                <span className="category-icon">{iconMap[cat.name]}</span>
                <span className="category-text">{cat.name}</span>
              </button>
            );
          })}
          <button onClick={onOpenCustomItemModal} className="custom-item-button">
            + Producto manual
          </button>
        </div>

        {categories.map((cat: any) => {
          if (openedCategoryId !== cat.id) return null;
          return (
            <div key={cat.id} className="category-panel">
              <h2 className="category-title">{cat.name}</h2>
              <div className="product-list">
                {cat.products.map((prod: any) => (
                  <div key={prod.id} className="product-card">
                    <div
                      onClick={() => {
                        if (prod.variants?.length > 0) {
                          setSelectedVariant(selectedVariant === prod.id ? null : prod.id);
                        } else {
                          addToPending({ ...prod, displayName: prod.name, variant: null, variantPrice: 0 });
                        }
                      }}
                      className="product-main"
                    >
                      <span className="product-name">{prod.name}</span>
                      <span className="product-price">${prod.price}</span>
                    </div>
                    <div
                      className={`variant-panel ${
                        selectedVariant === prod.id ? "variant-visible" : "variant-hidden"
                      }`}
                    >
                      <div className="variant-content">
                        {prod.variants?.map((v: any) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              addToPending({
                                ...prod,
                                displayName: `${prod.name} - ${v.name}`,
                                variant: v.name,
                                variantPrice: v.price,
                              });
                              setSelectedVariant(null);
                            }}
                            className="variant-button"
                          >
                            {v.name}
                            {v.price > 0 ? ` (+$${v.price})` : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
