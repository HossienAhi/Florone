import { useCashierSync } from "../../context/CashierSyncContext";
import { faNum } from "../../data/tableLayout";
import "./CashierNotifications.css";

export default function CashierNotifications() {
  const { toasts, isOnline, openTable, dismissToast } = useCashierSync();

  return (
    <>
      {!isOnline && (
        <div className="cn-offline" role="alert" dir="rtl">
          <span className="cn-offline-dot" />
          عدم اتصال به سرور — سفارشات جدید دریافت نمی‌شوند
        </div>
      )}

      <div className="cn-toast-stack" dir="rtl">
        {toasts.map((t) => (
          <div className="cn-toast" key={t.tableKey}>
            <button
              type="button"
              className="cn-toast-close"
              onClick={() => dismissToast(t.tableKey)}
              aria-label="بستن"
            >
              ✕
            </button>
            <div className="cn-toast-body">
              <span className="cn-toast-icon" aria-hidden="true">🔔</span>
              <div className="cn-toast-text">
                <p className="cn-toast-title">
                  سفارش جدید از میز {faNum(t.tableId)}
                </p>
                <p className="cn-toast-sub">
                  {t.count > 1
                    ? `${faNum(t.count)} سفارش دیده‌نشده`
                    : "یک سفارش جدید ثبت شد"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="cn-toast-action"
              onClick={() => openTable(t.tableKey)}
            >
              باز کردن سفارش
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
