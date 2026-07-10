import { useState, useEffect, useCallback, useMemo } from "react";
import RestaurantMap from "../../components/RestaurantMap";
import "../../components/RestaurantMap.css";
import { CASHIER_COLORS, faNum } from "../../data/tableLayout";
import { formatToman, parsePrice } from "../../data/price";
import { useCashierSync } from "../../context/CashierSyncContext";
import OrderReceiptItem from "../components/OrderReceiptItem";
import "./TablesDashboard.css";

const STATUS_LABEL = {
  empty: "خالی",
  pending: "سفارش جدید",
  active: "سفارش فعال",
};

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  if (mins < 1) return "همین الان";
  if (mins < 60) return `${faNum(mins)} دقیقه پیش`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${faNum(hours)} ساعت پیش`;
  return `${faNum(hours)} ساعت و ${faNum(rem)} دقیقه پیش`;
}

function formatClock(ts) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function orderTotal(items) {
  return (items ?? []).reduce((sum, it) => {
    if (it.lineTotal != null) {
      return sum + (typeof it.lineTotal === "number" ? it.lineTotal : parsePrice(it.lineTotal));
    }
    const unit = typeof it.price === "number" ? it.price : parsePrice(it.price);
    return sum + unit * (it.qty ?? 1);
  }, 0);
}

function OrderCard({ order, tableId, onConfirm, onReject, now }) {
  const elapsed = formatElapsed(now - order.createdAt);
  const isConfirmed = order.status === "confirmed";
  const total = useMemo(() => orderTotal(order.items), [order.items]);

  return (
    <article className={`td-order td-receipt ${isConfirmed ? "is-acked" : "is-pending"}`}>
      <header className="td-order-head">
        <div>
          <span className="td-order-id">سفارش #{order.id.slice(-4)}</span>
          <time className="td-order-time" dateTime={new Date(order.createdAt).toISOString()}>
            {formatClock(order.createdAt)} · {elapsed}
          </time>
        </div>
        {isConfirmed && <span className="td-ack-badge">تأیید شده ✓</span>}
      </header>

      <div className="td-receipt-paper">
        <div className="td-receipt-paper-head">
          <span>فاکتور میز {faNum(tableId)}</span>
          <span className="td-receipt-item-count">{faNum(order.items.length)} قلم</span>
        </div>

        <ul className="td-order-items td-receipt-items">
          {order.items.map((item, i) => (
            <OrderReceiptItem key={i} item={item} tableId={tableId} />
          ))}
        </ul>

        <div className="td-receipt-total">
          <span>جمع فاکتور</span>
          <strong>{formatToman(total)} <small>تومان</small></strong>
        </div>
      </div>

      <div className="td-order-actions">
        {!isConfirmed && (
          <button
            type="button"
            className="td-confirm-btn"
            onClick={() => onConfirm(order.id)}
          >
            تایید سفارش
          </button>
        )}
        <button
          type="button"
          className="td-reject-btn"
          onClick={() => onReject(order.id)}
        >
          رد سفارش
        </button>
      </div>
    </article>
  );
}

function TableDialog({ table, tableState, onClose, onConfirm, onReject, onCloseTable, now }) {
  const orders = tableState?.orders ?? [];
  const pendingCount = orders.filter((o) => o.status !== "confirmed").length;
  const isEmpty = orders.length === 0;
  const [confirmClose, setConfirmClose] = useState(false);

  return (
    <div className="td-dialog-overlay" onClick={onClose}>
      <div className="td-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="td-dialog-head">
          <div>
            <h2>میز {faNum(table.id)}</h2>
            <p className="td-dialog-meta">
              ظرفیت {faNum(table.cap)} نفر · {isEmpty ? "خالی" : "سفارش فعال"}
              {pendingCount > 0 && (
                <span className="td-pending-pill">{faNum(pendingCount)} در انتظار تصمیم</span>
              )}
            </p>
          </div>
          <button type="button" className="td-dialog-close" onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </header>

        <div className="td-dialog-body">
          {isEmpty && <p className="td-empty-msg">این میز در حال حاضر خالی است.</p>}

          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              tableId={table.id}
              onConfirm={onConfirm}
              onReject={onReject}
              now={now}
            />
          ))}
        </div>

        {!isEmpty && (
          <footer className="td-dialog-foot">
            {confirmClose ? (
              <div className="td-close-confirm">
                <p className="td-close-confirm-text">
                  آیا از بستن میز {faNum(table.id)} مطمئنید؟
                </p>
                <div className="td-close-confirm-actions">
                  <button
                    type="button"
                    className="td-close-confirm-yes"
                    onClick={onCloseTable}
                  >
                    بله، ببند
                  </button>
                  <button
                    type="button"
                    className="td-close-confirm-no"
                    onClick={() => setConfirmClose(false)}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="td-close-table-btn"
                onClick={() => setConfirmClose(true)}
              >
                بستن میز و آزادسازی
              </button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

export default function TablesDashboard() {
  const {
    tableStates,
    mapTables,
    stats,
    openTable,
    confirmOrder,
    rejectOrder,
    closeTable,
    pendingOpenKey,
    consumePendingOpen,
  } = useCashierSync();

  const [selectedKey, setSelectedKey] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // A toast (or openTable) requested opening a specific table's invoice.
  useEffect(() => {
    if (pendingOpenKey) {
      setSelectedKey(pendingOpenKey);
      consumePendingOpen();
    }
  }, [pendingOpenKey, consumePendingOpen]);

  const selectedTable = selectedKey
    ? mapTables.find((t) => t.key === selectedKey)
    : null;

  const getTableColors = useCallback((table, isSel) => {
    if (isSel) return CASHIER_COLORS.selected;
    // "pending" tables stay visually simple (neutral) until opened → then orange.
    return CASHIER_COLORS[table.status] ?? CASHIER_COLORS.empty;
  }, []);

  // Clicking a table opens it and marks its orders as seen (turns it orange).
  const handleTableClick = (table) => {
    openTable(table.key);
  };

  const handleCloseTable = (tableKey) => {
    closeTable(tableKey);
    setSelectedKey(null);
  };

  return (
    <section className="admin-section td-section">
      <span className="admin-section-bar" />

      <div className="admin-card-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">سفارش فعال</p>
          <p className="admin-stat-value">{faNum(stats.active)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">در انتظار تأیید</p>
          <p className="admin-stat-value">{faNum(stats.pending)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">میز خالی</p>
          <p className="admin-stat-value">{faNum(stats.empty)}</p>
        </div>
      </div>

      <div className="td-legend">
        <span><i className="td-dot empty" /> خالی</span>
        <span><i className="td-dot pending" /> سفارش جدید</span>
        <span><i className="td-dot active" /> سفارش فعال</span>
      </div>

      <div className="td-main">
        <div className="td-map-panel">
          <div className="td-map-outer">
            <RestaurantMap
              tables={mapTables}
              getTableColors={getTableColors}
              selectedKey={selectedKey}
              onTableClick={handleTableClick}
              isTableClickable={() => true}
              variant="light"
              orientation="horizontal"
            />
          </div>
        </div>

        <aside className="td-list-panel">
          <h3 className="td-list-title">لیست میزها</h3>
          <ul className="td-table-list">
            {mapTables.map((t) => {
              const state = tableStates[t.key] ?? { status: "empty", orders: [] };
              const pending = state.orders.filter((o) => !o.acknowledged).length;
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    className={`td-table-row ${t.status} ${selectedKey === t.key ? "is-selected" : ""}`}
                    onClick={() => handleTableClick(t)}
                  >
                    <span className="td-row-num">میز {faNum(t.id)}</span>
                    <span className={`td-row-status status-${t.status}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                    {pending > 0 && (
                      <span className="td-row-badge">{faNum(pending)}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      {selectedTable && (
        <TableDialog
          table={selectedTable}
          tableState={tableStates[selectedKey]}
          onClose={() => setSelectedKey(null)}
          onConfirm={(orderId) => confirmOrder(selectedKey, orderId)}
          onReject={(orderId) => rejectOrder(selectedKey, orderId)}
          onCloseTable={() => handleCloseTable(selectedKey)}
          now={now}
        />
      )}
    </section>
  );
}
