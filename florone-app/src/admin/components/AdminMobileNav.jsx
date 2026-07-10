import { ADMIN_SECTIONS } from "../adminConfig";

const SHORT_LABELS = {
  "tables-dashboard": "میزها",
  orders: "سفارش",
  menu: "منو",
  "tables-mgmt": "چیدمان",
  reports: "گزارش",
  settings: "تنظیم",
};

export default function AdminMobileNav({ activeSection, onSelect }) {
  return (
    <nav className="admin-mobile-nav" aria-label="ناوبری سریع موبایل">
      {ADMIN_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`admin-mobile-nav-item ${activeSection === section.id ? "is-active" : ""}`}
          onClick={() => onSelect(section.id)}
          aria-current={activeSection === section.id ? "page" : undefined}
        >
          <span className="admin-mobile-nav-icon" aria-hidden="true">
            {section.icon}
          </span>
          <span className="admin-mobile-nav-label">
            {SHORT_LABELS[section.id] ?? section.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
