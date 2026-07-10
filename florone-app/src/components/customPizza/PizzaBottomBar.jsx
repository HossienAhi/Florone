import { formatToman, toFa } from '../../data/price';
import { summarizeCustomPizzaItem } from '../../data/customPizzaData';
import { useAnimatedPrice } from './useAnimatedPrice';

export default function PizzaBottomBar({
  totalPrice,
  toppingCount,
  queuedPizzas = [],
  onRemoveQueued,
  minToppings = 3,
  maxToppings = 7,
  canSubmit,
  onSubmit,
  onBuildAnother,
  isOvenRunning,
}) {
  const animatedPrice = useAnimatedPrice(totalPrice);

  const ovenLabel = canSubmit
    ? 'بفرست تو تنور 🔥'
    : `حداقل ${toFa(minToppings)} تاپینگ`;

  return (
    <div className="cp-bottom-bar">
      <div className="cp-bottom-bar-inner">
        {queuedPizzas.length > 0 && (
          <div className="cp-queue-list" role="list" aria-label="پیتزاهای آماده در صف">
            <div className="cp-queue-list-head">
              {toFa(queuedPizzas.length)} پیتزا در صف فاکتور
            </div>
            {queuedPizzas.map((item, index) => {
              const summary = summarizeCustomPizzaItem(item);
              return (
                <div className="cp-queue-item" key={item.buildId ?? index} role="listitem">
                  <button
                    type="button"
                    className="cp-queue-remove"
                    onClick={() => onRemoveQueued?.(item.buildId)}
                    disabled={isOvenRunning}
                    aria-label={`حذف پیتزای ${toFa(index + 1)} از صف`}
                  >
                    ✕
                  </button>
                  <div className="cp-queue-item-body">
                    <span className="cp-queue-item-title">
                      پیتزای سفارشی {toFa(index + 1)}
                    </span>
                    <span className="cp-queue-item-meta">
                      {summary.label}
                      {summary.toppingCount > 0 && (
                        <> · {toFa(summary.toppingCount)} تاپینگ</>
                      )}
                    </span>
                  </div>
                  <span className="cp-queue-item-price">
                    {formatToman(item.lineTotal ?? item.unitPrice)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="cp-bottom-row">
          <div className="cp-bottom-counter-pill">
            {toFa(toppingCount)} از {toFa(maxToppings)}
          </div>
          <div className="cp-bottom-price">
            <span className="cp-bottom-price-label">قیمت این پیتزا</span>
            <span className="cp-bottom-price-value">
              {formatToman(animatedPrice)} <small>تومان</small>
            </span>
          </div>
        </div>

        <div className="cp-bottom-actions">
          <button
            type="button"
            className="cp-submit-btn cp-submit-btn--primary"
            disabled={!canSubmit || isOvenRunning}
            onClick={onSubmit}
          >
            {ovenLabel}
          </button>
          <button
            type="button"
            className="cp-submit-btn cp-submit-btn--secondary"
            disabled={!canSubmit || isOvenRunning}
            onClick={onBuildAnother}
          >
            + یکی دیگه بساز
          </button>
        </div>
      </div>
    </div>
  );
}
