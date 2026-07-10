import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toFa } from '../data/price';
import neoneFlorLogo from '../assets/neone-flor.svg';
import PizzaStage from '../components/customPizza/PizzaStage';
import ToppingChipBar from '../components/customPizza/ToppingChipBar';
import PizzaBottomBar from '../components/customPizza/PizzaBottomBar';
import OvenAnimation from '../components/customPizza/OvenAnimation';
import PriceConfirmModal from '../components/customPizza/PriceConfirmModal';
import CpToast from '../components/customPizza/CpToast';
import { useCustomPizza } from '../context/CustomPizzaContext';
import {
  PIZZA_SHAPE_LABELS,
  PIZZA_SIZE_LABELS,
  TOPPING_GROUP_MODE,
  SAUCE_VISUAL,
  buildCustomPizzaCartItem,
  createBuildId,
  getToppingPositions,
  getToppingPieceCount,
  getToppingVisualProfile,
  isShapeDisabledForSize,
  SIZE_SHAPE_RULE,
} from '../data/customPizzaData';
import { getToppingTopicImage } from '../data/toppingAssets';
import './CustomPizzaPage.css';

function ShapeSizeControls({ shape, size, onShapeChange, onSizeChange }) {
  return (
    <div className="cp-controls">
      <div className="cp-control-group">
        <span className="cp-control-label">شکل</span>
        <div className="cp-pills">
          {Object.entries(PIZZA_SHAPE_LABELS).map(([key, label]) => {
            const disabled = isShapeDisabledForSize(key, size);
            return (
              <button
                key={key}
                type="button"
                className={[
                  'cp-pill',
                  shape === key && 'is-active',
                  disabled && 'is-disabled',
                ].filter(Boolean).join(' ')}
                disabled={disabled}
                onClick={() => onShapeChange(key)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="cp-control-group">
        <span className="cp-control-label">سایز</span>
        <div className="cp-pills">
          {Object.entries(PIZZA_SIZE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`cp-pill ${size === key ? 'is-active' : ''}`}
              onClick={() => onSizeChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomPizzaPage() {
  const navigate = useNavigate();
  const { config, toppings, calcPrice, isLoading, apiPayload } = useCustomPizza();
  const pizzaRef = useRef(null);
  const chipRefs = useRef({});

  const [shape, setShape] = useState('square');
  const [size, setSize] = useState('medium');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [flyingParticles, setFlyingParticles] = useState([]);
  const [queuedPizzas, setQueuedPizzas] = useState([]);
  const [ovenActive, setOvenActive] = useState(false);
  const [ovenPhase, setOvenPhase] = useState('idle');
  const [showOvenToast, setShowOvenToast] = useState(false);
  const [ovenToastCount, setOvenToastCount] = useState(1);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [pendingPrice, setPendingPrice] = useState(null);
  const [updateToastMsg, setUpdateToastMsg] = useState('');
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const configReadyRef = useRef(false);
  const configFingerprintRef = useRef('');

  const configFingerprint = useMemo(() => {
    if (!apiPayload?.settings) return '';
    return JSON.stringify({
      settings: apiPayload.settings,
      toppings: (apiPayload.toppings ?? []).map(
        (t) => `${t.id}:${t.priceMedium}:${t.available}:${t.name}`
      ),
    });
  }, [apiPayload]);

  useEffect(() => {
    if (!configFingerprint) return;
    if (!configReadyRef.current) {
      configReadyRef.current = true;
      configFingerprintRef.current = configFingerprint;
      return;
    }
    if (configFingerprintRef.current === configFingerprint) return;
    configFingerprintRef.current = configFingerprint;
    setUpdateToastMsg('منوی پیتزا سفارشی به‌روزرسانی شد');
    setShowUpdateToast(true);
  }, [configFingerprint]);

  const selectedIds = useMemo(
    () => new Set(selectedToppings.map((t) => t.id)),
    [selectedToppings]
  );

  const totalPrice = useMemo(
    () => calcPrice(size, selectedToppings),
    [calcPrice, size, selectedToppings]
  );

  const minToppings = config.minToppings ?? 3;
  const maxToppings = config.maxToppings ?? 7;
  const canSubmit = selectedToppings.length >= minToppings;
  const maxReached = selectedToppings.length >= maxToppings;

  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const clearCurrentPizza = useCallback(() => {
    setSelectedToppings([]);
    setRemovingIds(new Set());
    setFlyingParticles([]);
  }, []);

  const makeCurrentCartItem = useCallback(() => {
    return buildCustomPizzaCartItem({
      shape,
      size,
      selectedToppings,
      buildId: createBuildId(),
      settings: config,
    });
  }, [shape, size, selectedToppings, config]);

  const spawnFlyingParticles = useCallback((topping, chipEl) => {
    if (prefersReducedMotion || !chipEl || !pizzaRef.current) return;

    const chipRect = chipEl.getBoundingClientRect();
    const pizzaRect = pizzaRef.current.getBoundingClientRect();

    if (topping.group === 'sauce') {
      const sauceColor = SAUCE_VISUAL[topping.id]?.color ?? '#eb5e28';
      const targetX = pizzaRect.left + pizzaRect.width / 2;
      const targetY = pizzaRect.top + pizzaRect.height / 2;
      const startX = chipRect.left + chipRect.width / 2;
      const startY = chipRect.top + chipRect.height / 2;
      const particle = {
        id: `${topping.id}-sauce-splash-${Date.now()}`,
        kind: 'sauce',
        color: sauceColor,
        startX,
        startY,
        dx: targetX - startX,
        dy: targetY - startY,
        delay: 0,
      };
      setFlyingParticles((prev) => [...prev, particle]);
      window.setTimeout(() => {
        setFlyingParticles((prev) => prev.filter((p) => p.id !== particle.id));
      }, 650);
      return;
    }

    if (topping.group === 'cheese') {
      const startX = chipRect.left + chipRect.width / 2;
      const startY = chipRect.top + chipRect.height / 2;
      const particles = Array.from({ length: 14 }, (_, idx) => {
        const angle = ((idx * 47) % 360) * (Math.PI / 180);
        const spread = 0.25 + (idx % 5) * 0.08;
        const targetX = pizzaRect.left + pizzaRect.width * (0.5 + Math.cos(angle) * spread);
        const targetY = pizzaRect.top + pizzaRect.height * (0.5 + Math.sin(angle) * spread * 0.9);
        return {
          id: `${topping.id}-cheese-shred-${idx}-${Date.now()}`,
          kind: 'cheese-shred',
          startX,
          startY,
          dx: targetX - startX,
          dy: targetY - startY,
          delay: idx * 28,
          rotate: (idx * 37) % 180 - 90,
        };
      });
      setFlyingParticles((prev) => [...prev, ...particles]);
      window.setTimeout(() => {
        setFlyingParticles((prev) =>
          prev.filter((p) => !particles.some((np) => np.id === p.id))
        );
      }, 750);
      return;
    }

    const positions = getToppingPositions(topping.id, getToppingPieceCount(topping.id));
    const flyProfile = getToppingVisualProfile(topping.id);

    const particles = positions.map((pos, idx) => {
      const targetX = pizzaRect.left + (pos.left / 100) * pizzaRect.width;
      const targetY = pizzaRect.top + (pos.top / 100) * pizzaRect.height;
      const startX = chipRect.left + chipRect.width / 2;
      const startY = chipRect.top + chipRect.height / 2;
      return {
        id: `${topping.id}-fly-${idx}-${Date.now()}`,
        kind: 'topping',
        emoji: topping.emoji,
        imageSrc: getToppingTopicImage(topping.id),
        flyImgScale: flyProfile.flyImgScale,
        startX,
        startY,
        dx: targetX - startX,
        dy: targetY - startY,
        delay: idx * (flyProfile.pieceCount > 10 ? 20 : 40),
      };
    });

    setFlyingParticles((prev) => [...prev, ...particles]);
    const flyDuration = flyProfile.pieceCount > 18 ? 1200 : flyProfile.pieceCount > 10 ? 1050 : 700;
    window.setTimeout(() => {
      setFlyingParticles((prev) =>
        prev.filter((p) => !particles.some((np) => np.id === p.id))
      );
    }, flyDuration);
  }, [prefersReducedMotion]);

  const handleSizeChange = useCallback((nextSize) => {
    setSize(nextSize);
    setShape(SIZE_SHAPE_RULE[nextSize] ?? 'square');
  }, []);

  const handleToggleTopping = useCallback((topping) => {
    if (selectedIds.has(topping.id)) {
      setRemovingIds((prev) => new Set(prev).add(topping.id));
      window.setTimeout(() => {
        setSelectedToppings((prev) => prev.filter((t) => t.id !== topping.id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(topping.id);
          return next;
        });
      }, 280);
    } else {
      const chipEl = chipRefs.current[topping.id];
      const isSingle = TOPPING_GROUP_MODE[topping.group] === 'single';
      const prevInGroup = isSingle
        ? selectedToppings.find((t) => t.group === topping.group)
        : null;

      spawnFlyingParticles(topping, chipEl);

      if (prevInGroup && prevInGroup.id !== topping.id) {
        setRemovingIds((prev) => new Set(prev).add(prevInGroup.id));
        window.setTimeout(() => {
          setSelectedToppings((prev) => [
            ...prev.filter((t) => t.group !== topping.group),
            topping,
          ]);
          setRemovingIds((prev) => {
            const next = new Set(prev);
            next.delete(prevInGroup.id);
            return next;
          });
        }, 280);
      } else {
        setSelectedToppings((prev) => [...prev, topping]);
      }
    }
  }, [selectedIds, selectedToppings, spawnFlyingParticles]);

  const runOvenAndNavigate = useCallback((allItems) => {
    const count = allItems.length;
    setOvenToastCount(count);

    const navigateWithItems = () => {
      const builderBatchId = `batch-${Date.now()}`;
      navigate('/menu/pizza', {
        state: { pendingCartItems: allItems, fromBuilder: true, builderBatchId },
      });
    };

    setOvenActive(true);
    if (prefersReducedMotion) {
      setShowOvenToast(true);
      window.setTimeout(navigateWithItems, 600);
      return;
    }
    setOvenPhase('slide');
    window.setTimeout(() => setOvenPhase('open'), 350);
    window.setTimeout(() => setOvenPhase('bake'), 850);
    window.setTimeout(() => setOvenPhase('close'), 1450);
    window.setTimeout(() => {
      setOvenPhase('done');
      setShowOvenToast(true);
      window.setTimeout(navigateWithItems, 500);
    }, 1750);
  }, [navigate, prefersReducedMotion]);

  const handleBuildAnother = useCallback(() => {
    if (!canSubmit || ovenActive) return;
    const item = makeCurrentCartItem();
    setQueuedPizzas((prev) => [...prev, item]);
    clearCurrentPizza();
  }, [canSubmit, ovenActive, makeCurrentCartItem, clearCurrentPizza]);

  const handleRemoveQueued = useCallback((buildId) => {
    setQueuedPizzas((prev) => prev.filter((item) => item.buildId !== buildId));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || ovenActive) return;
    const current = makeCurrentCartItem();
    const allItems = [...queuedPizzas, current];
    runOvenAndNavigate(allItems);
  }, [canSubmit, ovenActive, makeCurrentCartItem, queuedPizzas, runOvenAndNavigate]);

  const handlePriceConfirm = () => {
    setShowPriceModal(false);
    if (pendingPrice != null) {
      /* future: apply server price before submit */
    }
    handleSubmit();
  };

  const toastMessage = ovenToastCount > 1
    ? `${toFa(ovenToastCount)} پیتزا رفت تو تنور! 🍕`
    : 'رفت تو تنور! 🍕';

  if (isLoading) {
    return (
      <div dir="rtl" className="cp-root cp-root--loading">
        <p>در حال بارگذاری منو...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="cp-root">
      <div className="cp-bg" aria-hidden="true">
        <div className="cp-bg-image" />
        <div className="cp-bg-overlay" />
      </div>

      <div className="cp-glass-shell">
        <header className="cp-header">
          <button type="button" className="cp-back" onClick={() => navigate('/menu')}>
            → بازگشت
          </button>
          <div className="cp-header-center">
            <h1 className="cp-title">پیتزای خودت رو بساز</h1>
            <p className="cp-subtitle">سس، پنیر و تاپینگ — همین‌جا ترکیب کن</p>
          </div>
          <img src={neoneFlorLogo} alt="Floravan" className="cp-header-logo" />
        </header>

        <main className="cp-main">
          <div className="cp-builder-layout">
            <div className="cp-builder-stage-col">
              <div className="cp-stage-glass">
                <PizzaStage
                  shape={shape}
                  size={size}
                  selectedToppings={selectedToppings}
                  removingIds={removingIds}
                  ovenPhase={ovenPhase}
                  pizzaRef={pizzaRef}
                />
              </div>

              <ShapeSizeControls
                shape={shape}
                size={size}
                onShapeChange={setShape}
                onSizeChange={handleSizeChange}
              />
            </div>

            <div className="cp-builder-options-col">
              <ToppingChipBar
                size={size}
                toppings={toppings}
                settings={config}
                selectedIds={selectedIds}
                onToggle={handleToggleTopping}
                maxReached={maxReached}
                chipRefs={chipRefs}
              />
            </div>
          </div>
        </main>
      </div>

      <PizzaBottomBar
        totalPrice={totalPrice}
        toppingCount={selectedToppings.length}
        queuedPizzas={queuedPizzas}
        onRemoveQueued={handleRemoveQueued}
        minToppings={minToppings}
        maxToppings={maxToppings}
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
        onBuildAnother={handleBuildAnother}
        isOvenRunning={ovenActive}
      />

      {flyingParticles.map((p) => (
        <span
          key={p.id}
          className={[
            'cp-fly-particle',
            p.kind === 'sauce' && 'cp-fly-particle--sauce',
            p.kind === 'cheese-shred' && 'cp-fly-particle--cheese-shred',
            p.kind === 'topping' && p.imageSrc && 'cp-fly-particle--topping-img',
            p.kind === 'topping' && p.flyImgScale < 0.88 && 'cp-fly-particle--fine',
          ].filter(Boolean).join(' ')}
          style={{
            left: p.startX,
            top: p.startY,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--splash-color': p.color,
            '--fly-rotate': `${p.rotate ?? 0}deg`,
            '--fly-img-scale': p.flyImgScale ?? 1,
            animationDelay: `${p.delay}ms`,
          }}
          aria-hidden="true"
        >
          {p.kind === 'topping' && (
            p.imageSrc ? (
              <img src={p.imageSrc} alt="" className="cp-fly-particle-img" draggable={false} />
            ) : (
              p.emoji
            )
          )}
        </span>
      ))}

      <OvenAnimation active={ovenActive && !prefersReducedMotion} />

      {showOvenToast && (
        <div className="cp-oven-toast" role="status">
          {toastMessage}
        </div>
      )}

      <PriceConfirmModal
        open={showPriceModal}
        oldPrice={totalPrice}
        newPrice={pendingPrice ?? totalPrice}
        onConfirm={handlePriceConfirm}
        onCancel={() => setShowPriceModal(false)}
      />

      <CpToast
        message={updateToastMsg}
        visible={showUpdateToast}
        onHide={() => setShowUpdateToast(false)}
      />
    </div>
  );
}
