import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProductDialog from './ProductDialog';
import TableMap from './TableMap';
import { useMenu } from '../context/MenuContext';
import { menuCategories } from '../data/menuData';
import { formatToman, toFa, getItemPricing } from '../data/price';
import './CategoryPage.css';

/* signature so identical configurations stack into one line */
function cartSignature(entry) {
  const opts = (entry.options || [])
    .map((o) => `${o.group}:${o.label}`)
    .sort()
    .join('|');
  return `${entry.id}__${opts}`;
}

/* ── bottom glass invoice bar ── */
function CartBar({ cart, justAdded, expanded, onToggle, onContinue, onSelectTable, onRemove }) {
  const totalCount = cart.reduce((s, e) => s + e.qty, 0);
  const totalPrice = cart.reduce((s, e) => s + e.lineTotal, 0);

  return (
    <div className={`cartbar ${expanded ? 'is-expanded' : ''}`}>
      {justAdded && (
        <div className="cartbar-toast">
          <span className="cartbar-toast-check">✓</span>
          <span>«{justAdded}» به فاکتور اضافه شد</span>
        </div>
      )}

      <button type="button" className="cartbar-head" onClick={onToggle}>
        <span className="cartbar-head-count">{toFa(totalCount)} آیتم</span>
        <span className="cartbar-head-title">فاکتور شما</span>
        <span className={`cartbar-chevron ${expanded ? 'is-up' : ''}`}>⌃</span>
      </button>

      {expanded && (
        <div className="cartbar-list">
          {cart.map((e) => (
            <div className="cartbar-item" key={e.uid}>
              <button type="button" className="cartbar-remove" onClick={() => onRemove(e.uid)} aria-label="حذف">✕</button>
              <div className="cartbar-item-price">{formatToman(e.lineTotal)}</div>
              <div className="cartbar-item-info">
                <span className="cartbar-item-name">
                  {e.name} <span className="cartbar-item-qty">× {toFa(e.qty)}</span>
                </span>
                {e.isCustomPizza && e.options?.length > 0 ? (
                  <ul className="cartbar-custom-opts">
                    {e.options
                      .filter((o) => o.group !== '_build')
                      .map((o) => (
                        <li key={`${o.group}-${o.label}`}>
                          <span className="cartbar-custom-opt-group">{o.group}</span>
                          <span>{o.label}</span>
                        </li>
                      ))}
                  </ul>
                ) : e.options?.length > 0 ? (
                  <span className="cartbar-item-opts">
                    {e.options.filter((o) => o.group !== '_build').map((o) => o.label).join(' • ')}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cartbar-total">
        <span className="cartbar-total-label">جمع کل</span>
        <span className="cartbar-total-value">{formatToman(totalPrice)} <small>تومان</small></span>
      </div>

      <div className="cartbar-actions">
        <button type="button" className="cartbar-btn cartbar-btn--ghost" onClick={onContinue}>
          ادامه سفارش
        </button>
        <button type="button" className="cartbar-btn cartbar-btn--primary" onClick={onSelectTable}>
          انتخاب میز <span aria-hidden="true">←</span>
        </button>
      </div>
    </div>
  );
}

function FloravanLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 377.87 419.74" xmlns="http://www.w3.org/2000/svg">
      <path d="M306.35,152.01h-102.5c-11.35,0-20.59-9.23-20.59-20.59v-49.61c0-1.16-.95-2.11-2.11-2.11H82.22c-2.46,0-4.46-2-4.46-4.46v-8.51c0-2.46,2-4.46,4.46-4.46h101.52c10.42,0,18.9,8.48,18.9,18.9v49.35c0,2.23,1.82,4.05,4.05,4.05h99.66c2.34,0,4.25,1.91,4.25,4.25v8.93c0,2.34-1.91,4.25-4.25,4.25Z" fill="#fffcf2"/>
      <path d="M97.11,153.5h-10.02c-2.38,0-4.32-1.94-4.32-4.32v-35.97c0-10.56,8.59-19.15,19.15-19.15h58.84c2.38,0,4.32,1.94,4.32,4.32v8.79c0,2.38-1.94,4.32-4.32,4.32h-57.56c-.98,0-1.77,.8-1.77,1.77v35.91c0,2.38-1.94,4.32-4.32,4.32Z" fill="#fffcf2"/>
      <path d="M303.74,254.08h-104.23c-8.95,0-16.24-7.28-16.24-16.24v-51.07c0-1.57-1.28-2.85-2.85-2.85H102.82c-.76,0-1.38,.62-1.38,1.38v50.28c0,1.01,.82,1.83,1.83,1.83h57.05c2.45,0,4.44,1.99,4.44,4.44v7.79c0,2.45-1.99,4.44-4.44,4.44h-59.32c-10.04,0-18.21-8.17-18.21-18.21v-63.61c0-2.42,1.97-4.38,4.38-4.38h95.18c11.2,0,20.3,9.11,20.3,20.3v47.02c0,.96,.78,1.75,1.75,1.75h84.18c.68,0,1.23-.55,1.23-1.23v-49.54c0-1.25-1.01-2.26-2.26-2.26h-69.72c-2.38,0-4.32-1.93-4.33-4.31l-.03-7.4c0-1.16,.44-2.25,1.26-3.07,.82-.82,1.91-1.27,3.06-1.27h72.39c9.91,0,17.96,8.06,17.96,17.96v63.82c0,2.43-1.98,4.41-4.41,4.41Z" fill="#fffcf2"/>
      <path d="M198.2,350.93h-59.79c-9.88,0-17.92-8.04-17.92-17.92v-23.79c0-2.35,1.91-4.27,4.27-4.27h57.18c.74,0,1.34-.6,1.34-1.34v-18.86c0-.92-.75-1.67-1.67-1.67H102.8c-.75,0-1.37,.61-1.37,1.37v62.01c0,2.47-2.01,4.47-4.47,4.47h-9.71c-2.47,0-4.47-2.01-4.47-4.47v-74.44c0-2.41,1.96-4.37,4.37-4.37h95.91c10.8,0,19.59,8.79,19.59,19.59v29.12c0,2.39-1.95,4.34-4.34,4.34h-57.43c-.7,0-1.27,.57-1.27,1.27v9.97c0,1.04,.84,1.88,1.88,1.88h56.89c2.35,0,4.27,1.92,4.27,4.27v8.41c0,2.45-1.99,4.44-4.44,4.44Z" fill="#fffcf2"/>
      <path d="M298.63,350.93h-79.76c-1.03,0-1.86-.83-1.86-1.86v-13.2c0-1.03,.83-1.86,1.86-1.86h31.02v-38.37c-1.49,1.43-3.14,2.5-5.01,3.23-3.15,1.24-5.36,1.73-7.87,1.75-.16,0-.31,0-.47,.02-.23,.01-.45,.03-.69,.02-2.8,0-5.56-.01-8.33-.02-2.76,0-5.52-.02-8.33-.02-1.04,0-1.88-.84-1.88-1.88v-12.56c0-1.04,.84-1.88,1.88-1.88h13.2c4.4,0,8.49-1.76,11.21-4.82,.2-.22,.39-.45,.58-.69,3.37-4.29,3.31-9.07,3.13-10.92-.05-.53,.12-1.05,.48-1.44,.36-.39,.86-.62,1.39-.62h17.77c1.04,0,1.88,.84,1.88,1.88v66.75h29.81c1.04,0,1.88,.85,1.88,1.88v12.72c0,1.04-.85,1.89-1.88,1.89Z" fill="#eb5e28"/>
    </svg>
  );
}

/* Overlay-style product card (unified for every category) */
function ProductCard({ item, onSelect, index = 0, domId }) {
  const pricing = getItemPricing(item);
  return (
    <article
      id={domId}
      className="fmenu-card"
      style={{ '--card-index': index }}
      onClick={() => onSelect()}
    >
      <div className="fmenu-card-media">
        <img src={item.image} alt={item.nameFA} className="fmenu-card-img" loading="lazy" />
        <div className="fmenu-card-scrim" />
      </div>

      {pricing.hasDiscount && (
        <span className="fmenu-card-disc">{toFa(pricing.discount)}٪</span>
      )}

      <div className="fmenu-card-content">
        <h3 className="fmenu-card-name">
          {item.nameFA}
          {item.name && <span className="fmenu-card-name-en"> | {item.name}</span>}
        </h3>
        {item.desc && <p className="fmenu-card-desc">{item.desc}</p>}

        <div className="fmenu-card-foot">
          <div className="fmenu-card-price">
            {pricing.hasDiscount && (
              <span className="fmenu-card-old">{pricing.originalLabel}</span>
            )}
            <span className="fmenu-card-amount">{pricing.finalLabel}</span>
            <span className="fmenu-card-unit">تومان</span>
          </div>

          <button
            type="button"
            className="fmenu-card-btn"
            aria-label={`مشاهده ${item.nameFA}`}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

const FLORAVAN_SECTION_ID = 'floravan-picks';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItems, floravanSpecials } = useMenu();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(categoryId);

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showTableMap, setShowTableMap] = useState(false);
  const [dialogItems, setDialogItems] = useState([]);
  const [dialogIndex, setDialogIndex] = useState(0);

  const [cart, setCart] = useState([]);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const builderHandledRef = useRef(false);

  const sectionRefs = useRef({});
  const pillRefs = useRef({});
  const navRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  /* categories in canonical order (empty ones stay visible so new categories appear in the nav) */
  const sections = useMemo(() => {
    const categorySections = menuCategories
      .map((cat) => {
        const data = menuItems[cat.id];
        if (!data) return null;
        const items = (data.items ?? []).filter((it) => it.available);
        return { ...cat, title: data.title ?? cat.name, items };
      })
      .filter(Boolean);

    /* "به پیشنهاد فلوروان" pinned to the very top */
    if (floravanSpecials.length > 0) {
      return [
        {
          id: FLORAVAN_SECTION_ID,
          name: 'پیشنهاد فلوروان',
          title: 'به پیشنهاد فلوروان',
          icon: null,
          items: floravanSpecials,
          isPicks: true,
        },
        ...categorySections,
      ];
    }
    return categorySections;
  }, [menuItems, floravanSpecials]);

  /* search across the ACTIVE section only, so the sticky bar keeps meaning */
  const displaySections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (it) =>
            it.nameFA.includes(query) ||
            it.name.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [sections, query]);

  const openDialog = (items, idx) => {
    setDialogItems(items);
    setDialogIndex(idx);
    setShowProductDialog(true);
  };

  const handleAddToCart = useCallback((entry) => {
    const uid = cartSignature(entry);
    setCart((prev) => {
      const found = prev.find((e) => e.uid === uid);
      if (found) {
        return prev.map((e) =>
          e.uid === uid
            ? { ...e, qty: e.qty + entry.qty, lineTotal: e.lineTotal + entry.lineTotal }
            : e
        );
      }
      return [...prev, { ...entry, uid }];
    });
    setShowProductDialog(false);
    setCartExpanded(true);
    setJustAdded(entry.name);
    window.clearTimeout(window.__florCartToast);
    window.__florCartToast = window.setTimeout(() => setJustAdded(null), 2600);
  }, []);

  /* accept custom pizza(s) built on /menu/custom-pizza */
  useEffect(() => {
    if (!location.state?.fromBuilder) return;

    const batchId = location.state?.builderBatchId;
    const items = location.state?.pendingCartItems
      ?? (location.state?.pendingCartItem ? [location.state.pendingCartItem] : []);

    if (items.length === 0) return;

    if (batchId) {
      const key = `flor-builder-${batchId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } else if (builderHandledRef.current) {
      return;
    } else {
      builderHandledRef.current = true;
    }

    items.forEach((item) => handleAddToCart(item));
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate, handleAddToCart]);

  const handleRemoveFromCart = (uid) => {
    setCart((prev) => {
      const next = prev.filter((e) => e.uid !== uid);
      if (next.length === 0) setCartExpanded(false);
      return next;
    });
  };

  const handleGoToTable = () => {
    if (cart.length === 0) return;
    setShowTableMap(true);
  };

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    isProgrammaticScroll.current = true;
    setActiveCat(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => { isProgrammaticScroll.current = false; }, 700);
  }, []);

  /* jump to the chosen category (or a specific deep-linked item) on first mount */
  useEffect(() => {
    if (sections.length === 0) return;

    const focus = location.state?.focus; // { sectionId, itemId }
    isProgrammaticScroll.current = true;

    if (focus?.itemId != null) {
      const sectionId = focus.sectionId || categoryId;
      const cardEl = document.getElementById(`item-${sectionId}-${focus.itemId}`);
      const target = cardEl || sectionRefs.current[sectionId] || sectionRefs.current[categoryId];
      if (target) {
        target.scrollIntoView({ block: 'center' });
        setActiveCat(sectionId);
        if (cardEl) {
          cardEl.classList.add('fmenu-card--flash');
          window.setTimeout(() => cardEl.classList.remove('fmenu-card--flash'), 1600);
        }
      }
    } else if (categoryId && sectionRefs.current[categoryId]) {
      sectionRefs.current[categoryId].scrollIntoView({ block: 'start' });
      setActiveCat(categoryId);
    }

    window.setTimeout(() => { isProgrammaticScroll.current = false; }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);

  /* scroll-spy: highlight the section currently in view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveCat(visible[0].target.dataset.catid);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [displaySections]);

  /* keep the active pill visible inside the horizontal bar */
  useEffect(() => {
    const pill = pillRefs.current[activeCat];
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCat]);

  const hasCategory = Boolean(menuItems[categoryId]);

  if (!hasCategory) {
    return (
      <div className="cat-root cat-notfound">
        <p>دسته‌بندی پیدا نشد</p>
        <button onClick={() => navigate('/menu')}>بازگشت به منو</button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="cat-root">
      {showProductDialog && dialogItems.length > 0 && (
        <ProductDialog
          items={dialogItems}
          index={dialogIndex}
          onAdd={handleAddToCart}
          onClose={() => setShowProductDialog(false)}
        />
      )}

      {showTableMap && (
        <div className="dialog-overlay" onClick={() => setShowTableMap(false)}>
          <div className="dialog-box dialog-box--wide" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-close" onClick={() => setShowTableMap(false)}>✕</button>
            <TableMap
              items={cart}
              onComplete={() => {
                setCart([]);
                setCartExpanded(false);
                setJustAdded(null);
                setShowTableMap(false);
              }}
            />
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="cat-header">
        <button
          type="button"
          className="cat-header-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="منو"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <FloravanLogo className="cat-logo" />

        <button
          type="button"
          className="cat-header-btn"
          onClick={() => document.getElementById('cat-search')?.focus()}
          aria-label="جستجو"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </header>

      {/* ── STICKY HORIZONTAL CATEGORY BAR ── */}
      <nav className="cat-nav" ref={navRef} aria-label="دسته‌بندی‌ها">
        <div className="cat-nav-track">
          {sections.map((cat) => (
            <button
              key={cat.id}
              type="button"
              ref={(el) => { pillRefs.current[cat.id] = el; }}
              className={`cat-pill ${activeCat === cat.id ? 'is-active' : ''} ${cat.isPicks ? 'cat-pill--picks' : ''}`}
              onClick={() => scrollToSection(cat.id)}
            >
              <span className="cat-pill-text">{cat.name}</span>
              {cat.isPicks ? (
                <span className="cat-pill-star" aria-hidden="true">★</span>
              ) : (
                cat.icon && <img src={cat.icon} alt="" className="cat-pill-icon" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── SEARCH ── */}
      <div className="cat-search-wrap">
        <svg className="cat-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="cat-search"
          className="cat-search"
          type="text"
          placeholder="جستجو در منو..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className="cat-search-clear" onClick={() => setQuery('')} aria-label="پاک کردن">
            ✕
          </button>
        )}
      </div>

      {/* ── UNIFIED SECTIONED MENU ── */}
      <main className="cat-main">
        {displaySections.length === 0 ? (
          <div className="cat-empty">
            <p>موردی یافت نشد</p>
            <button type="button" onClick={() => setQuery('')}>پاک کردن جستجو</button>
          </div>
        ) : (
          displaySections.map((sec) => (
            <section
              key={sec.id}
              data-catid={sec.id}
              ref={(el) => { sectionRefs.current[sec.id] = el; }}
              className="cat-section"
            >
              <div className="cat-divider" aria-hidden="true">
                <span className="cat-divider-line" />
                <span className="cat-divider-text">{sec.title}</span>
                <span className="cat-divider-line" />
              </div>

              <div className="cat-grid">
                {sec.items.map((item, i) => (
                  <ProductCard
                    key={`${sec.id}-${item.id}`}
                    domId={`item-${sec.id}-${item.id}`}
                    item={item}
                    onSelect={() => openDialog(sec.items, i)}
                    index={i}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ── SIDE DRAWER ── */}
      {menuOpen && (
        <div className="cat-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="cat-drawer" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cat-drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
            <button type="button" className="cat-drawer-link" onClick={() => { setMenuOpen(false); navigate('/menu'); }}>
              دسته‌بندی‌ها
            </button>
            <button type="button" className="cat-drawer-link" onClick={() => { setMenuOpen(false); navigate('/'); }}>
              صفحه اصلی
            </button>
          </nav>
        </div>
      )}

      {/* ── BOTTOM INVOICE BAR ── */}
      {cart.length > 0 && !showTableMap && (
        <CartBar
          cart={cart}
          justAdded={justAdded}
          expanded={cartExpanded}
          onToggle={() => setCartExpanded((v) => !v)}
          onContinue={() => { setCartExpanded(false); setJustAdded(null); }}
          onSelectTable={handleGoToTable}
          onRemove={handleRemoveFromCart}
        />
      )}
    </div>
  );
}
