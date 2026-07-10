import { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import './HomePage.css';

function WhiteLogo({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 377.87 419.74">
      <path d="M306.35,152.01h-102.5c-11.35,0-20.59-9.23-20.59-20.59v-49.61c0-1.16-.95-2.11-2.11-2.11H82.22c-2.46,0-4.46-2-4.46-4.46v-8.51c0-2.46,2-4.46,4.46-4.46h101.52c10.42,0,18.9,8.48,18.9,18.9v49.35c0,2.23,1.82,4.05,4.05,4.05h99.66c2.34,0,4.25,1.91,4.25,4.25v8.93c0,2.34-1.91,4.25-4.25,4.25ZM82.22,65.29c-.81,0-1.46,.66-1.46,1.46v8.51c0,.81,.66,1.46,1.46,1.46h98.94c2.82,0,5.11,2.29,5.11,5.11v49.61c0,9.7,7.89,17.59,17.59,17.59h102.5c.69,0,1.25-.56,1.25-1.25v-8.93c0-.69-.56-1.25-1.25-1.25h-99.66c-3.89,0-7.05-3.16-7.05-7.05v-49.35c0-8.77-7.13-15.9-15.9-15.9H82.22Z" fill="#fffcf2"/>
      <path d="M97.11,153.5h-10.02c-2.38,0-4.32-1.94-4.32-4.32v-35.97c0-10.56,8.59-19.15,19.15-19.15h58.84c2.38,0,4.32,1.94,4.32,4.32v8.79c0,2.38-1.94,4.32-4.32,4.32h-57.56c-.98,0-1.77,.8-1.77,1.77v35.91c0,2.38-1.94,4.32-4.32,4.32Zm4.81-56.44c-8.91,0-16.15,7.25-16.15,16.15v35.97c0,.73,.59,1.32,1.32,1.32h10.02c.73,0,1.32-.59,1.32-1.32v-35.91c0-2.63,2.14-4.77,4.77-4.77h57.56c.73,0,1.32-.59,1.32-1.32v-8.79c0-.73-.59-1.32-1.32-1.32h-58.84Z" fill="#fffcf2"/>
      <path d="M303.74,254.08h-104.23c-8.95,0-16.24-7.28-16.24-16.24v-51.07c0-1.57-1.28-2.85-2.85-2.85H102.82c-.76,0-1.38,.62-1.38,1.38v50.28c0,1.01,.82,1.83,1.83,1.83h57.05c2.45,0,4.44,1.99,4.44,4.44v7.79c0,2.45-1.99,4.44-4.44,4.44h-59.32c-10.04,0-18.21-8.17-18.21-18.21v-63.61c0-2.42,1.97-4.38,4.38-4.38h95.18c11.2,0,20.3,9.11,20.3,20.3v47.02c0,.96,.78,1.75,1.75,1.75h84.18c.68,0,1.23-.55,1.23-1.23v-49.54c0-1.25-1.01-2.26-2.26-2.26h-69.72c-2.38,0-4.32-1.93-4.33-4.31l-.03-7.4c0-1.16,.44-2.25,1.26-3.07,.82-.82,1.91-1.27,3.06-1.27h72.39c9.91,0,17.96,8.06,17.96,17.96v63.82c0,2.43-1.98,4.41-4.41,4.41ZM102.82,180.93h77.6c3.23,0,5.85,2.62,5.85,5.85v51.07c0,7.3,5.94,13.24,13.24,13.24h104.23c.78,0,1.41-.63,1.41-1.41v-63.82c0-8.25-6.71-14.96-14.96-14.96h-72.39c-.35,0-.69,.14-.94,.39-.25,.25-.39,.59-.39,.94l.03,7.4c0,.73,.6,1.32,1.33,1.32h69.72c2.9,0,5.26,2.36,5.26,5.26v49.54c0,2.33-1.9,4.23-4.23,4.23h-84.18c-2.62,0-4.75-2.13-4.75-4.75v-47.02c0-9.54-7.76-17.3-17.3-17.3H87.16c-.76,0-1.38,.62-1.38,1.38v63.61c0,8.38,6.82,15.21,15.21,15.21h59.32c.79,0,1.44-.64,1.44-1.44v-7.79c0-.79-.64-1.44-1.44-1.44h-57.05c-2.66,0-4.83-2.17-4.83-4.83v-50.28c0-2.42,1.97-4.38,4.38-4.38Z" fill="#fffcf2"/>
      <path d="M198.2,350.93h-59.79c-9.88,0-17.92-8.04-17.92-17.92v-23.79c0-2.35,1.91-4.27,4.27-4.27h57.18c.74,0,1.34-.6,1.34-1.34v-18.86c0-.92-.75-1.67-1.67-1.67H102.8c-.75,0-1.37,.61-1.37,1.37v62.01c0,2.47-2.01,4.47-4.47,4.47h-9.71c-2.47,0-4.47-2.01-4.47-4.47v-74.44c0-2.41,1.96-4.37,4.37-4.37h95.91c10.8,0,19.59,8.79,19.59,19.59v29.12c0,2.39-1.95,4.34-4.34,4.34h-57.43c-.7,0-1.27,.57-1.27,1.27v9.97c0,1.04,.84,1.88,1.88,1.88h56.89c2.35,0,4.27,1.92,4.27,4.27v8.41c0,2.45-1.99,4.44-4.44,4.44Zm-73.45-42.98c-.7,0-1.27,.57-1.27,1.27v23.79c0,8.23,6.7,14.92,14.92,14.92h59.79c.79,0,1.44-.65,1.44-1.44v-8.41c0-.7-.57-1.27-1.27-1.27h-56.89c-2.69,0-4.88-2.19-4.88-4.88v-9.97c0-2.35,1.91-4.27,4.27-4.27h57.43c.74,0,1.34-.6,1.34-1.34v-29.12c0-9.15-7.44-16.59-16.59-16.59H87.14c-.75,0-1.37,.61-1.37,1.37v74.44c0,.81,.66,1.47,1.47,1.47h9.71c.81,0,1.47-.66,1.47-1.47v-62.01c0-2.41,1.96-4.37,4.37-4.37h78.79c2.58,0,4.67,2.1,4.67,4.67v18.86c0,2.39-1.95,4.34-4.34,4.34h-57.18Z" fill="#fffcf2"/>
    </svg>
  );
}

function OrangeLogo({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 377.87 419.74">
      <path d="M298.63,350.93h-79.76c-1.03,0-1.86-.83-1.86-1.86v-13.2c0-1.03,.83-1.86,1.86-1.86h31.02v-38.37c-1.49,1.43-3.14,2.5-5.01,3.23-3.15,1.24-5.36,1.73-7.87,1.75-.16,0-.31,0-.47,.02-.23,.01-.45,.03-.69,.02-2.8,0-5.56-.01-8.33-.02-2.76,0-5.52-.02-8.33-.02-1.04,0-1.88-.84-1.88-1.88v-12.56c0-1.04,.84-1.88,1.88-1.88h13.2c4.4,0,8.49-1.76,11.21-4.82,.2-.22,.39-.45,.58-.69,3.37-4.29,3.31-9.07,3.13-10.92-.05-.53,.12-1.05,.48-1.44,.36-.39,.86-.62,1.39-.62h17.77c1.04,0,1.88,.84,1.88,1.88v66.75h29.81c1.04,0,1.88,.85,1.88,1.88v12.72c0,1.04-.85,1.89-1.88,1.89Zm-78.63-3h77.51v-10.49h-29.85c-1.01,0-1.84-.83-1.84-1.84v-66.79h-15.46c.07,2.7-.4,7.47-3.83,11.83-.23,.29-.46,.57-.69,.83-3.29,3.7-8.19,5.83-13.45,5.83h-12.08v10.32c2.42,0,4.82,.01,7.21,.02,2.76,0,5.52,.02,8.32,.02,.15,.01,.36,0,.54-.02,.2,0,.39-.02,.58-.02,2.11-.02,4.02-.45,6.8-1.54,2.21-.87,4.08-2.34,5.7-4.51,.49-.66,1.34-.92,2.12-.66,.78,.26,1.3,.98,1.3,1.8v42.3c0,1.1-.9,2-2,2h-30.88v10.92Z" fill="#eb5e28"/>
    </svg>
  );
}

function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-bar" ref={barRef} />
    </div>
  );
}

const NAV_LINKS = [
  { href: '#about', label: 'درباره ما' },
  { href: '#why-floravan', label: 'چرا فلوروان' },
  { href: '#popular-gallery', label: 'منوی محبوب' },
  { href: '#reviews', label: 'نظرات' },
  { href: '#map', label: 'نقشه' },
  { href: '#contact', label: 'تماس' },
];

function Navbar() {
  const navRef = useRef(null);
  const lastScrollY = useRef(0);
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', y > 60);
      }

      // اسکرول به پایین → مخفی، اسکرول به بالا → نمایش
      if (y > 320 && y > lastScrollY.current + 4) {
        setIsHidden(true);
        setMenuOpen(false);
      } else if (y < lastScrollY.current - 4 || y < 120) {
        setIsHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar-shell ${isHidden ? 'nav-hidden' : ''}`}>
      <nav className={`navbar ${menuOpen ? 'menu-open' : ''}`} ref={navRef}>
        <a href="#" className="nav-logo" aria-label="فلوروان">
          <WhiteLogo className="nav-svg white" />
          <OrangeLogo className="nav-svg orange" />
        </a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`nav-mobile-panel ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            style={{ transitionDelay: menuOpen ? `${0.06 + i * 0.05}s` : '0s' }}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}


function Hero() {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  // پارالاکس ملایم هنگام اسکرول: بک‌گراند آهسته‌تر حرکت می‌کند و محتوا محو می‌شود
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      const h = window.innerHeight || 1;
      if (y <= h * 1.2) {
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0003})`;
        }
        if (contentRef.current) {
          const fade = Math.max(0, 1 - y / (h * 0.85));
          contentRef.current.style.opacity = fade;
          // محتوا به سمت بالا می‌رود تا زیر گرادیانت پایین هیرو نرود
          contentRef.current.style.transform = `translateY(${y * -0.12}px)`;
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" ref={bgRef}>
        <img src="/src/assets/pictures/bg-hero.jpg" alt="" className="hero-bg-img" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content" ref={contentRef}>
        <div className="hero-left">
          <p className="hero-eyebrow flex items-center gap-3">
            <span className="h-[1px] w-8 bg-orange-500/50 inline-block"></span>
            کــافه رستوران
          </p>
          <h1 className="hero-title">فلـوروان</h1>
          <p className="hero-sub typewriter-text">یک تجربه دوست داشتنی...</p>
          <button onClick={() => navigate('/menu')} className="hero-btn">
            منو کافه رستوران <span>←</span>
          </button>
        </div>
        <div className="hero-logo-wrap">
          <div className="hero-logo-container">
            <div className="neon-sign">
              <WhiteLogo className="hero-svg white-logo" />
              <OrangeLogo className="hero-svg orange-logo" />
            </div>
          </div>
        </div>
      </div>
      <a href="#about" className="hero-scroll-hint" aria-label="اسکرول به پایین">
        <span className="scroll-mouse"><span className="scroll-wheel" /></span>
        <span className="scroll-hint-text">اسکرول کنید</span>
      </a>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="about">
      <div className="about-inner">
        <div className="about-text reveal reveal-right">
          <span className="section-label">داستان ما</span>
          <h2>فلوروان، جایی که<br/><em>طعم</em> حرف می‌زند</h2>
          <p>فلوروان ۲۱ در قلب محمدیه قزوین، فضایی است که هر جزئیاتش با دقت چیده شده — از قهوه‌ای که با دست برشته می‌شود تا استیک‌هایی که روی زغال پخته می‌شوند. اینجا نه یک کافه‌ی معمولی است، نه یک رستوران ساده. یک تجربه است.</p>
          <div className="about-stats reveal-stagger">
            <div className="stat"><strong>۱</strong><span>شماره ما</span></div>
            <div className="stat"><strong>+80</strong><span>آیتم منو</span></div>
            <div className="stat"><strong>۷ روز</strong><span>در هفته</span></div>
          </div>
        </div>
        <div className="about-img-wrap reveal reveal-left">
          <img src="/src/assets/pictures/cafe-1.jpg" alt="فضای داخلی فلوروان" />
          <div className="about-img-accent" />
        </div>
      </div>
    </section>
  );
}
function WhyFloravan() {
  return (
    <section className="why-floravan" id="why-floravan">
      <div className="why-floravan-inner">
        {/* ۱. حالا اول عکس رو می‌ذاریم که چون کل صفحه RTL هست، می‌ره سمت راست */}
        <div className="why-floravan-image reveal reveal-right">
          <img src="/src/assets/pictures/cafe-2.jpg" alt="چرا فلوروان" />
          <div className="why-floravan-accent"></div>
        </div>

        {/* ۲. متن‌ها می‌رن سمت چپ */}
        <div className="why-floravan-text reveal reveal-left">
          <span className="section-label">ویژگی ما</span>
          <h2>چرا فلوروان؟</h2>
          <p>
            فلوروان فقط یک کافه‌رستوران نیست؛ جایی‌ست برای تجربه‌ی طعمی متفاوت در
            فضایی آرام، شیک و به‌یادماندنی. ما با استفاده از مواد اولیه باکیفیت،
            سرو حرفه‌ای و توجه به جزئیات، تلاش می‌کنیم هر بار حضورتان به تجربه‌ای
            دلنشین تبدیل شود.
          </p>

          <div className="why-features reveal-stagger">
            <div className="why-feature-item">
              <strong>مواد اولیه تازه</strong>
              <span>کیفیتی که در هر سفارش احساس می‌شود</span>
            </div>

            <div className="why-feature-item">
              <strong>فضای گرم و مدرن</strong>
              <span>مناسب دورهمی، قرارهای دوستانه و لحظه‌های خاص</span>
            </div>

            <div className="why-feature-item">
              <strong>منوی متنوع و خاص</strong>
              <span>از نوشیدنی‌های جذاب تا غذاهای محبوب و حرفه‌ای</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function PopularGallery() {
  const { popularItems } = useMenu();

  const items = popularItems.map((item) => ({
    title: item.nameFA || item.name,
    desc: item.desc,
    image: item.image,
  }));

  return (
    <section className="popular-gallery" id="popular-gallery">
      <div className="popular-gallery-head reveal">
        <span className="section-label">منوی محبوب</span>
        <h2>غذاهای پرطرفدار</h2>
        <p>
          انتخاب‌هایی که بیشتر از همه سفارش داده می‌شوند و به بخشی از تجربه‌ی
          همیشگی مهمان‌های فلوروان تبدیل شده‌اند.
        </p>
      </div>

      <div className="popular-gallery-grid reveal-stagger">
        {items.map((item, index) => (
          <div className="popular-card" key={`${item.title}-${index}`}>
            {/* اینجا از تصویرِ همان آبجکت استفاده می‌کنیم */}
            <img src={item.image} alt={item.title} />
            <div className="popular-card-overlay">
              <h3>{item.title}</h3>
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}




// ... (بقیه کامپوننت‌ها مثل Navbar و Hero دست‌نخورده باقی بماند)

const Reviews = () => {
  const baseReviews = [
    { id: 1, name: "حسین محمدی", order: "پیتزا سیر و استیک + نوشابه", text: "واقعا عالی بود، نون پیتزا ترد و گوشت ها کاملا مغزپخت شده بودن. حتما دوباره سفارش میدم." },
    { id: 2, name: "سارا احمدی", order: "پاستا آلفردو + سالاد سزار", text: "سس پاستا خیلی غلیظ و خوشمزه بود. حجم غذا هم نسبت به قیمت خیلی مناسب بود." },
    { id: 3, name: "رضا کریمی", order: "همبرگر مخصوص + سیب زمینی", text: "بهترین برگری که توی این منطقه خوردم. نون تازه و گوشت با کیفیت. دمتون گرم!" },
    { id: 4, name: "مریم حسینی", order: "جوجه کباب + برنج ایرانی", text: "طعم کباب ها عالی بود، بوی زعفران کاملا حس می شد. ارسال هم خیلی سریع انجام شد." },
    { id: 5, name: "محمد پارسا", order: "لازانیا + سالاد فصل", text: "هم بسته بندی خیلی مرتب بود هم کیفیت غذا عالی. لازانیا داغ رسید و پنیرش فوق العاده بود." },
    { id: 6, name: "الهام نیکزاد", order: "پیتزا مخصوص + سیب زمینی ویژه", text: "مواد اولیه تازه بود و طعم سس مخصوص خیلی جذاب شده بود. یکی از بهترین سفارش هایی بود که داشتم." },
    { id: 7, name: "نیما شریفی", order: "استیک مرغ + پاستا", text: "حجم غذا زیاد و کیفیتش هم بالا بود. خیلی کم پیش میاد هر دو با هم اینقدر خوب باشن." },
    { id: 8, name: "فاطمه یوسفی", order: "برگر قارچ و پنیر + نوشابه", text: "برگر خیلی آبدار و خوش طعم بود. نون هم تازه بود و اصلا حس غذای فست و بی کیفیت نداشت." }
  ];

  const loopCount = 3; 
  const reviews = Array.from({ length: loopCount }, () => baseReviews).flat();

  const middleStart = baseReviews.length;          
  const middleEnd = middleStart + baseReviews.length - 1; 

  const [activeIndex, setActiveIndex] = useState(middleStart);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide(activeIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const goToSlide = (targetIndex) => {
    setIsAnimating(true);
    setActiveIndex(targetIndex);
  };

  useEffect(() => {
    if (!isAnimating) return;
    if (activeIndex > middleEnd) {
      setTimeout(() => {
        setIsAnimating(false);
        setActiveIndex((prev) => prev - baseReviews.length);
      }, 850); 
    } else if (activeIndex < middleStart) {
      setTimeout(() => {
        setIsAnimating(false);
        setActiveIndex((prev) => prev + baseReviews.length);
      }, 850);
    }
  }, [activeIndex, isAnimating, baseReviews.length, middleStart, middleEnd]);

  useEffect(() => {
    if (!isAnimating) {
      const id = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isAnimating]);

  const visibleIndex = (idx) => ((idx - middleStart) % baseReviews.length + baseReviews.length) % baseReviews.length;

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Customer Reviews</span>
          <h2>نظرات مشتریان</h2>
        </div>

        <div className="reviews-stage">
          <div
            className="reviews-track"
            style={{
              // تغییر اصلی: محاسبه دقیق جابجایی برای وسط‌چین ماندن کارت اکتیو
              // در حالت RTL، مقدار باید مثبت باشد تا به سمت چپ برود
              transform: `translateX(calc(${activeIndex} * (var(--card-width) + var(--card-gap))))`,
              transitionDuration: isAnimating ? "0.85s" : "0s",
            }}
          >
            {reviews.map((review, index) => {
              // منطق جدید کلاس‌ها: تمام قبلی‌ها کج، تمام بعدی‌ها کج
              let stateClass = "";
              if (index === activeIndex) {
                stateClass = "is-active";
              } else if (index < activeIndex) {
                stateClass = "is-prev";
              } else {
                stateClass = "is-next";
              }

              return (
                <article
                  key={`${review.id}-${index}`}
                  className={`review-showcase-card ${stateClass}`}
                  onClick={() => goToSlide(index)}
                >
                  <div className="review-card-top">
                    <span className="order-tag">سفارش: {review.order}</span>
                    <span className="review-stars">★★★★★</span>
                  </div>
                  <p className="review-copy">"{review.text}"</p>
                  <div className="review-footer">
                    <span className="review-name">{review.name}</span>
                    <span className="verified-badge">مشتری تایید شده ✓</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="slider-dots">
          {baseReviews.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${visibleIndex(activeIndex) === i ? "active" : ""}`}
              onClick={() => goToSlide(middleStart + i)}
              aria-label={`رفتن به نظر ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ... (بقیه کامپوننت‌ها مثل MapSection و Footer دست‌نخورده باقی بماند)



function MapSection() {
  return (
    <section className="map-section reveal" id="map">
      <div className="section-header">
        <span className="section-label">موقعیت مکانی</span>
        <h2>پیدامون کنید</h2>
        <p className="map-address">📍 قزوین، محمدیه، کاج ۱۹</p>
      </div>
      <div className="map-wrap">
        <iframe
          title="موقعیت فلوروان"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.5!2d49.9711!3d36.1021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDA2JzA3LjYiTiA0OcKwNTgnMTUuOSJF!5e0!3m2!1sfa!2sir!4v1234567890"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="map-pin-card">
          <div className="map-pin-dot" />
          <div>
            <strong>فلوروان ۲۱</strong>
            <p>قزوین، محمدیه، کاج ۱۹</p>
            <span>هر روز ۱۰ صبح تا ۱۲ شب</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.7 3.3c.3-.13.63.14.57.47l-2.9 15.9c-.06.35-.46.51-.75.31l-4.6-3.2-2.4 2.35c-.26.25-.7.14-.8-.2l-1.66-5.2-4.9-1.66c-.38-.13-.4-.66-.03-.81L21.7 3.3zM9.85 13.4l.9 3.55 1.4-1.4-2.3-2.15zm9.5-7.7-9.3 6.4 3.35 3.1 5.95-9.5z" />
    </svg>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="contact-info reveal reveal-right">
          <span className="section-label">ارتباط با ما</span>
          <h2>وجود شما، اعتبار ما</h2>
          <p>
            نظرات و پیشنهادهای شما چراغ راه فلوروان است؛ اگر ایده‌ای برای بهتر
            شدن تجربه‌تان دارید یا نکته‌ای به چشم‌تان آمده، خوشحال می‌شویم
            برایمان بنویسید. تک‌تک پیام‌ها را با دقت می‌خوانیم.
          </p>
          <div className="contact-details">
            <div className="contact-item"><span className="contact-icon">📞</span><span>۰۲۸-۳۲۲۴۰۰۰۰</span></div>
            <div className="contact-item"><span className="contact-icon">📍</span><span>قزوین، محمدیه، کاج ۱۹</span></div>
            <div className="contact-item"><span className="contact-icon">🕐</span><span>هر روز ۱۰ صبح تا ۱۲ شب</span></div>
          </div>
          <div className="social-links">
            <a href="#" className="social-icon-btn instagram" aria-label="اینستاگرام فلوروان" title="اینستاگرام">
              <InstagramIcon />
            </a>
            <a href="#" className="social-icon-btn telegram" aria-label="تلگرام فلوروان" title="تلگرام">
              <TelegramIcon />
            </a>
          </div>
        </div>
        <form className="contact-form-wrap reveal reveal-left" onSubmit={(e) => e.preventDefault()}>
          <div className="contact-form-head">
            <strong>ثبت پیشنهاد و نظر</strong>
            <span>پاسخ‌گویی در کمتر از ۲۴ ساعت</span>
          </div>
          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="contact-name">نام و نام خانوادگی</label>
              <input id="contact-name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-phone">شماره تماس</label>
              <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required />
            </div>
          </div>
          <div className="contact-field">
            <label htmlFor="contact-topic">موضوع پیام</label>
            <select id="contact-topic" name="topic" defaultValue="suggestion">
              <option value="suggestion">پیشنهاد و انتقاد</option>
              <option value="reserve">رزرو میز</option>
              <option value="order">پیگیری سفارش</option>
              <option value="other">سایر موارد</option>
            </select>
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">متن پیام</label>
            <textarea id="contact-message" name="message" rows="4" required />
          </div>
          <button type="submit" className="contact-submit">
            ارسال پیام <span className="contact-submit-arrow">←</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo-wrap">
        <WhiteLogo className="footer-svg white" />
        <OrangeLogo className="footer-svg orange" />
      </div>
      <p>© ۱۴۰۳ فلوروان ۲۱ — تمامی حقوق محفوظ است</p>
    </footer>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
          } else if (e.boundingClientRect.top > 0) {
            // وقتی المان دوباره پایین ویوپورت رفت، مخفی شود تا با اسکرول
            // بعدی دوباره انیمیشن ورودش دیده شود
            e.target.classList.remove('revealed');
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  useScrollReveal();
  return (
    <div className="floravan-app" dir="rtl">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <About />
      <WhyFloravan />
      <PopularGallery />
      <Reviews />
      <MapSection />
      <Contact />
      <Footer />
    </div>
  );
}
