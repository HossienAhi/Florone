import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminMobileNav from "./components/AdminMobileNav";
import TablesDashboard from "./sections/TablesDashboard";
import OrdersSection from "./sections/OrdersSection";
import MenuManagementSection from "./sections/MenuManagementSection";
import TablesManagementSection from "./sections/TablesManagementSection";
import ReportsSection from "./sections/ReportsSection";
import SettingsSection from "./sections/SettingsSection";
import { ADMIN_SECTIONS } from "./adminConfig";
import { useCashierAuth } from "../context/CashierAuthContext";
import { useCashierSync } from "../context/CashierSyncContext";
import "./AdminPanel.css";
import "./sections/sections.css";

const SECTION_COMPONENTS = {
  "tables-dashboard": TablesDashboard,
  orders: OrdersSection,
  menu: MenuManagementSection,
  "tables-mgmt": TablesManagementSection,
  reports: ReportsSection,
  settings: SettingsSection,
};

export default function AdminPanel() {
  const { activeSection, setActiveSection } = useCashierSync();
  const { user, logout } = useCashierAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = ADMIN_SECTIONS.find((s) => s.id === activeSection);
  const SectionComponent = SECTION_COMPONENTS[activeSection];

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-root" dir="rtl">
      <div
        className={`admin-overlay ${sidebarOpen ? "is-visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <AdminSidebar
        activeSection={activeSection}
        onSelect={handleSectionSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
            >
              <span className="admin-menu-toggle-icon" aria-hidden="true">☰</span>
            </button>
            <div className="admin-topbar-titles">
              <p className="admin-topbar-eyebrow">{current?.subtitle}</p>
              <h1 className="admin-topbar-title">{current?.label}</h1>
            </div>
          </div>
          <div className="admin-topbar-end">
            {user && (
              <div className="admin-topbar-profile">
                <span className="admin-topbar-avatar" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <span className="admin-topbar-profile-label">
                  کاربر : <strong>{user.displayName || "نیما اسدی"}</strong>
                </span>
              </div>
            )}
            <div className="admin-topbar-meta">
              <span className="admin-status-dot" />
              <span className="admin-topbar-status-text">سیستم فعال</span>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={() => logout()}
            >
              خروج
            </button>
          </div>
        </header>

        <main className="admin-content">
          <SectionComponent />
        </main>

        <AdminMobileNav
          activeSection={activeSection}
          onSelect={handleSectionSelect}
        />
      </div>
    </div>
  );
}
