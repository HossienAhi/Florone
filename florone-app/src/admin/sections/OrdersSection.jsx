import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { faNum } from "../../data/tableLayout";
import { formatToman, parsePrice } from "../../data/price";
import { authHeaders } from "../../utils/cashierAuth";
import { API_BASE } from "../../config/api";

const STATUS_MAP = {
  pending: { label: "در انتظار تأیید", className: "status-pending" },
  confirmed: { label: "تأیید شده", className: "status-confirmed" },
  closed: { label: "تسویه شده", className: "status-delivered" },
  delivered: { label: "تحویل داده شده", className: "status-delivered" },
};

function formatElapsed(ms) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "همین الان";
  if (mins < 60) return `${faNum(mins)} دقیقه پیش`;
  const hours = Math.floor(mins / 60);
  return `${faNum(hours)} ساعت پیش`;
}

function isToday(ms) {
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function OrdersSection() {
  const ordersQuery = useQuery({
    queryKey: ["admin-orders-list"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/orders/list`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("failed");
      return response.json();
    },
    refetchInterval: 15000,
  });

  const orders = ordersQuery.data ?? [];

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.createdAt));
    const pending = orders.filter((o) => o.status === "pending").length;
    const sales = today.reduce((sum, o) => sum + parsePrice(o.total), 0);
    return { todayCount: today.length, pending, sales };
  }, [orders]);

  return (
    <section className="admin-section">
      <span className="admin-section-bar" />

      <div className="admin-card-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">سفارش‌های امروز</p>
          <p className="admin-stat-value">{faNum(stats.todayCount)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">در انتظار تأیید</p>
          <p className="admin-stat-value">{faNum(stats.pending)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">فروش امروز</p>
          <p className="admin-stat-value">{formatToman(stats.sales)}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">سفارش‌های اخیر</h3>

        {ordersQuery.isLoading && <p className="orders-note">در حال بارگذاری...</p>}
        {ordersQuery.isError && (
          <p className="orders-note">اتصال به سرور برقرار نشد.</p>
        )}
        {!ordersQuery.isLoading && orders.length === 0 && (
          <p className="orders-note">سفارشی ثبت نشده است.</p>
        )}

        {orders.length > 0 && (
          <>
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>شماره</th>
                    <th>میز</th>
                    <th>مبلغ</th>
                    <th>زمان</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                    return (
                      <tr key={order.id}>
                        <td>#{String(order.id).slice(-3)}</td>
                        <td>میز {faNum(order.table ?? "-")}</td>
                        <td>{order.total} تومان</td>
                        <td>{formatElapsed(order.createdAt)}</td>
                        <td>
                          <span className={`orders-status ${st.className}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="orders-mobile-list">
              {orders.map((order) => {
                const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                return (
                  <article key={order.id} className="orders-mobile-card">
                    <div className="orders-mobile-card-head">
                      <span className="orders-mobile-card-id">
                        #{String(order.id).slice(-3)}
                      </span>
                      <span className={`orders-status ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="orders-mobile-card-row">
                      <span>میز</span>
                      <strong>میز {faNum(order.table ?? "-")}</strong>
                    </div>
                    <div className="orders-mobile-card-row">
                      <span>مبلغ</span>
                      <strong>{order.total} تومان</strong>
                    </div>
                    <div className="orders-mobile-card-row">
                      <span>زمان</span>
                      <strong>{formatElapsed(order.createdAt)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
