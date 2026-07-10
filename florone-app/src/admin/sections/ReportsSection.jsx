import { faNum } from "../../data/tableLayout";

const SAMPLE_REPORTS = [
  { label: "فروش امروز",     value: "۴,۲۵۰,۰۰۰", unit: "تومان" },
  { label: "فروش این هفته", value: "۲۸,۴۰۰,۰۰۰", unit: "تومان" },
  { label: "میانگین فاکتور", value: "۵۸۵,۰۰۰", unit: "تومان" },
  { label: "تعداد مشتری",   value: faNum(47), unit: "نفر" },
];

export default function ReportsSection() {
  return (
    <section className="admin-section">
      <span className="admin-section-bar" />

      <div className="admin-card-grid">
        {SAMPLE_REPORTS.map((r) => (
          <div key={r.label} className="admin-stat-card">
            <p className="admin-stat-label">{r.label}</p>
            <p className="admin-stat-value">
              {r.value}
              <span style={{ fontSize: "0.7rem", marginRight: 4, opacity: 0.6 }}>
                {r.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-placeholder" style={{ padding: "32px 16px" }}>
          <div className="admin-placeholder-icon">◧</div>
          <h3>گزارش‌های تفصیلی</h3>
          <p>
            نمودار فروش روزانه، گزارش مالی ماهانه و خروجی اکسل در مرحله بعد
            اضافه می‌شود.
          </p>
        </div>
      </div>
    </section>
  );
}
