import { useId, useMemo } from 'react';
import {
  getToppingPositions,
  getToppingPieceCount,
  getToppingVisualType,
  PIZZA_BUILDER_CONFIG,
  SAUCE_VISUAL,
  VISUAL_TOPPING_GROUPS,
} from '../../data/customPizzaData';
import CheeseShredLayer from './CheeseShredLayer';
import ToppingVisual from './ToppingVisual';
import {
  getDoughBubbles,
  getSauceSpecks,
  getToppingPieceMeta,
} from './pizzaVisualUtils';
import './PizzaStage.css';

function PizzaBaseSvg({ isSquare, shapeSeed }) {
  const uid = useId().replace(/:/g, '');
  const bubbles = useMemo(() => getDoughBubbles(shapeSeed), [shapeSeed]);

  const defs = (
    <defs>
      <radialGradient id={`crust-${uid}`} cx="42%" cy="38%" r="62%">
        <stop offset="0%" stopColor="#f0c96a" />
        <stop offset="55%" stopColor="#d4a044" />
        <stop offset="100%" stopColor="#9a6528" />
      </radialGradient>
      <radialGradient id={`bread-${uid}`} cx="46%" cy="40%" r="58%">
        <stop offset="0%" stopColor="#fff3c4" />
        <stop offset="42%" stopColor="#f5de98" />
        <stop offset="100%" stopColor="#e8c878" />
      </radialGradient>
      <radialGradient id={`crustEdge-${uid}`} cx="50%" cy="50%" r="50%">
        <stop offset="78%" stopColor="transparent" />
        <stop offset="92%" stopColor="#c8893a" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#8b5a22" stopOpacity="0.75" />
      </radialGradient>
    </defs>
  );

  if (isSquare) {
    return (
      <>
        {defs}
        <rect x="2" y="2" width="196" height="196" rx="30" fill="#1a1410" opacity="0.35" />
        <rect x="8" y="8" width="184" height="184" rx="26" fill={`url(#crust-${uid})`} />
        <rect x="16" y="16" width="168" height="168" rx="22" fill={`url(#bread-${uid})`} />
        <rect x="16" y="16" width="168" height="168" rx="22" fill={`url(#crustEdge-${uid})`} />
        <rect x="22" y="22" width="156" height="156" rx="18" fill="#fff8e8" opacity="0.12" />
        <ellipse cx="78" cy="72" rx="38" ry="26" fill="#fff" opacity="0.07" />
        {bubbles.map((b) => (
          <circle key={b.id} cx={b.cx} cy={b.cy} r={b.r} fill="#fff" opacity={b.opacity} />
        ))}
      </>
    );
  }

  return (
    <>
      {defs}
      <circle cx="100" cy="100" r="97" fill="#1a1410" opacity="0.35" />
      <circle cx="100" cy="100" r="90" fill={`url(#crust-${uid})`} />
      <circle cx="100" cy="100" r="82" fill={`url(#bread-${uid})`} />
      <circle cx="100" cy="100" r="82" fill={`url(#crustEdge-${uid})`} />
      <circle cx="100" cy="100" r="74" fill="#fff8e8" opacity="0.1" />
      <ellipse cx="82" cy="78" rx="36" ry="24" fill="#fff" opacity="0.08" />
      {bubbles.map((b) => (
        <circle key={b.id} cx={b.cx} cy={b.cy} r={b.r} fill="#fff" opacity={b.opacity} />
      ))}
    </>
  );
}

function SauceLayer({ sauce, removing, visual, isSquare }) {
  const specks = useMemo(() => getSauceSpecks(sauce.id), [sauce.id]);
  const sauceClass = `cp-sauce-layer cp-sauce-layer--${sauce.id}`;

  return (
    <div
      key={sauce.id}
      className={[
        sauceClass,
        isSquare ? 'cp-sauce-layer--square' : 'cp-sauce-layer--circle',
        removing ? 'is-removing' : 'is-spreading',
      ].filter(Boolean).join(' ')}
      style={{
        '--sauce-color': visual.color,
        '--sauce-edge': visual.edge,
        '--sauce-opacity': visual.opacity ?? 0.55,
      }}
    >
      <div className="cp-sauce-body" />
      <div className="cp-sauce-texture" aria-hidden="true" />
      <div className="cp-sauce-shine" aria-hidden="true" />
      <div className="cp-sauce-specks" aria-hidden="true">
        {specks.map((s) => (
          <span
            key={s.id}
            className={`cp-sauce-speck cp-sauce-speck--t${s.tone}`}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PizzaStage({
  shape,
  size,
  selectedToppings,
  removingIds = new Set(),
  ovenPhase = 'idle',
  pizzaRef,
}) {
  const scale = PIZZA_BUILDER_CONFIG.sizeScale[size] ?? 1;
  const isSquare = shape === 'square';
  const shapeSeed = isSquare ? 'square' : 'circle';

  const selectedSauce = selectedToppings.find((t) => t.group === 'sauce');
  const selectedCheese = selectedToppings.find((t) => t.group === 'cheese');
  const pieceToppings = selectedToppings.filter((t) => VISUAL_TOPPING_GROUPS.has(t.group));

  const sauceVisual = selectedSauce ? SAUCE_VISUAL[selectedSauce.id] : null;
  const sauceRemoving = selectedSauce && removingIds.has(selectedSauce.id);
  const cheeseRemoving = selectedCheese && removingIds.has(selectedCheese.id);

  return (
    <div className="cp-stage">
      <div className={`cp-oven ${ovenPhase !== 'idle' ? 'is-active' : ''}`} data-phase={ovenPhase}>
        <svg className="cp-oven-svg" viewBox="0 0 120 80" aria-hidden="true">
          <rect x="10" y="20" width="100" height="55" rx="8" fill="#2a2420" stroke="rgba(255,252,242,0.15)" strokeWidth="2" />
          <rect className="cp-oven-glow" x="18" y="28" width="84" height="38" rx="4" fill="url(#ovenGrad)" opacity="0" />
          <rect className="cp-oven-door" x="14" y="16" width="92" height="12" rx="4" fill="#3d3530" stroke="rgba(255,252,242,0.2)" strokeWidth="1.5" />
          <defs>
            <linearGradient id="ovenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#c0392b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="cp-oven-sparks" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="cp-oven-spark" style={{ '--i': i }} />
          ))}
        </div>
      </div>

      <div className="cp-stage-ambient" aria-hidden="true" />

      <div
        ref={pizzaRef}
        className={`cp-pizza-wrap cp-pizza-wrap--${ovenPhase}`}
        style={{ '--pizza-scale': scale }}
      >
        <div className="cp-wood-board" aria-hidden="true" />
        <div className="cp-pizza-shadow" aria-hidden="true" />

        <div className={`cp-pizza-disk ${isSquare ? 'is-square' : 'is-circle'}`}>
          <svg className="cp-pizza-svg" viewBox="0 0 200 200" aria-hidden="true">
            <PizzaBaseSvg isSquare={isSquare} shapeSeed={shapeSeed} />
          </svg>

          {selectedSauce && sauceVisual && (
            <SauceLayer
              sauce={selectedSauce}
              removing={sauceRemoving}
              visual={sauceVisual}
              isSquare={isSquare}
            />
          )}

          {selectedCheese && (
            <CheeseShredLayer
              cheeseId={selectedCheese.id}
              removing={cheeseRemoving}
              variant={selectedCheese.id === 'marta' ? 'marta' : 'gouda'}
            />
          )}

          <div className="cp-toppings-layer">
            {pieceToppings.map((topping) => {
              const positions = getToppingPositions(topping.id, getToppingPieceCount(topping.id));
              const isRemoving = removingIds.has(topping.id);
              const isFine = getToppingVisualType(topping.id) === 'fine';
              const isChickenSpread = getToppingVisualType(topping.id) === 'chicken';
              return positions.map((pos, idx) => {
                const meta = getToppingPieceMeta(topping.id, idx);
                return (
                  <span
                    key={`${topping.id}-${idx}`}
                    className={[
                      'cp-topping-piece',
                      isRemoving ? 'is-removing' : 'is-placed',
                      `cp-topping-piece--${topping.group}`,
                      isFine && 'cp-topping-piece--fine',
                      isChickenSpread && 'cp-topping-piece--chicken-spread',
                    ].filter(Boolean).join(' ')}
                    style={{
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                      '--rotate': `${meta.rotate}deg`,
                      '--tilt-x': `${meta.tiltX}deg`,
                      '--piece-scale': meta.scale,
                      '--delay': `${meta.delay}s`,
                      '--sink': meta.sink,
                      zIndex: meta.sink,
                    }}
                    aria-hidden="true"
                  >
                    <span className="cp-topping-piece-shadow" />
                    <ToppingVisual
                      topping={topping}
                      imgClassName="cp-topping-piece-img"
                      emojiClassName="cp-topping-piece-emoji"
                    />
                  </span>
                );
              });
            })}
          </div>

          <div className="cp-pizza-sheen" aria-hidden="true" />
        </div>

        {(selectedSauce || selectedCheese || pieceToppings.length > 0) && (
          <div className="cp-pizza-steam" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="cp-steam-wisp" style={{ '--i': i }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
