import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './VerticalScrollProgress.css';
import './VerticalScrollProgress.css';

const HIDDEN_ROUTES = ['/cashier'];

export default function VerticalScrollProgress() {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    setProgress(max > 0 ? doc.scrollTop / max : 0);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  const hidden = HIDDEN_ROUTES.some((r) => pathname.toLowerCase().startsWith(r));
  if (hidden) return null;

  return (
    <div
      className="vsp-track"
      aria-hidden="true"
      role="presentation"
    >
      <div
        className="vsp-bar"
        style={{ transform: `scaleY(${progress})` }}
      />
    </div>
  );
}
