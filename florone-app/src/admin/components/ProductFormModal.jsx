import { useEffect, useState } from "react";
import { createEmptyMenuItem } from "../../data/menuItemUtils";
import { getItemPricing } from "../../data/price";
import OptionGroupsEditor from "./OptionGroupsEditor";

const EMPTY_FORM = createEmptyMenuItem("");

export default function ProductFormModal({
  mode,
  categoryId,
  initialItem,
  onSave,
  onClose,
  onDelete,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...initialItem,
    categoryId,
  }));
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(initialItem?.image || "");

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initialItem, categoryId });
    setImagePreview(initialItem?.image || "");
    setError("");
  }, [initialItem, categoryId, mode]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
      return;
    }

    setError("");
    setField("imageFile", file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nameFA.trim()) {
      setError("نام فارسی محصول الزامی است.");
      return;
    }
    if (!String(form.price).trim()) {
      setError("قیمت محصول الزامی است.");
      return;
    }

    const cleanedGroups = form.optionGroups
      .map((group) => ({
        ...group,
        name: group.name.trim(),
        choices: group.choices.filter((choice) => choice.label.trim()),
      }))
      .filter((group) => group.name && group.choices.length > 0);

    onSave({ ...form, optionGroups: cleanedGroups });
  };

  return (
    <div className="menu-modal-overlay" onClick={onClose}>
      <div
        className="menu-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-product-form-title"
      >
        <header className="menu-modal-head">
          <div>
            <h2 id="menu-product-form-title" className="menu-modal-title">
              {mode === "edit" ? "ویرایش محصول" : "افزودن محصول"}
            </h2>
            <p className="menu-modal-sub">
              {mode === "edit" ? "اطلاعات محصول را به‌روز کنید" : "محصول جدید به این دسته اضافه کنید"}
            </p>
          </div>
          <button type="button" className="menu-modal-close" onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </header>

        <form className="menu-form" onSubmit={handleSubmit}>
          <div className="menu-form-grid">
            <label className="menu-form-field">
              <span>نام فارسی *</span>
              <input
                type="text"
                value={form.nameFA}
                onChange={(e) => setField("nameFA", e.target.value)}
                placeholder="مثلاً پپرونی فیست"
              />
            </label>

            <label className="menu-form-field">
              <span>نام انگلیسی</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Pepperoni Feast"
                dir="ltr"
              />
            </label>

            <label className="menu-form-field menu-form-field--full">
              <span>توضیحات</span>
              <textarea
                rows={3}
                value={form.desc}
                onChange={(e) => setField("desc", e.target.value)}
                placeholder="توضیح کوتاه برای نمایش در منو"
              />
            </label>

            <label className="menu-form-field">
              <span>قیمت (تومان) *</span>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="۶۵۰,۰۰۰"
              />
            </label>

            <label className="menu-form-field">
              <span>تخفیف (درصد)</span>
              <input
                type="number"
                min={0}
                max={99}
                value={form.discount ?? 0}
                onChange={(e) =>
                  setField("discount", Math.min(99, Math.max(0, Number(e.target.value) || 0)))
                }
                placeholder="مثلاً ۱۰"
              />
              {Number(form.discount) > 0 && form.price && (
                <small className="menu-form-discount-preview">
                  قیمت با تخفیف: {getItemPricing(form).finalLabel} تومان
                </small>
              )}
            </label>

            <label className="menu-form-field">
              <span>زمان آماده‌سازی (دقیقه)</span>
              <input
                type="number"
                min={1}
                max={180}
                value={form.prepTime}
                onChange={(e) => setField("prepTime", Number(e.target.value) || 1)}
              />
            </label>

            <label className="menu-form-field menu-form-field--full">
              <span>تصویر محصول</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>فقط فایل تصویری - حداکثر ۵ مگابایت</small>
            </label>
          </div>

          {imagePreview && (
            <div className="menu-form-preview">
              <img src={imagePreview} alt={form.nameFA || "پیش‌نمایش"} />
            </div>
          )}

          <div className="menu-form-toggles">
            <label className="menu-form-check">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setField("available", e.target.checked)}
              />
              <span>موجود در منو</span>
            </label>

            <label className="menu-form-check">
              <input
                type="checkbox"
                checked={form.featuredPopular}
                onChange={(e) => setField("featuredPopular", e.target.checked)}
              />
              <span>نمایش در «غذاهای پرطرفدار» صفحه اصلی</span>
            </label>

            <label className="menu-form-check">
              <input
                type="checkbox"
                checked={Number(form.discount) > 0}
                onChange={(e) =>
                  setField(
                    "discount",
                    e.target.checked ? (Number(form.discount) > 0 ? form.discount : 10) : 0
                  )
                }
              />
              <span>نمایش در بخش «تخفیف‌ها»{Number(form.discount) > 0 ? ` (${form.discount}٪)` : ""}</span>
            </label>

            <label className="menu-form-check">
              <input
                type="checkbox"
                checked={form.featuredFloravan}
                onChange={(e) => setField("featuredFloravan", e.target.checked)}
              />
              <span>نمایش در «به پیشنهاد فلوروان»</span>
            </label>
          </div>

          <OptionGroupsEditor
            groups={form.optionGroups}
            onChange={(optionGroups) => setField("optionGroups", optionGroups)}
          />

          {error && <p className="menu-form-error">{error}</p>}

          <footer className="menu-modal-foot">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                className="menu-btn menu-btn--danger"
                onClick={() => onDelete(form.id)}
              >
                حذف محصول
              </button>
            )}
            <div className="menu-modal-foot-actions">
              <button type="button" className="menu-btn menu-btn--ghost" onClick={onClose}>
                انصراف
              </button>
              <button type="submit" className="menu-btn menu-btn--primary">
                {mode === "edit" ? "ذخیره تغییرات" : "افزودن محصول"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
