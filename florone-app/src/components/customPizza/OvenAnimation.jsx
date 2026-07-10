import { useEffect, useState } from 'react';

const PHASES = [
  { key: 'slide', duration: 350 },
  { key: 'open', duration: 500 },
  { key: 'bake', duration: 600 },
  { key: 'close', duration: 300 },
];

const TOTAL_MS = PHASES.reduce((s, p) => s + p.duration, 0);

export default function OvenAnimation({ active, onComplete, onToast }) {
  const [phase, setPhase] = useState('idle');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setShowToast(false);
      return;
    }

    let elapsed = 0;
    let currentIdx = 0;
    setPhase(PHASES[0].key);

    const timers = PHASES.map((p, idx) => {
      elapsed += p.duration;
      return window.setTimeout(() => {
        currentIdx = idx + 1;
        if (currentIdx < PHASES.length) {
          setPhase(PHASES[currentIdx].key);
        } else {
          setShowToast(true);
          onToast?.();
          window.setTimeout(() => onComplete?.(), 400);
        }
      }, elapsed);
    });

    return () => timers.forEach(clearTimeout);
  }, [active, onComplete, onToast]);

  if (!active && phase === 'idle') return null;

  return (
    <>
      {showToast && (
        <div className="cp-oven-toast" role="status">
          رفت تو تنور! 🍕
        </div>
      )}
      <div className="cp-oven-overlay" data-phase={phase} aria-hidden="true" />
    </>
  );
}

export { TOTAL_MS as OVEN_ANIMATION_MS };
