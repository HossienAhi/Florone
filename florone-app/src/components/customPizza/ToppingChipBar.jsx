import { useRef } from 'react';
import { formatToman } from '../../data/price';
import {
  TOPPING_GROUP_LABELS,
  TOPPING_GROUP_ORDER,
  getToppingPrice,
} from '../../data/customPizzaData';
import ToppingVisual from './ToppingVisual';

export default function ToppingChipBar({
  size,
  toppings = [],
  settings,
  selectedIds,
  onToggle,
  maxReached,
  chipRefs,
}) {
  const barRef = useRef(null);

  const handleToggle = (topping, el) => {
    if (!topping.available) return;
    if (!selectedIds.has(topping.id) && maxReached) {
      navigator.vibrate?.(12);
      return;
    }
    chipRefs.current[topping.id] = el;
    onToggle(topping);
  };

  return (
    <div className="cp-toppings-bar" ref={barRef}>
      <div className="cp-dough-note">
        <span className="cp-dough-note-label">خمیر</span>
        <span className="cp-dough-note-value">نوع ثابت</span>
      </div>

      {TOPPING_GROUP_ORDER.map((group) => {
        const items = toppings.filter((t) => t.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="cp-topping-group">
            <span className="cp-topping-group-label">{TOPPING_GROUP_LABELS[group]}</span>
            <div className="cp-topping-carousel">
              {items.map((topping) => {
                const selected = selectedIds.has(topping.id);
                const unavailable = !topping.available;
                const dimmed = maxReached && !selected && topping.available;
                const displayPrice = getToppingPrice(topping, size, settings);
                const showPrice = displayPrice > 0;

                return (
                  <button
                    key={topping.id}
                    type="button"
                    ref={(el) => { chipRefs.current[topping.id] = el; }}
                    className={[
                      'cp-topping-card',
                      selected && 'is-selected',
                      unavailable && 'is-unavailable',
                      dimmed && 'is-dimmed',
                    ].filter(Boolean).join(' ')}
                    onClick={(e) => handleToggle(topping, e.currentTarget)}
                    disabled={unavailable}
                    aria-pressed={selected}
                    aria-label={`${topping.name}${showPrice ? ` — ${formatToman(displayPrice)} تومان` : ''}`}
                  >
                    {selected && (
                      <span className="cp-topping-card-check" aria-hidden="true">✓</span>
                    )}
                    <ToppingVisual
                      topping={topping}
                      imgClassName="cp-topping-card-icon"
                      emojiClassName="cp-topping-card-emoji"
                    />
                    <span className="cp-topping-card-name">{topping.name}</span>
                    {unavailable ? (
                      <span className="cp-topping-card-badge">ناموجود</span>
                    ) : showPrice ? (
                      <span className="cp-topping-card-price">{formatToman(displayPrice)} تومان</span>
                    ) : (
                      <span className="cp-topping-card-price cp-topping-card-price--included">شامل</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
