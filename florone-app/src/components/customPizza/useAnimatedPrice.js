import { useEffect, useRef, useState } from 'react';

const DURATION = 400;

export function useAnimatedPrice(targetPrice) {
  const [displayPrice, setDisplayPrice] = useState(targetPrice);
  const rafRef = useRef(0);
  const startRef = useRef({ from: targetPrice, start: 0 });

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = displayPrice;
    const to = targetPrice;
    if (from === to) return;

    startRef.current = { from, to, start: performance.now() };

    const tick = (now) => {
      const { from: f, to: t, start } = startRef.current;
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const value = Math.round(f + (t - f) * progress);
      setDisplayPrice(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPrice]);

  return displayPrice;
}
