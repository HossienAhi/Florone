import { useMemo } from 'react';
import {
  getCheeseDust,
  getCheesePools,
  getCheeseShreds,
  getCheeseStrings,
} from './pizzaVisualUtils';

export default function CheeseShredLayer({ cheeseId, removing, variant = 'gouda' }) {
  const shreds = useMemo(() => getCheeseShreds(cheeseId), [cheeseId]);
  const dust = useMemo(() => getCheeseDust(cheeseId), [cheeseId]);
  const pools = useMemo(() => getCheesePools(cheeseId), [cheeseId]);
  const strings = useMemo(() => getCheeseStrings(cheeseId), [cheeseId]);

  return (
    <div
      className={[
        'cp-cheese-shreds',
        variant === 'marta' && 'cp-cheese-shreds--marta',
        removing ? 'is-removing' : 'is-sprinkling',
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {pools.map((p) => (
        <span
          key={p.id}
          className="cp-cheese-pool"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            opacity: p.opacity,
          }}
        />
      ))}

      <svg className="cp-cheese-strings-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cpCheeseStrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff4c2" />
            <stop offset="45%" stopColor="#ffd45a" />
            <stop offset="100%" stopColor="#e8a820" />
          </linearGradient>
        </defs>
        {strings.map((s) => (
          <path
            key={s.id}
            d={s.d}
            fill="none"
            stroke="url(#cpCheeseStrandGrad)"
            strokeWidth={s.width}
            strokeLinecap="round"
            opacity={s.opacity}
            className="cp-cheese-string-path"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>

      {shreds.map((s) => (
        <span
          key={s.id}
          className={`cp-cheese-shred cp-cheese-shred--${s.variant}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.length}px`,
            height: `${s.thickness}px`,
            opacity: s.opacity,
            '--shred-angle': `${s.angle}deg`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {dust.map((d) => (
        <span
          key={d.id}
          className="cp-cheese-dust"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
