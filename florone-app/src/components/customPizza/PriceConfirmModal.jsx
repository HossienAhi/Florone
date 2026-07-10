import { formatToman } from '../../data/price';
import '../../pages/ProductDialog.css';

export default function PriceConfirmModal({
  open,
  oldPrice,
  newPrice,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="dialog-box cp-price-modal"
        role="dialog"
        aria-labelledby="cp-price-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="cp-price-modal-close" onClick={onCancel} aria-label="بستن">
          ✕
        </button>
        <h2 id="cp-price-modal-title" className="cp-price-modal-title">
          قیمت به‌روز شد
        </h2>
        <p className="cp-price-modal-sub">قیمت به‌روز شد — تأیید می‌کنی؟</p>
        <div className="cp-price-modal-prices">
          <div className="cp-price-modal-row cp-price-modal-row--old">
            <span>قیمت قبلی</span>
            <span>{formatToman(oldPrice)} تومان</span>
          </div>
          <div className="cp-price-modal-row cp-price-modal-row--new">
            <span>قیمت جدید</span>
            <span>{formatToman(newPrice)} تومان</span>
          </div>
        </div>
        <div className="cp-price-modal-actions">
          <button type="button" className="cp-price-modal-btn cp-price-modal-btn--ghost" onClick={onCancel}>
            انصراف
          </button>
          <button type="button" className="cp-price-modal-btn cp-price-modal-btn--primary" onClick={onConfirm}>
            تأیید و ادامه
          </button>
        </div>
      </div>
    </div>
  );
}
