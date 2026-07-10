import { Link } from "react-router-dom";
import FloravanLogo from "../../components/FloravanLogo";
import { ADMIN_SECTIONS } from "../adminConfig";

export default function AdminSidebar({ activeSection, onSelect, isOpen, onClose }) {
  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      <div className="admin-brand">
        <div className="admin-brand-row">
          <FloravanLogo className="admin-brand-logo" />
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="بستن منو"
          >
            ✕
          </button>
        </div>
        <p className="admin-brand-eyebrow">فلوروان ۲۱</p>
        <h2 className="admin-brand-title">پنل مدیریت</h2>
      </div>

      <nav className="admin-nav" aria-label="منوی پنل ادمین">
        {ADMIN_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`admin-nav-item ${activeSection === section.id ? "is-active" : ""}`}
            onClick={() => {
              onSelect(section.id);
              onClose?.();
            }}
          >
            <span className="admin-nav-icon" aria-hidden="true">
              {section.icon}
            </span>
            <span className="admin-nav-text">
              <span className="admin-nav-label">{section.label}</span>
              <span className="admin-nav-sub">{section.subtitle}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-foot">
        <Link to="/" className="admin-back-link" onClick={onClose}>
          ← بازگشت به سایت
        </Link>
      </div>
    </aside>
  );
}
