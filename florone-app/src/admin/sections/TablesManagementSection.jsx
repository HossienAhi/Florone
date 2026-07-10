import { TABLE_LAYOUT, faNum } from "../../data/tableLayout";

export default function TablesManagementSection() {
  return (
    <section className="admin-section">
      <span className="admin-section-bar" />

      <div className="admin-card-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">تعداد میزها</p>
          <p className="admin-stat-value">{faNum(TABLE_LAYOUT.length)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">ظرفیت کل</p>
          <p className="admin-stat-value">
            {faNum(TABLE_LAYOUT.reduce((sum, t) => sum + t.cap, 0))}
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">لیست میزها</h3>

        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>شماره میز</th>
                <th>ظرفیت</th>
                <th>موقعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_LAYOUT.map((t) => (
                <tr key={t.key}>
                  <td>میز {faNum(t.id)}</td>
                  <td>{faNum(t.cap)} نفر</td>
                  <td>
                    x: {faNum(Math.round(t.x))} · y: {faNum(Math.round(t.y))}
                  </td>
                  <td>
                    <button type="button" className="menu-mgmt-btn" disabled>
                      ویرایش
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="orders-mobile-list">
          {TABLE_LAYOUT.map((t) => (
            <article key={t.key} className="orders-mobile-card">
              <div className="orders-mobile-card-head">
                <span className="orders-mobile-card-id">میز {faNum(t.id)}</span>
                <button type="button" className="menu-mgmt-btn" disabled>
                  ویرایش
                </button>
              </div>
              <div className="orders-mobile-card-row">
                <span>ظرفیت</span>
                <strong>{faNum(t.cap)} نفر</strong>
              </div>
              <div className="orders-mobile-card-row">
                <span>موقعیت</span>
                <strong>
                  x: {faNum(Math.round(t.x))} · y: {faNum(Math.round(t.y))}
                </strong>
              </div>
            </article>
          ))}
        </div>

        <p className="orders-note">ویرایش چیدمان نقشه و افزودن میز جدید در مرحله بعد.</p>
      </div>
    </section>
  );
}
