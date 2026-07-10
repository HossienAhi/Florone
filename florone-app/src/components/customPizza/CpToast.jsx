import { useEffect } from 'react';
import './CpToast.css';

export default function CpToast({ message, visible, onHide, duration = 2800 }) {
  useEffect(() => {
    if (!visible || !message) return undefined;
    const t = window.setTimeout(() => onHide?.(), duration);
    return () => window.clearTimeout(t);
  }, [visible, message, duration, onHide]);

  if (!visible || !message) return null;

  return (
    <div className="cp-update-toast" role="status" aria-live="polite">
      <span className="cp-update-toast-icon" aria-hidden="true">✓</span>
      <span>{message}</span>
    </div>
  );
}
