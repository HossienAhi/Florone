import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formatToman, parsePrice, toFa } from '../../data/price';
import {
  TOPPING_GROUP_LABELS,
  TOPPING_GROUP_ORDER,
  PIZZA_BUILDER_CONFIG,
  formatToppingsForApi,
  normalizeToppingGroup,
} from '../../data/customPizzaData';
import { authHeaders } from '../../utils/cashierAuth';
import { CUSTOM_PIZZA_CONFIG_STORAGE_KEY } from '../../context/CustomPizzaContext';
import CpToast from '../../components/customPizza/CpToast';
import './CustomPizzaAdminEditor.css';

const API_BASE = 'http://localhost:5000';

function numInput(value) {
  return parsePrice(value);
}

function PriceInput({ value, onChange, compact }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const display = focused
    ? draft
    : (value ? formatToman(value) : '');

  return (
    <input
      type="text"
      inputMode="numeric"
      className={compact ? 'cp-admin-price-input cp-admin-price-input--compact' : 'cp-admin-price-input'}
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(value ? String(value) : '');
      }}
      onBlur={() => {
        setFocused(false);
        setDraft('');
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        onChange(numInput(raw));
      }}
    />
  );
}

export default function CustomPizzaAdminEditor({ onBack }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [settings, setSettings] = useState({
    basePriceMedium: 550_000,
    basePriceFamily: 780_000,
    familyToppingMultiplier: 1.3,
    minToppings: 3,
    maxToppings: 7,
  });
  const [toppings, setToppings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/custom-pizza/config`);
        if (!res.ok) throw new Error('load failed');
        const data = await res.json();
        if (cancelled) return;
        setSettings({
          basePriceMedium: data.settings.basePriceMedium ?? PIZZA_BUILDER_CONFIG.basePrices.medium,
          basePriceFamily: data.settings.basePriceFamily ?? PIZZA_BUILDER_CONFIG.basePrices.family,
          familyToppingMultiplier: data.settings.familyToppingMultiplier ?? PIZZA_BUILDER_CONFIG.familyToppingMultiplier,
          minToppings: data.settings.minToppings ?? PIZZA_BUILDER_CONFIG.minToppings,
          maxToppings: data.settings.maxToppings ?? PIZZA_BUILDER_CONFIG.maxToppings,
        });
        setToppings(formatToppingsForApi(
          data.toppings ?? [],
          data.settings.familyToppingMultiplier ?? PIZZA_BUILDER_CONFIG.familyToppingMultiplier
        ));
      } catch {
        if (!cancelled) setError('بارگذاری تنظیمات ناموفق بود');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const groups = Object.fromEntries(TOPPING_GROUP_ORDER.map((k) => [k, []]));
    toppings.forEach((t) => {
      const key = normalizeToppingGroup(t.group);
      const bucket = TOPPING_GROUP_ORDER.includes(key) ? key : 'vegetable';
      groups[bucket].push({ ...t, group: key });
    });
    return groups;
  }, [toppings]);

  const updateTopping = useCallback((id, patch) => {
    setToppings((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/custom-pizza/config`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ settings, toppings }),
      });
      if (res.status === 401) {
        setError('نشست شما منقضی شده — از پنل خارج شوید و دوباره وارد شوید');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `ذخیره ناموفق بود (خطای ${res.status})`);
        return;
      }
      const data = await res.json();
      setSettings({
        basePriceMedium: data.settings.basePriceMedium,
        basePriceFamily: data.settings.basePriceFamily,
        familyToppingMultiplier: data.settings.familyToppingMultiplier,
        minToppings: data.settings.minToppings ?? PIZZA_BUILDER_CONFIG.minToppings,
        maxToppings: data.settings.maxToppings ?? PIZZA_BUILDER_CONFIG.maxToppings,
      });
      setToppings(formatToppingsForApi(
        data.toppings ?? [],
        data.settings.familyToppingMultiplier
      ));
      localStorage.setItem(CUSTOM_PIZZA_CONFIG_STORAGE_KEY, JSON.stringify(data));
      queryClient.setQueryData(['custom-pizza-config'], data);
      setToastMsg('تنظیمات پیتزا سفارشی ذخیره شد');
      setShowToast(true);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('اتصال به سرور برقرار نشد — مطمئن شوید backend روی پورت 5000 در حال اجراست');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-section cp-admin">
        <p className="cp-admin-loading">در حال بارگذاری...</p>
      </section>
    );
  }

  const mult = Number(settings.familyToppingMultiplier) || 1.3;

  return (
    <section className="admin-section cp-admin">
      <div className="cp-admin-head">
        <button type="button" className="menu-btn menu-btn--ghost" onClick={onBack}>
          → بازگشت
        </button>
        <div>
          <h2 className="menu-cat-editor-title">پیتزا سفارشی — قیمت‌گذاری</h2>
          <p className="menu-cat-editor-sub">قیمت پایه، ضریب خانواده و موجودی المان‌ها</p>
        </div>
      </div>

      {error && <p className="cp-admin-error">{error}</p>}

      <CpToast
        message={toastMsg}
        visible={showToast}
        onHide={() => {
          setShowToast(false);
          setSaved(false);
        }}
      />

      <div className="admin-card cp-admin-card cp-admin-dough-card">
        <h3 className="admin-card-title">خمیر</h3>
        <p className="cp-admin-hint cp-admin-hint--tight">نوع خمیر ثابت است و در سفارش مشتری قابل تغییر نیست.</p>
      </div>

      <div className="cp-admin-grid">
        <div className="admin-card cp-admin-card">
          <h3 className="admin-card-title">قیمت پایه (خمیر + پنیر پایه)</h3>
          <div className="cp-admin-fields">
            <label className="cp-admin-field">
              <span>متوسط (تومان)</span>
              <PriceInput
                value={settings.basePriceMedium}
                onChange={(n) => {
                  setSettings((s) => ({ ...s, basePriceMedium: n }));
                  setSaved(false);
                }}
              />
            </label>
            <label className="cp-admin-field">
              <span>خانواده (تومان)</span>
              <PriceInput
                value={settings.basePriceFamily}
                onChange={(n) => {
                  setSettings((s) => ({ ...s, basePriceFamily: n }));
                  setSaved(false);
                }}
              />
            </label>
          </div>
        </div>

        <div className="admin-card cp-admin-card">
          <h3 className="admin-card-title">ضریب قیمت المان — سایز خانواده</h3>
          <p className="cp-admin-hint">
            قیمت خانواده = قیمت متوسط × ضریب. مثلاً ۳۰۰ → {toFa(Math.round(300 * mult))}
          </p>
          <label className="cp-admin-field cp-admin-field--inline">
            <span>ضریب</span>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={settings.familyToppingMultiplier}
              onChange={(e) => {
                setSettings((s) => ({
                  ...s,
                  familyToppingMultiplier: Number(e.target.value) || 1.3,
                }));
                setSaved(false);
              }}
            />
          </label>
        </div>
        <div className="admin-card cp-admin-card">
          <h3 className="admin-card-title">محدودیت تعداد تاپینگ</h3>
          <p className="cp-admin-hint">حداقل و حداکثر تاپینگ قابل انتخاب توسط مشتری</p>
          <div className="cp-admin-fields">
            <label className="cp-admin-field cp-admin-field--inline">
              <span>حداقل</span>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.minToppings}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    minToppings: Number(e.target.value) || PIZZA_BUILDER_CONFIG.minToppings,
                  }));
                  setSaved(false);
                }}
              />
            </label>
            <label className="cp-admin-field cp-admin-field--inline">
              <span>حداکثر</span>
              <input
                type="number"
                min="1"
                max="12"
                value={settings.maxToppings}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    maxToppings: Number(e.target.value) || PIZZA_BUILDER_CONFIG.maxToppings,
                  }));
                  setSaved(false);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {TOPPING_GROUP_ORDER.map((groupKey) => (
        <div key={groupKey} className="admin-card cp-admin-card cp-admin-toppings-card">
          <h3 className="admin-card-title">{TOPPING_GROUP_LABELS[groupKey]}</h3>
          <div className="cp-admin-topping-list">
            {grouped[groupKey].map((t) => {
              const familyPrice = Math.round((t.priceMedium || 0) * mult);
              return (
                <article
                  key={t.id}
                  className={`cp-admin-topping ${t.available ? '' : 'is-unavailable'}`}
                >
                  <div className="cp-admin-topping-main">
                    <span className="cp-admin-topping-emoji" aria-hidden="true">{t.emoji}</span>
                    <span className="cp-admin-topping-name">{t.name}</span>
                  </div>
                  <label className="cp-admin-field cp-admin-field--compact">
                    <span>متوسط</span>
                    <PriceInput
                      compact
                      value={t.priceMedium}
                      onChange={(n) => updateTopping(t.id, { priceMedium: n })}
                    />
                  </label>
                  <div className="cp-admin-family-preview">
                    <span className="cp-admin-family-label">خانواده</span>
                    <strong>{formatToman(familyPrice)}</strong>
                  </div>
                  <label className="cp-admin-toggle">
                    <input
                      type="checkbox"
                      checked={t.available}
                      onChange={(e) => updateTopping(t.id, { available: e.target.checked })}
                    />
                    <span>{t.available ? 'موجود' : 'ناموجود'}</span>
                  </label>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      <div className="cp-admin-foot">
        <button
          type="button"
          className="cp-admin-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات پیتزا سفارشی'}
        </button>
      </div>
    </section>
  );
}
