import { useMemo, useState } from "react";
import { useMenu } from "../../context/MenuContext";
import { faNum } from "../../data/tableLayout";
import { getItemPricing } from "../../data/price";
import ProductFormModal from "./ProductFormModal";

export default function CategoryItemsEditor({ categoryId, categoryName, onBack }) {
  const { getCategory, addItem, updateItem, deleteItem } = useMenu();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const category = getCategory(categoryId);
  const items = category?.items ?? [];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.nameFA.includes(query) ||
        item.name.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && item.available) ||
        (filter === "inactive" && !item.available);

      return matchesQuery && matchesFilter;
    });
  }, [items, query, filter]);

  const openCreate = () => setModal({ mode: "create", item: null });
  const openEdit = (item) => setModal({ mode: "edit", item });

  const handleSave = (draft) => {
    if (modal.mode === "create") {
      addItem(categoryId, draft).catch(console.error);
    } else {
      updateItem(categoryId, draft.id, draft).catch(console.error);
    }

    setModal(null);
  };

  const handleDelete = (itemId) => {
    if (window.confirm("این محصول حذف شود؟")) {
      deleteItem(categoryId, itemId).catch(console.error);
      setModal(null);
    }
  };

  return (
    <div className="menu-cat-editor">
      <header className="menu-cat-editor-head">
        <button type="button" className="menu-btn menu-btn--ghost" onClick={onBack}>
          → بازگشت
        </button>
        <div>
          <h3 className="menu-cat-editor-title">مدیریت {categoryName}</h3>
          <p className="menu-cat-editor-sub">{faNum(items.length)} محصول در این دسته</p>
        </div>
        <button type="button" className="menu-btn menu-btn--primary" onClick={openCreate}>
          + محصول جدید
        </button>
      </header>

      <div className="menu-cat-editor-toolbar">
        <input
          type="search"
          className="menu-cat-search"
          placeholder="جستجو در محصولات..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="menu-cat-filters">
          {[
            { id: "all", label: "همه" },
            { id: "active", label: "موجود" },
            { id: "inactive", label: "ناموجود" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`menu-cat-filter ${filter === tab.id ? "is-active" : ""}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="menu-cat-empty">
          <p>محصولی یافت نشد.</p>
          <button type="button" className="menu-btn menu-btn--primary" onClick={openCreate}>
            افزودن اولین محصول
          </button>
        </div>
      ) : (
        <ul className="menu-product-list">
          {filtered.map((item) => (
            <li key={item.id} className={`menu-product-item ${item.available ? "" : "is-unavailable"}`}>
              <div className="menu-product-thumb">
                <img src={item.image} alt={item.nameFA} loading="lazy" />
              </div>
              <div className="menu-product-body">
                <div className="menu-product-head">
                  <h4>{item.nameFA}</h4>
                  {!item.available && <span className="menu-product-badge badge-off">ناموجود</span>}
                  {Number(item.discount) > 0 && (
                    <span className="menu-product-badge badge-disc">{faNum(item.discount)}٪ تخفیف</span>
                  )}
                  {item.featuredFloravan && <span className="menu-product-badge badge-flor">پیشنهاد فلوروان</span>}
                  {item.featuredPopular && <span className="menu-product-badge badge-pop">پرطرفدار</span>}
                </div>
                <p className="menu-product-desc">{item.desc || "—"}</p>
                <div className="menu-product-meta">
                  {Number(item.discount) > 0 ? (
                    <span>
                      <s style={{ opacity: 0.5 }}>{getItemPricing(item).originalLabel}</s>{" "}
                      {getItemPricing(item).finalLabel} تومان
                    </span>
                  ) : (
                    <span>{item.price} تومان</span>
                  )}
                  <span>⏱ {faNum(item.prepTime)} دقیقه</span>
                  {item.optionGroups?.length > 0 && (
                    <span>{faNum(item.optionGroups.length)} گروه گزینه</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="menu-btn menu-btn--outline"
                onClick={() => openEdit(item)}
              >
                ویرایش
              </button>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <ProductFormModal
          mode={modal.mode}
          categoryId={categoryId}
          initialItem={modal.item}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
