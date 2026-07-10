import { useEffect, useRef, useState, useMemo } from 'react';
import './ProductDialog.css';
import { parsePrice, formatToman, toFa, getItemPricing } from '../data/price';

/* ── one product "page" inside the gallery ── */
function DialogSlide({ item, active, onAdd }) {
  const [qty, setQty] = useState(1);

  const groups = Array.isArray(item.optionGroups) ? item.optionGroups : [];

  const [multi, setMulti] = useState({});   // { groupId: { choiceId: true } }
  const [single, setSingle] = useState({}); // { groupId: choiceId }

  useEffect(() => {
    const s = {};
    groups.forEach((g) => {
      if (g.type === 'single' && g.choices?.length) {
        s[g.id] = g.choices[0].id;
      }
    });
    setSingle(s);
    setMulti({});
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const pricing = getItemPricing(item);

  const { unitPrice, chosenOptions } = useMemo(() => {
    let delta = 0;
    const chosen = [];
    groups.forEach((g) => {
      if (g.type === 'multiple') {
        g.choices?.forEach((c) => {
          if (multi[g.id]?.[c.id]) {
            delta += parsePrice(c.priceDelta);
            chosen.push({ group: g.name, label: c.label });
          }
        });
      } else {
        const cid = single[g.id];
        const c = g.choices?.find((x) => x.id === cid);
        if (c) {
          delta += parsePrice(c.priceDelta);
          chosen.push({ group: g.name, label: c.label });
        }
      }
    });
    return { unitPrice: pricing.final + delta, chosenOptions: chosen };
  }, [groups, multi, single, pricing.final]);

  const total = unitPrice * qty;
  /* original unit total (before discount) for strike-through display */
  const originalUnit = pricing.original + (unitPrice - pricing.final);
  const originalTotal = originalUnit * qty;

  const toggleMulti = (gid, cid) =>
    setMulti((prev) => ({
      ...prev,
      [gid]: { ...prev[gid], [cid]: !prev[gid]?.[cid] },
    }));

  const handleAdd = () => {
    onAdd({
      id: item.id,
      name: item.nameFA || item.name,
      image: item.image,
      qty,
      unitPrice,
      lineTotal: total,
      options: chosenOptions,
    });
  };

  const multiGroups = groups.filter((g) => g.type === 'multiple');
  const singleGroups = groups.filter((g) => g.type === 'single');

  return (
    <div className={`pd-slide ${active ? 'is-active' : 'is-side'}`}>
      {/* image card */}
      <div className="pd-media">
        <img src={item.image} alt={item.nameFA} className="pd-media-img" />
        <div className="pd-media-fade" />
        {pricing.hasDiscount && (
          <span className="pd-disc-badge">{toFa(pricing.discount)}٪ تخفیف</span>
        )}
      </div>

      {/* details panel */}
      <div className="pd-panel">
        <h2 className="pd-name">{item.nameFA}</h2>
        {item.desc && <p className="pd-desc">{item.desc}</p>}

        {multiGroups.map((g) => (
          <div className="pd-group" key={g.id}>
            <span className="pd-divider" />
            <h3 className="pd-group-title">{g.name}</h3>
            {g.choices?.map((c) => {
              const on = Boolean(multi[g.id]?.[c.id]);
              const extra = parsePrice(c.priceDelta);
              return (
                <button
                  type="button"
                  key={c.id}
                  className={`pd-check-row ${on ? 'is-on' : ''}`}
                  onClick={() => toggleMulti(g.id, c.id)}
                >
                  <span className={`pd-check ${on ? 'is-on' : ''}`}>
                    {on && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="pd-check-label">
                    {c.label}
                    {extra > 0 && <span className="pd-check-extra"> (+{formatToman(extra)})</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {singleGroups.map((g) => (
          <div className="pd-group" key={g.id}>
            <h3 className="pd-group-title">{g.name}</h3>
            <div className="pd-select-wrap">
              <svg className="pd-select-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
              <select
                className="pd-select"
                value={single[g.id] ?? ''}
                onChange={(e) => setSingle((p) => ({ ...p, [g.id]: e.target.value }))}
              >
                {g.choices?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {parsePrice(c.priceDelta) > 0 ? ` (+${formatToman(parsePrice(c.priceDelta))})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* quantity */}
        <div className="pd-group">
          <span className="pd-divider" />
          <div className="pd-qty-row">
            <span className="pd-group-title pd-qty-label">تعداد</span>
            <div className="pd-stepper">
              <button type="button" className="pd-step" onClick={() => setQty((q) => q + 1)} aria-label="افزایش">+</button>
              <span className="pd-qty-value">{toFa(qty)}</span>
              <button type="button" className="pd-step" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="کاهش">−</button>
            </div>
          </div>
        </div>
      </div>

      {/* footer bar */}
      <div className="pd-footer">
        <div className="pd-price">
          {pricing.hasDiscount && (
            <span className="pd-price-old">{formatToman(originalTotal)}</span>
          )}
          <span className="pd-price-amount">{formatToman(total)}</span>
          <span className="pd-price-unit">تومان</span>
        </div>
        <button type="button" className="pd-add" onClick={handleAdd} aria-label="افزودن به فاکتور">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProductDialog({ items, index = 0, onAdd, onClose }) {
  const list = Array.isArray(items) ? items : [];
  const trackRef = useRef(null);
  const slotRefs = useRef([]);
  const rafId = useRef(0);
  const [active, setActive] = useState(index);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // center the tapped item on mount
  useEffect(() => {
    const el = slotRefs.current[index];
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest' });
    setActive(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slotRefs.current.forEach((el, i) => {
        if (!el) return;
        const center = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      setActive(best);
    });
  };

  const goTo = (i) => {
    const el = slotRefs.current[i];
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  };

  if (list.length === 0) return null;

  return (
    <div className="pd-overlay" onClick={onClose}>
      <button className="pd-back" onClick={onClose} type="button">
        بازگشت <span aria-hidden="true">→</span>
      </button>

      <div
        className="pd-track"
        ref={trackRef}
        onScroll={handleScroll}
        onClick={(e) => e.stopPropagation()}
      >
        {list.map((it, i) => (
          <div
            className="pd-slot"
            key={`${it.id}-${i}`}
            ref={(el) => { slotRefs.current[i] = el; }}
            onClick={() => { if (i !== active) goTo(i); }}
          >
            <DialogSlide item={it} active={i === active} onAdd={onAdd} />
          </div>
        ))}
      </div>

      <div className="pd-dots">
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`pd-dot ${i === active ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`آیتم ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
