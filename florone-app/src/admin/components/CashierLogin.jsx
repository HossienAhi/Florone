import { useState } from "react";
import { useCashierAuth } from "../../context/CashierAuthContext";
import "./CashierLogin.css";

function FloravanMark() {
  return (
    <svg className="cashier-login-logo" viewBox="0 0 377.87 419.74" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M306.35,152.01h-102.5c-11.35,0-20.59-9.23-20.59-20.59v-49.61c0-1.16-.95-2.11-2.11-2.11H82.22c-2.46,0-4.46-2-4.46-4.46v-8.51c0-2.46,2-4.46,4.46-4.46h101.52c10.42,0,18.9,8.48,18.9,18.9v49.35c0,2.23,1.82,4.05,4.05,4.05h99.66c2.34,0,4.25,1.91,4.25,4.25v8.93c0,2.34-1.91,4.25-4.25,4.25Z" fill="#fffcf2"/>
      <path d="M97.11,153.5h-10.02c-2.38,0-4.32-1.94-4.32-4.32v-35.97c0-10.56,8.59-19.15,19.15-19.15h58.84c2.38,0,4.32,1.94,4.32,4.32v8.79c0,2.38-1.94,4.32-4.32,4.32h-57.56c-.98,0-1.77,.8-1.77,1.77v35.91c0,2.38-1.94,4.32-4.32,4.32Z" fill="#fffcf2"/>
      <path d="M303.74,254.08h-104.23c-8.95,0-16.24-7.28-16.24-16.24v-51.07c0-1.57-1.28-2.85-2.85-2.85H102.82c-.76,0-1.38,.62-1.38,1.38v50.28c0,1.01,.82,1.83,1.83,1.83h57.05c2.45,0,4.44,1.99,4.44,4.44v7.79c0,2.45-1.99,4.44-4.44,4.44h-59.32c-10.04,0-18.21-8.17-18.21-18.21v-63.61c0-2.42,1.97-4.38,4.38-4.38h95.18c11.2,0,20.3,9.11,20.3,20.3v47.02c0,.96,.78,1.75,1.75,1.75h84.18c.68,0,1.23-.55,1.23-1.23v-49.54c0-1.25-1.01-2.26-2.26-2.26h-69.72c-2.38,0-4.32-1.93-4.33-4.31l-.03-7.4c0-1.16,.44-2.25,1.26-3.07,.82-.82,1.91-1.27,3.06-1.27h72.39c9.91,0,17.96,8.06,17.96,17.96v63.82c0,2.43-1.98,4.41-4.41,4.41Z" fill="#fffcf2"/>
      <path d="M198.2,350.93h-59.79c-9.88,0-17.92-8.04-17.92-17.92v-23.79c0-2.35,1.91-4.27,4.27-4.27h57.18c.74,0,1.34-.6,1.34-1.34v-18.86c0-.92-.75-1.67-1.67-1.67H102.8c-.75,0-1.37,.61-1.37,1.37v62.01c0,2.47-2.01,4.47-4.47,4.47h-9.71c-2.47,0-4.47-2.01-4.47-4.47v-74.44c0-2.41,1.96-4.37,4.37-4.37h95.91c10.8,0,19.59,8.79,19.59,19.59v29.12c0,2.39-1.95,4.34-4.34,4.34h-57.43c-.7,0-1.27,.57-1.27,1.27v9.97c0,1.04,.84,1.88,1.88,1.88h56.89c2.35,0,4.27,1.92,4.27,4.27v8.41c0,2.45-1.99,4.44-4.44,4.44Z" fill="#fffcf2"/>
      <path d="M298.63,350.93h-79.76c-1.03,0-1.86-.83-1.86-1.86v-13.2c0-1.03,.83-1.86,1.86-1.86h31.02v-38.37c-1.49,1.43-3.14,2.5-5.01,3.23-3.15,1.24-5.36,1.73-7.87,1.75-.16,0-.31,0-.47,.02-.23,.01-.45,.03-.69,.02-2.8,0-5.56-.01-8.33-.02-2.76,0-5.52-.02-8.33-.02-1.04,0-1.88-.84-1.88-1.88v-12.56c0-1.04,.84-1.88,1.88-1.88h13.2c4.4,0,8.49-1.76,11.21-4.82,.2-.22,.39-.45,.58-.69,3.37-4.29,3.31-9.07,3.13-10.92-.05-.53,.12-1.05,.48-1.44,.36-.39,.86-.62,1.39-.62h17.77c1.04,0,1.88,.84,1.88,1.88v66.75h29.81c1.04,0,1.88,.85,1.88,1.88v12.72c0,1.04-.85,1.89-1.88,1.89Z" fill="#eb5e28"/>
    </svg>
  );
}

export default function CashierLogin() {
  const { login } = useCashierAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || "خطا در ورود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cashier-login-root" dir="rtl">
      <div className="cashier-login-glow cashier-login-glow--1" aria-hidden="true" />
      <div className="cashier-login-glow cashier-login-glow--2" aria-hidden="true" />

      <div className="cashier-login-card">
        <div className="cashier-login-brand">
          <FloravanMark />
          <div>
            <p className="cashier-login-eyebrow">فلوروان</p>
            <h1 className="cashier-login-title">ورود به پنل صندوق</h1>
          </div>
        </div>

        <p className="cashier-login-sub">
          فقط پرسنل مجاز می‌توانند به داشبورد میزها و مدیریت منو دسترسی داشته باشند.
        </p>

        <form className="cashier-login-form" onSubmit={handleSubmit}>
          <label className="cashier-login-field">
            <span>نام کاربری</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری خود را وارد کنید"
              autoComplete="username"
              required
            />
          </label>

          <label className="cashier-login-field">
            <span>رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="cashier-login-error">{error}</p>}

          <button
            type="submit"
            className="cashier-login-submit"
            disabled={submitting}
          >
            {submitting ? "در حال ورود..." : "ورود به سیستم"}
          </button>
        </form>

        <p className="cashier-login-foot">
          منوی مشتری در مسیر <code>/menu</code> بدون ورود در دسترس است.
        </p>
      </div>
    </div>
  );
}
