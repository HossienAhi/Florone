import { useState, useCallback } from 'react';
import { faNum } from '../../data/tableLayout';
import {
  isCustomPizzaItem,
  getVisibleOptions,
  parseCustomPizzaDetails,
  buildKitchenTicketText,
} from '../utils/kitchenTicket';
import './OrderReceiptItem.css';

function priceLabel(price) {
  if (price == null) return '—';
  if (typeof price === 'number') return `${price.toLocaleString('fa-IR')} تومان`;
  return String(price).includes('تومان') ? price : `${price} تومان`;
}

function buildCustomPreview(details) {
  if (!details) return '';
  const parts = [];
  if (details.shape) parts.push(details.shape);
  if (details.size) parts.push(details.size);
  if (details.toppings.length > 0) {
    parts.push(details.toppings.slice(0, 5).join(' · '));
    if (details.toppings.length > 5) parts.push('…');
  }
  return parts.join(' · ');
}

export default function OrderReceiptItem({ item, tableId }) {
  const isCustom = isCustomPizzaItem(item);
  const [open, setOpen] = useState(isCustom);
  const [copied, setCopied] = useState(false);
  const visibleOpts = getVisibleOptions(item);
  const hasDetails = isCustom || visibleOpts.length > 0;
  const pizzaDetails = isCustom ? parseCustomPizzaDetails(item) : null;
  const customPreview = isCustom ? buildCustomPreview(pizzaDetails) : '';

  const handleCopy = useCallback(async () => {
    const text = buildKitchenTicketText(item, { tableId });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [item, tableId]);

  return (
    <li className={`td-receipt-item ${isCustom ? 'is-custom-pizza' : ''}`}>
      <div className="td-receipt-item-main">
        <div className="td-receipt-item-name">
          {isCustom && <span className="td-receipt-pizza-icon" aria-hidden="true">🍕</span>}
          <span>{item.name}</span>
        </div>
        <span className="td-receipt-qty">×{faNum(item.qty ?? 1)}</span>
        <span className="td-receipt-price">{priceLabel(item.lineTotal ?? item.price)}</span>
      </div>

      {isCustom && customPreview && !open && (
        <p className="td-receipt-opts-preview">{customPreview}</p>
      )}

      {!isCustom && visibleOpts.length > 0 && !open && (
        <p className="td-receipt-opts-preview">
          {visibleOpts.map((o) => o.label).join(' · ')}
        </p>
      )}

      {hasDetails && (
        <div className="td-kitchen-drawer">
          <button
            type="button"
            className={`td-kitchen-drawer-toggle ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span>{isCustom ? 'جزئیات آشپزخانه — پیتزا سفارشی' : 'جزئیات سفارش'}</span>
            <span className="td-kitchen-chevron" aria-hidden="true">⌃</span>
          </button>

          <div className={`td-kitchen-drawer-panel ${open ? 'is-open' : ''}`}>
            {isCustom && pizzaDetails && (
              <div className="td-kitchen-ticket">
                <div className="td-kitchen-ticket-head">
                  <span className="td-kitchen-ticket-label">برگه آشپزخانه</span>
                  <span className="td-kitchen-ticket-badge">سفارشی</span>
                </div>

                <dl className="td-kitchen-specs">
                  {pizzaDetails.dough && (
                    <>
                      <dt>خمیر</dt>
                      <dd>{pizzaDetails.dough}</dd>
                    </>
                  )}
                  {pizzaDetails.shape && (
                    <>
                      <dt>شکل</dt>
                      <dd>{pizzaDetails.shape}</dd>
                    </>
                  )}
                  {pizzaDetails.size && (
                    <>
                      <dt>سایز</dt>
                      <dd>{pizzaDetails.size}</dd>
                    </>
                  )}
                </dl>

                {pizzaDetails.groups.length > 0 && (
                  <div className="td-kitchen-groups">
                    <p className="td-kitchen-toppings-title">
                      ترکیب پیتزا ({faNum(pizzaDetails.toppingCount)} المان)
                    </p>
                    {pizzaDetails.groups.map(({ group, items }) => (
                      <div key={group} className="td-kitchen-group">
                        <span className="td-kitchen-group-label">{group}</span>
                        <ul>
                          {items.map((label) => (
                            <li key={`${group}-${label}`}>{label}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {pizzaDetails.groups.length === 0 && pizzaDetails.toppingCount === 0 && (
                  <p className="td-kitchen-empty-hint">جزئیات تاپینگ در سفارش ثبت نشده</p>
                )}
              </div>
            )}

            {!isCustom && visibleOpts.length > 0 && (
              <ul className="td-kitchen-opts-list">
                {visibleOpts.map((o, i) => (
                  <li key={`${o.group}-${o.label}-${i}`}>
                    <span className="td-kitchen-opt-group">{o.group}</span>
                    <span>{o.label}</span>
                  </li>
                ))}
              </ul>
            )}

            <button type="button" className="td-kitchen-copy-btn" onClick={handleCopy}>
              {copied ? '✓ کپی شد — بفرست برای آشپزخانه' : '📋 کپی متن برای آشپزخانه'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
