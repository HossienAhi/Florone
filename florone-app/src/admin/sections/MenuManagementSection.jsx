import { useState } from "react";
import { menuCategories } from "../../data/menuData";
import { useMenu } from "../../context/MenuContext";
import { faNum } from "../../data/tableLayout";
import CategoryItemsEditor from "../components/CategoryItemsEditor";
import CustomPizzaAdminEditor from "../components/CustomPizzaAdminEditor";
import "./MenuManagement.css";

export default function MenuManagementSection() {
  const { stats } = useMenu();
  const [activeCategory, setActiveCategory] = useState(null);
  const [showPizzaAdmin, setShowPizzaAdmin] = useState(false);

  if (showPizzaAdmin) {
    return <CustomPizzaAdminEditor onBack={() => setShowPizzaAdmin(false)} />;
  }
  if (activeCategory) {
    const category = menuCategories.find((cat) => cat.id === activeCategory);
    return (
      <section className="admin-section">
        <CategoryItemsEditor
          categoryId={activeCategory}
          categoryName={category?.name ?? activeCategory}
          onBack={() => setActiveCategory(null)}
        />
      </section>
    );
  }

  return (
    <section className="admin-section">
      <span className="admin-section-bar" />

      <div className="admin-card-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">دسته‌بندی‌ها</p>
          <p className="admin-stat-value">{faNum(menuCategories.length)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">آیتم‌های فعال</p>
          <p className="admin-stat-value">{faNum(stats.active)}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">آیتم‌های غیرفعال</p>
          <p className="admin-stat-value">{faNum(stats.inactive)}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">دسته‌بندی‌های منو</h3>
        <p className="menu-mgmt-hint">
          روی «مدیریت ایتم‌ها» بزنید تا محصولات هر دسته را اضافه، ویرایش یا حذف کنید.
        </p>
        <ul className="menu-mgmt-list">
          <li className="menu-mgmt-item menu-mgmt-item--pizza">
            <span className="menu-mgmt-pizza-icon" aria-hidden="true">🍕</span>
            <span className="menu-mgmt-name">پیتزا سفارشی</span>
            <button
              type="button"
              className="menu-mgmt-btn menu-mgmt-btn--active"
              onClick={() => setShowPizzaAdmin(true)}
            >
              قیمت‌گذاری و تاپینگ‌ها
            </button>
          </li>
          {menuCategories.map((cat) => (
            <li key={cat.id} className="menu-mgmt-item">
              <img src={cat.icon} alt="" className="menu-mgmt-cat-icon" />
              <span className="menu-mgmt-name">{cat.name}</span>
              <button
                type="button"
                className="menu-mgmt-btn menu-mgmt-btn--active"
                onClick={() => setActiveCategory(cat.id)}
              >
                مدیریت ایتم‌ها
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
