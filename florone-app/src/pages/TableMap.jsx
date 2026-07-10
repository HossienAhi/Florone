import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import RestaurantMap from "../components/RestaurantMap";
import "../components/RestaurantMap.css";
import { WhiteLogo, OrangeLogo } from "../components/FloravanLogo";
import { TABLE_LAYOUT, CUSTOMER_COLORS, faNum } from "../data/tableLayout";
import { parsePrice, formatToman } from "../data/price";
import "./TableMap.css";

const API_BASE = "http://localhost:5000";
const MIN_LOADING_MS = 2000;

// Map the live /api/orders payload to a per-table status keyed by layout key.
// Supports both backends (keyed by table code or numeric id).
function deriveStatusByKey(data) {
  const byKey = {};
  for (const [rawKey, entry] of Object.entries(data ?? {})) {
    let layout = TABLE_LAYOUT.find((t) => t.key === rawKey);
    if (!layout) {
      const idNum = entry?.tableId ?? Number(rawKey);
      layout = TABLE_LAYOUT.find((t) => String(t.id) === String(idNum));
    }
    if (!layout) continue;
    const orders = entry?.orders ?? [];
    if (orders.length === 0) continue;
    const hasUnread = orders.some((o) => !o.acknowledged);
    byKey[layout.key] = hasUnread ? "reserved" : "full";
  }
  return byKey;
}

export default function TableMap({ items, item, onComplete }) {
  /* accept either a full cart (`items`) or a single legacy `item` */
  const cart = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    if (item) {
      return [{
        id: item.id,
        name: item.nameFA || item.name,
        qty: 1,
        unitPrice: parsePrice(item.price),
        lineTotal: parsePrice(item.price),
      }];
    }
    return [];
  }, [items, item]);

  const cartTotal = useMemo(
    () => cart.reduce((s, e) => s + (e.lineTotal ?? parsePrice(e.unitPrice) * (e.qty || 1)), 0),
    [cart]
  );
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const [waitStage, setWaitStage] = useState("loading"); // "loading" | "success"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const statusQuery = useQuery({
    queryKey: ["customer-table-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (!res.ok) throw new Error("status fetch failed");
      return res.json();
    },
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const statusByKey = useMemo(
    () => deriveStatusByKey(statusQuery.data),
    [statusQuery.data]
  );

  const tables = useMemo(
    () =>
      TABLE_LAYOUT.map((t) => ({
        ...t,
        status: statusByKey[t.key] ?? "free",
      })),
    [statusByKey]
  );

  const selectedTable = tables.find((t) => t.key === selected) || null;

  const getTableColors = useCallback((table, isSel) => {
    if (isSel) return CUSTOMER_COLORS.selected;
    return CUSTOMER_COLORS[table.status] ?? CUSTOMER_COLORS.free;
  }, []);

  const handleSelect = (table) => {
    if (table.status !== "free" || confirmed) return;
    setSelected(table.key === selected ? null : table.key);
  };

  const handleConfirm = async () => {
    if (!selectedTable) return;
    if (cart.length === 0) {
      setError("فاکتور خالی است. لطفاً دوباره از منو انتخاب کنید.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setWaitStage("loading");
    setShowWaiting(true);

    const startedAt = Date.now();

    const orderItems = cart.map((entry) => ({
      id: entry.id,
      name: entry.name,
      type: entry.type,
      qty: entry.qty || 1,
      price: entry.unitPrice ?? entry.lineTotal,
      unitPrice: entry.unitPrice ?? entry.lineTotal,
      lineTotal: entry.lineTotal ?? entry.unitPrice,
      expectedTotal: entry.expectedTotal ?? entry.lineTotal ?? entry.unitPrice,
      isCustomPizza: entry.isCustomPizza ?? entry.id === 'custom-pizza',
      buildId: entry.buildId,
      sizeCode: entry.sizeCode,
      shapeCode: entry.shapeCode,
      toppingCodes: entry.toppingCodes,
      options: entry.options || [],
    }));

    const buildIds = orderItems
      .filter((item) => item.isCustomPizza && item.buildId)
      .map((item) => item.buildId)
      .sort();
    const idempotencyKey = buildIds.length > 0 ? `cp-${buildIds.join('--')}` : undefined;

    const finishSuccess = () => {
      const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - startedAt));
      window.setTimeout(() => {
        setConfirmed(true);
        setWaitStage("success");
        setIsSubmitting(false);
      }, wait);
    };

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: JSON.stringify({
          tableId: selectedTable.id,
          tableKey: selectedTable.key,
          items: orderItems,
          totalPrice: cartTotal,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === 'PRICE_CHANGED') {
          throw new Error('قیمت منو تغییر کرده. لطفاً به منو برگردید و دوباره انتخاب کنید.');
        }
        throw new Error(data.error || "ثبت سفارش انجام نشد.");
      }

      finishSuccess();
    } catch (err) {
      setError(err.message || "خطا در ارتباط با صندوق‌دار.");
      setShowWaiting(false);
      setIsSubmitting(false);
    }
  };

  const handleFinishSuccess = () => {
    setShowWaiting(false);
    setConfirmed(false);
    setSelected(null);
    onComplete?.();
  };

  const handleCloseWaiting = () => {
    if (waitStage === "loading") return; // don't allow closing mid-submit
    handleFinishSuccess();
  };

  const handleReset = () => {
    setConfirmed(false);
    setSelected(null);
  };

  return (
    <div className="tm-wrap">
      <div className="tm-header">
        <h2 className="tm-title">انتخاب میز</h2>
        {cart.length > 0 && (
          <p className="tm-invoice-summary">
            {faNum(cart.reduce((s, e) => s + (e.qty || 1), 0))} آیتم · {formatToman(cartTotal)} تومان
          </p>
        )}
        <div className="tm-legend">
          <span><i className="dot free" /> خالی</span>
          <span><i className="dot reserved" /> رزرو شده</span>
          <span><i className="dot full" /> پر</span>
          <span><i className="dot selected" /> انتخاب شما</span>
        </div>
      </div>

      <div className="tm-map-outer">
        <RestaurantMap
          tables={tables}
          getTableColors={getTableColors}
          selectedKey={selected}
          onTableClick={handleSelect}
          isTableClickable={(t) => t.status === "free" && !confirmed}
          variant="dark"
        />
      </div>

      <div className="tm-info">
        {!selectedTable && !confirmed && (
          <p className="tm-hint">یک میز آزاد را از روی نقشه انتخاب کنید.</p>
        )}

        {selectedTable && !confirmed && (
          <div className="tm-info-body">
            <div className="tm-info-text">
              <span className="tm-info-table">میز {faNum(selectedTable.id)}</span>
              <span className="tm-info-cap">
                ظرفیت {faNum(selectedTable.cap)} نفر · آزاد
              </span>
            </div>
            <button
              className="tm-confirm-btn"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت سفارش روی این میز"}
            </button>
          </div>
        )}

        {error && <p className="tm-hint">{error}</p>}

        {confirmed && selectedTable && (
          <div className="tm-confirmed">
            <div className="tm-check">✓</div>
            <p>
              سفارش شما روی <b>میز {faNum(selectedTable.id)}</b> ثبت شد.
            </p>
            <button className="tm-reset-btn" onClick={handleReset}>
              انتخاب میز دیگر
            </button>
          </div>
        )}
      </div>

      {/* ── Waiting / Success Overlay ── */}
      {showWaiting && (
        <div className="tm-waiting-overlay" onClick={handleCloseWaiting}>
          <div className="tm-waiting-box" onClick={(e) => e.stopPropagation()}>
            {waitStage === "loading" ? (
              <>
                <div className="tm-waiting-spinner" />
                <h3 className="tm-waiting-title">در حال ثبت سفارش شما</h3>
                <p className="tm-waiting-text">
                  لطفاً کمی صبر کنید...
                </p>
              </>
            ) : (
              <>
                <div className="tm-success-logo">
                  <WhiteLogo className="tm-success-logo-svg white" />
                  <OrangeLogo className="tm-success-logo-svg orange" />
                </div>
                <div className="tm-success-badge">✓</div>
                <h3 className="tm-waiting-title">سفارش شما با موفقیت ثبت شد</h3>
                {selectedTable && (
                  <p className="tm-success-table">
                    میز {faNum(selectedTable.id)} · {formatToman(cartTotal)} تومان
                  </p>
                )}
                <p className="tm-waiting-text">
                  از اینکه <b>فلوروان</b> را انتخاب کردید، از شما سپاسگزاریم.
                </p>
                <button className="tm-success-btn" onClick={handleFinishSuccess}>
                  بازگشت به منو
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
