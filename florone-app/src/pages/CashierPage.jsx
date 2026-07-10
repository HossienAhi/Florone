import AdminPanel from "../admin/AdminPanel";
import CashierLogin from "../admin/components/CashierLogin";
import CashierNotifications from "../admin/components/CashierNotifications";
import { CashierAuthProvider, useCashierAuth } from "../context/CashierAuthContext";
import { CashierSyncProvider } from "../context/CashierSyncContext";
import { useMenu } from "../context/MenuContext";
import "../admin/components/CashierLogin.css";

function CashierWorkspace() {
  const { notice } = useMenu();

  return (
    <CashierSyncProvider>
      {notice && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: notice.type === "error" ? "#b91c1c" : "#166534",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)",
          }}
        >
          {notice.message}
        </div>
      )}
      <AdminPanel />
      <CashierNotifications />
    </CashierSyncProvider>
  );
}

function CashierGate() {
  const { isAuthenticated, isLoading } = useCashierAuth();

  if (isLoading) {
    return (
      <div className="cashier-login-loading" dir="rtl">
        در حال بررسی نشست...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <CashierLogin />;
  }

  return <CashierWorkspace />;
}

export default function CashierPage() {
  return (
    <CashierAuthProvider>
      <CashierGate />
    </CashierAuthProvider>
  );
}
