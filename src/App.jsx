import React, { useEffect, useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate, useLocation } from 'react-router-dom';
import heroSideImg from './assets/Gemini_Generated_Image_32tvnl32tvnl32tv.png';
import heroSideImgEN from './assets/heroimageinEN.png';
import uploadPhotoImg from './assets/upload_photo.png';
import chooseInterestImg from './assets/choose_interest.png';
import aiGeneratesImg from './assets/ai_generates_boy.png';
import childReadsImg from './assets/child_reads.png';
import team1Img from './assets/team_1.png';
import team2Img from './assets/team_2.png';
import team3Img from './assets/team_3.png';
import aboutImg from './assets/hero3.png';
import ahmedElgoharyCartoon from './assets/ahmed_elgohary_cartoon.png';
import basmalaCartoon from './assets/basmala_cartoon.png';
import abdulrahmanCartoon from './assets/abdulrahman_cartoon.png';
import aliCartoon from './assets/ali_cartoon.png';
import hebaCartoon from './assets/heba_cartoon.png';
import omarCartoon from './assets/omar_cartoon.png';
import reemCartoon from './assets/reem_cartoon.png';
import marievCartoon from './assets/mariev_cartoon.png';
import mohamedCartoon from './assets/mohamed_cartoon.png';
import quizStepImg from './assets/quiz_step.png';
import HomeParallaxImg from './assets/Home.png';
import dreamyStarsImg from "./assets/dreamy_stars.png";
import bookPage1 from './assets/book_page_1.png';
import bookPage2 from './assets/book_page_2.png';
import logoImg from './assets/lOGO.PNG';
import './App.css';
import { APP_TRANSLATIONS } from './translations.js';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="demoPage" ref={ref}>
      <div className="page-content" style={{ width: '100%', height: '100%' }}>
        {props.children}
      </div>
    </div>
  );
});



export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (location.state?.newBook) {
      setSelectedBook(location.state.newBook);
      // Clean up the state so it doesn't reopen if the user refreshes the page
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const goToStoryCreator = (e) => { e?.preventDefault(); navigate('/create'); };
  const [isBookReady, setIsBookReady] = useState(false);

  const handleCloseBook = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBook(null);
      setIsClosing(false);
      setIsBookReady(false);
    }, 1500);
  };

  useEffect(() => {
    if (selectedBook && !isClosing) {
      const timer = setTimeout(() => setIsBookReady(true), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedBook, isClosing]);

  const libraryBooks = [
    {
      id: 1,
      title: lang === 'ar' ? "مغامرات الفضاء" : "Space Adventures",
      coverImg: bookPage1,
      pages: [bookPage2, chooseInterestImg, HomeParallaxImg, dreamyStarsImg]
    },
    {
      id: 2,
      title: lang === 'ar' ? "أبطال المستقبل" : "Future Heroes",
      coverImg: aiGeneratesImg,
      pages: [childReadsImg, team1Img, uploadPhotoImg, team3Img]
    },
    {
      id: 3,
      title: lang === 'ar' ? "قصص خيالية" : "Fantasy Tales",
      coverImg: childReadsImg,
      pages: [aboutImg, team2Img, heroSideImg, bookPage1]
    }
  ];

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const rafId = useRef(null);
  const scrollZoomRef = useRef(null);
  const howSectionRef = useRef(null);
  const fixedBookRef = useRef(null);
  const miniBookRef = useRef(null);
  const bookLabelRef = useRef(null);

  useEffect(() => {
    const updateOnScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNavScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;

      // ─── Fixed book: driven by scroll INTO the scroll-zoom-container ───
      if (miniBookRef.current && fixedBookRef.current && scrollZoomRef.current) {
        const mRect = miniBookRef.current.getBoundingClientRect();
        const cRect = scrollZoomRef.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        const viewW = window.innerWidth;

        const srcX = mRect.left + mRect.width / 2;
        const srcY = mRect.top + mRect.height / 2;
        const miniScale = mRect.width / 220; // Changed base from 560 to 220 (book width)

        // Destination: center of the label text + offset
        let dstX = viewW / 2;
        let dstY = viewH / 2 + 80;
        if (bookLabelRef.current) {
          const lRect = bookLabelRef.current.getBoundingClientRect();
          dstX = lRect.left + lRect.width / 2;
          dstY = lRect.bottom + 230; // Pushed down further (previously 140)
        }

        // ── Progress tied to how much user scrolled INTO the section ──
        const scrolledIn = viewH - cRect.top;        // 0 at section entry
        const animRange = cRect.height * 1.1;        // slower: complete over longer scroll distance
        const rawProgress = scrolledIn / animRange;
        const progress = Math.min(Math.max(rawProgress, 0), 1);

        // Ease in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

        const howRect = howSectionRef.current?.getBoundingClientRect();
        const hasPassedHowSection = !howRect || howRect.bottom <= viewH * 0.6;

        // Keep books pinned over step-4 card until user scrolls past "How it works".
        if (!hasPassedHowSection || cRect.top > viewH + 50) {
          fixedBookRef.current.style.opacity = '1';
          fixedBookRef.current.style.left = `${srcX}px`;
          fixedBookRef.current.style.top = `${srcY}px`;
          fixedBookRef.current.style.transform = `translate(-50%, -50%) scale(${miniScale})`;
          fixedBookRef.current.style.pointerEvents = 'none';
          fixedBookRef.current.classList.remove('landed');
          miniBookRef.current.style.opacity = '0';

          // Section fully scrolled past — hide book
        } else if (cRect.bottom < -50) {
          fixedBookRef.current.style.opacity = '0';
          fixedBookRef.current.style.pointerEvents = 'none';

        } else {
          const hasReachedDestination = progress >= 0.95;
          if (hasReachedDestination) {
            fixedBookRef.current.style.left = `${dstX}px`;
            fixedBookRef.current.style.top = `${dstY}px`;
            fixedBookRef.current.style.transform = `translate(-50%, -50%) scale(1)`;
            fixedBookRef.current.style.opacity = '1';
            fixedBookRef.current.style.pointerEvents = 'all';
            fixedBookRef.current.classList.add('landed');
            miniBookRef.current.style.opacity = '0';

          } else {
            const cx = srcX + (dstX - srcX) * eased;
            const cy = srcY + (dstY - srcY) * eased;
            const scale = miniScale + (1 - miniScale) * eased;

            fixedBookRef.current.style.left = `${cx}px`;
            fixedBookRef.current.style.top = `${cy}px`;
            fixedBookRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
            fixedBookRef.current.style.opacity = '1';
            fixedBookRef.current.style.pointerEvents = 'none';
            fixedBookRef.current.classList.remove('landed');

            miniBookRef.current.style.opacity = '0';
          }
        }
      }

    };

    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        updateOnScroll();
        rafId.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Call immediately to set initial position before the first scroll
    setTimeout(updateOnScroll, 50);

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-up, .reveal-scale");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedBook) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedBook(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedBook]);

  const teamMembers = [
    { name: "Mariev Ashea", role: lang === 'ar' ? "مطور فلاتر (Flutter)" : "Flutter Developer", img: marievCartoon, linkedin: "https://www.linkedin.com/in/mariev-asheaa-85220b2b3/" },
    { name: "Reem Albadwy", role: lang === 'ar' ? "مهندس ذكاء اصطناعي" : "AI Engineer", img: reemCartoon, linkedin: "https://www.linkedin.com/in/reem-albadwy-944262266/" },
    { name: "Basmala Elshabrawy", role: lang === 'ar' ? "مطور خلفية برمجية" : "Backend Developer", img: basmalaCartoon, linkedin: "https://www.linkedin.com/in/basmala-mohammed-bb8131252/" },
    { name: "Heba Tarek", role: lang === 'ar' ? "مطور فلاتر (Flutter)" : "Flutter Developer", img: hebaCartoon, linkedin: "https://www.linkedin.com/in/heba-tarek-cce/" },
    { name: "Ahmed Elgohary", role: lang === 'ar' ? "مطور خلفية برمجية" : "Backend Developer", img: ahmedElgoharyCartoon, linkedin: "https://www.linkedin.com/in/ahmed-elgohary7" },
    { name: "Omar Kamal", role: lang === 'ar' ? "محلل أعمال" : "Business Analyst", img: omarCartoon, linkedin: "https://www.linkedin.com/in/omarkamal204/" },
    { name: "Abdulrahman Shalan", role: lang === 'ar' ? "محلل أعمال" : "Business Analyst", img: abdulrahmanCartoon, linkedin: "https://www.linkedin.com/in/shalan1/" },
    { name: "Ali Sakr", role: lang === 'ar' ? "مهندس ذكاء اصطناعي" : "AI Engineer", img: aliCartoon, linkedin: "https://www.linkedin.com/in/ali-monir-sakr/" },
    { name: "Mohamed Kardosha", role: lang === 'ar' ? "مهندس ذكاء اصطناعي" : "AI Engineer", img: mohamedCartoon, linkedin: "https://www.linkedin.com/in/mohamedkardosha/" }
  ];

  // Repeat inner pages to make the book feel thicker.
  const activeBookPages = selectedBook
    ? Array.from({ length: 3 }, () => selectedBook.pages).flat()
    : [];

  const testimonials = [
    {
      rating: "5.0",
      text: lang === 'ar'
        ? "بنتي كانت بتمل من القراءة بسرعة، لكن بعد حكايتي بقت كل يوم تطلب قصة جديدة وتقرأها للنهاية بحماس."
        : "My daughter used to get bored of reading quickly, but after Hekayti, she asks for a new story every day and reads it to the end with excitement.",
      sourceLabel: lang === 'ar' ? "عرض التعليق الأصلي" : "View Original Comment",
      sourceUrl: "https://www.instagram.com/",
      name: lang === 'ar' ? "أم ليان" : "Um Layan",
      city: lang === 'ar' ? "الرياض" : "Riyadh",
      img: team1Img,
    },
    {
      rating: "4.9",
      text: lang === 'ar'
        ? "الفكرة مبدعة جدًا، القصة مناسبة لعمر الطفل ومكتوبة عربي بشكل جميل. التطبيق فعلاً وفر علينا وقت كبير."
        : "The idea is highly creative, the story is age-appropriate and beautifully written. The app saved us a lot of time.",
      sourceLabel: lang === 'ar' ? "عرض التعليق الأصلي" : "View Original Comment",
      sourceUrl: "https://www.facebook.com/",
      name: lang === 'ar' ? "أبو يزن" : "Abu Yazan",
      city: lang === 'ar' ? "جدة" : "Jeddah",
      img: team2Img,
    },
    {
      rating: "5.0",
      text: lang === 'ar'
        ? "أكثر شيء عجبني إن ابني هو بطل القصة فعلًا، وده خلّاه متعلق بالقراءة وبيتكلم عن القصص طول اليوم."
        : "What I liked most is that my son is truly the hero of the story, which kept him attached to reading and talking about the stories all day.",
      sourceLabel: lang === 'ar' ? "عرض التعليق الأصلي" : "View Original Comment",
      sourceUrl: "https://www.linkedin.com/",
      name: lang === 'ar' ? "أم راكان" : "Um Rakan",
      city: lang === 'ar' ? "القاهرة" : "Cairo",
      img: team3Img,
    },
  ];

  const t = APP_TRANSLATIONS[lang];

  return (
    <div className="app-container dynamic-gradient-bg">
      {/* NAVBAR */}
      <header className={`navbar ${isNavScrolled ? 'scrolled' : ''} ${isNavVisible ? 'visible' : 'hidden'}`}>
        <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="Hekayti Logo" className="logo-img" />
        </div>

        <nav id="mobile-nav" className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navAbout}</a>
          <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navHow}</a>
          <a href="#testimonials" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navReviews}</a>
          <a href="#team" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navTeam}</a>
          <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navContact}</a>
          {/* Mobile-only action buttons inside the full screen menu */}
          <div className="mobile-menu-buttons">
            <button type="button" className="btn btn-primary rounded-pill" onClick={(e) => { setMobileMenuOpen(false); goToStoryCreator(e); }}>{t.navCreate}</button>
            <a href="#demo-video" className="btn btn-outline rounded-pill flex-center" onClick={() => setMobileMenuOpen(false)}>
              {t.navDemo} <span className="play-icon">▶</span>
            </a>
          </div>
        </nav>

        {/* Desktop-only action buttons */}
        <div className="navbar-actions">
          <a href="#demo-video" className="btn btn-outline rounded-pill flex-center">
            {t.navDemo} <span className="play-icon">▶</span>
          </a>
          <button type="button" className="btn btn-primary rounded-pill" onClick={goToStoryCreator}>{t.navCreate}</button>
        </div>

        {/* Mobile Header Actions (Visible on mobile header) */}
        <div className="mobile-header-actions">
          <button
            type="button"
            className="btn btn-outline rounded-pill lang-toggle-btn"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          >
            {t.langToggle}
          </button>

          <button
            type="button"
            className={`burger-menu ${mobileMenuOpen ? 'open' : ''}`}
            aria-label={mobileMenuOpen ? (lang === 'ar' ? "إغلاق القائمة" : "Close Menu") : (lang === 'ar' ? "فتح القائمة" : "Open Menu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="hero-section">
        {/* Left: Image */}
        <div className="hero-image-side reveal-scale">
          <img src={lang === 'ar' ? heroSideImg : heroSideImgEN} alt={lang === 'ar' ? "حكايتي - طفل يقرأ قصته" : "Hekayti - Child reading story"} className="hero-side-img magical-float" />
        </div>

        {/* Right: Text Content */}
        <div className="hero-content reveal-up">
          <h1 className="hero-title-ar">
            {t.heroTitlePart1} <br />
            <span className="text-gradient">{t.heroTitlePart2}</span>
          </h1>
          <p className="hero-desc">{t.heroDesc}</p>

          <div className="hero-buttons shop-badges-only">
            <div className="badge-wrapper">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="store-badge" />
            </div>
            <div className="badge-wrapper">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="store-badge" />
            </div>
          </div>
        </div>
      </main>

      {/* ABOUT SECTION WITH INSIDE TRANSITION */}
      <section id="about" className="about-section">
        {/* TILTED MARQUEE TRANSITION */}
        <div className="tilted-marquee-transition">
          <div className="tilted-marquee-track">
            <span>{t.marqueeText}</span>
            <span>{t.marqueeText}</span>
            <span>{t.marqueeText}</span>
            <span>{t.marqueeText}</span>
          </div>
        </div>
        <div className="about-container">
          <div className="about-content reveal-up">
            <h2 className="section-title about-title">{lang === 'ar' ? <>عن <span className="text-gradient">تطبيق حكايتي</span></> : <>About <span className="text-gradient">Hekayti App</span></>}</h2>
            <p className="about-desc">{t.aboutDesc}</p>
            <a href="#how-it-works" className="btn btn-outline rounded-pill about-btn">{t.aboutMore}</a>
          </div>
          <div className="about-image-wrapper reveal-scale">
            <img src={aboutImg} alt={t.aboutTitle} className="about-main-img magical-float" />
          </div>
        </div>
      </section>

      {/* PARALLAX SEPARATOR SECTION */}
      <section className="parallax-separator reveal-up" style={{ backgroundImage: `url(${HomeParallaxImg})` }}>
        <div className="parallax-content">
          <h2>{t.parallaxTitle}</h2>
          <p>{t.parallaxDesc}</p>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="how-section" ref={howSectionRef}>
        <div className="section-header reveal-up">
          <h2 className="section-title">{lang === 'ar' ? <>كيف <span className="text-gradient">يعمل التطبيق</span></> : <>How <span className="text-gradient">It Works</span></>}</h2>
          <p className="section-subtitle">{t.howSubtitle}</p>
        </div>

        <div className="cards-fan">

          <div className="fan-card fan-card-1 reveal-scale">
            <div className="fan-card-img">
              <img src={uploadPhotoImg} alt={t.step1Title} />
            </div>
            <div className="fan-card-num">1</div>
            <div className="fan-card-body">
              <h3>{t.step1Title}</h3>
              <p>{t.step1Desc}</p>
            </div>
          </div>

          <div className="fan-arrow">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'en' ? 'rotate(180deg)' : 'none' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>

          <div className="fan-card fan-card-2 reveal-scale">
            <div className="fan-card-img">
              <img src={chooseInterestImg} alt={t.step2Title} />
            </div>
            <div className="fan-card-num">2</div>
            <div className="fan-card-body">
              <h3>{t.step2Title}</h3>
              <p>{t.step2Desc}</p>
            </div>
          </div>

          <div className="fan-arrow">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'en' ? 'rotate(180deg)' : 'none' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>

          <div className="fan-card fan-card-3 reveal-scale">
            <div className="fan-card-img">
              <img src={aiGeneratesImg} alt={t.step3Title} />
            </div>
            <div className="fan-card-num">3</div>
            <div className="fan-card-body">
              <h3>{t.step3Title}</h3>
              <p>{t.step3Desc}</p>
            </div>
          </div>

          <div className="fan-arrow">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'en' ? 'rotate(180deg)' : 'none' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>

          <div className="fan-card fan-card-4 reveal-scale">
            <div className="fan-card-img fan-card-img-book">
              <div className="mini-book-preview" ref={miniBookRef} style={{ width: '55px', height: '75px', margin: '0 auto', background: 'transparent' }}>
                {/* Empty placeholder for the flying books */}
              </div>
            </div>
            <div className="fan-card-num">4</div>
            <div className="fan-card-body">
              <h3>{t.step4Title}</h3>
              <p>{t.step4Desc}</p>
            </div>
          </div>

          <div className="fan-arrow">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'en' ? 'rotate(180deg)' : 'none' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </div>

          <div className="fan-card fan-card-5 reveal-scale">
            <div className="fan-card-img">
              <img src={quizStepImg} alt={t.step5Title} />
            </div>
            <div className="fan-card-num">5</div>
            <div className="fan-card-body">
              <h3>{t.step5Title}</h3>
              <p>{t.step5Desc}</p>
            </div>
          </div>

        </div>
      </section>

      {/* SCROLL-ZOOM BOOK SECTION — gives scroll space */}
      <div id="library" className="scroll-zoom-container" ref={scrollZoomRef}>
        <div className="scroll-zoom-sticky">
          <div className="scroll-zoom-label" ref={bookLabelRef}>
            <h2 className="section-title">{lang === 'ar' ? <>مكتبة <span className="text-gradient">السحر</span></> : <>Library of <span className="text-gradient">Magic</span></>}</h2>
            <p className="section-subtitle">{t.librarySubtitle}</p>
          </div>

          <div className="click-hint">
            <div className="hand-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 11V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5" />
                <path d="M14 7v3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3" />
                <path d="M18 10v4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5a4 4 0 0 1-4 4h-7a6 6 0 0 1-6-6v-1.5" />
                <path d="M6 13V8.1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v11" />
              </svg>
              <div className="ripple"></div>
            </div>
            <span>{t.clickHint}</span>
          </div>
        </div>
      </div>

      {/* FLYING STACK OF 3 BOOKS */}
      <div className="fixed-flying-stack" ref={fixedBookRef}>
        {libraryBooks.map((book, idx) => (
          <div
            key={book.id}
            className={`stack-book stack-book-${idx + 1}`}
            role="button"
            tabIndex={0}
            aria-label={`Open story ${book.title}`}
            onClick={() => {
              // Temporarily disabled opening the book
              // setSelectedBook(book);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                // Temporarily disabled opening the book
                // setSelectedBook(book);
              }
            }}
          >
            <div className="bookshelf-cover-wrapper" style={{ width: '100%', height: '100%' }}>
              <img src={book.coverImg} alt={book.title} className="bookshelf-cover-img" />
              <div className="bookshelf-overlay">
                <h3 className="bookshelf-book-title">{book.title}</h3>
                <button type="button" className="read-btn">{t.readNow}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="parallax-separator reveal-up" style={{ backgroundImage: `url(${dreamyStarsImg})` }}>
        <div className="parallax-content">
          <h2>{t.teamHeaderTitle}</h2>
          <p>{t.teamHeaderDesc}</p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="reviews-section">
        <div className="section-header reveal-up">
          <h2 className="section-title">{lang === 'ar' ? <>آراء <span className="text-gradient">العملاء</span></> : <>Customer <span className="text-gradient">Reviews</span></>}</h2>
          <p className="section-subtitle">{t.reviewsSubtitle}</p>
        </div>

        <div className="reviews-marquee-wrapper" dir="ltr">
          <div className="reviews-marquee-track">
            {testimonials.map((item, index) => (
              <article className="review-card" key={`review-track1-${index}`}>
                <div className="stars">★★★★★ <span>{item.rating}</span></div>
                <p className="review-text">"{item.text}"</p>
                <a className="review-source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
                  {item.sourceLabel}
                </a>
                <div className="reviewer">
                  <img src={item.img} alt={`Photo of ${item.name}`} className="reviewer-img" />
                  <div className="reviewer-info">
                    <h4>{item.name}</h4>
                    <p>{item.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="reviews-marquee-track" aria-hidden="true">
            {testimonials.map((item, index) => (
              <article className="review-card" key={`review-track2-${index}`}>
                <div className="stars">★★★★★ <span>{item.rating}</span></div>
                <p className="review-text">"{item.text}"</p>
                <a className="review-source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
                  {item.sourceLabel}
                </a>
                <div className="reviewer">
                  <img src={item.img} alt="" className="reviewer-img" />
                  <div className="reviewer-info">
                    <h4>{item.name}</h4>
                    <p>{item.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo-video" className="demo-section">
        <div className="demo-container reveal-up">
          <div className="demo-content">
            <h2 className="demo-title">{t.demoTitle}</h2>
            <h3 className="demo-subtitle">{t.demoSubtitle}</h3>
            <p className="demo-desc">{t.demoDesc}</p>
          </div>
          <div className="demo-video-wrapper">
            <img src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80" alt="Demo Video" className="demo-video-poster" />
            <button type="button" className="play-button-overlay" aria-label={lang === 'ar' ? "تشغيل العرض التوضيحي" : "Play Demo"}>
              <span className="play-btn-circle" aria-hidden="true">▶</span>
            </button>
          </div>
        </div>
      </section>

      {/* TEAM SECTION (3D Hover Effect + Marquee) */}
      <section id="team" className="team-section">
        <div className="section-header reveal-up">
          <h2 className="section-title">{lang === 'ar' ? <>فريق <span className="text-gradient">العمل</span></> : <>Our <span className="text-gradient">Team</span></>}</h2>
          <p className="section-subtitle">{t.teamSubtitle}</p>
        </div>

        <div className="team-marquee-wrapper" dir="ltr">
          {/* Track 1 */}
          <div className="team-marquee-track">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={`track1-${index}`}>
                <div className="team-card-bg">
                  <a href={member.linkedin} className="team-social-link" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <img src={member.img} alt={`${member.name} flat`} className="team-img-flat" />
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </div>
                <img src={member.img} alt={`${member.name} standing`} className="team-img-stand" />
              </div>
            ))}
          </div>

          <div className="team-marquee-track" aria-hidden="true">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={`track2-${index}`}>
                <div className="team-card-bg">
                  <a href={member.linkedin} className="team-social-link" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <img src={member.img} alt={`${member.name} flat`} className="team-img-flat" />
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </div>
                <img src={member.img} alt={`${member.name} standing`} className="team-img-stand" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon">{lang === 'ar' ? 'ح' : 'H'}</div>
            <span className="logo-text">{lang === 'ar' ? 'حكايتي' : 'Hekayti'}</span>
            <p className="footer-brand-desc">{t.footerBrandDesc}</p>
          </div>

          <div className="footer-links">
            <h4>{t.footerImportantLinks}</h4>
            <ul>
              <li><a href="#about">{t.navAbout}</a></li>
              <li><a href="#how-it-works">{t.navHow}</a></li>
              <li><a href="#testimonials">{t.navReviews}</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>{t.navContact}</h4>
            <div className="social-icons">
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="social-icon linkedin" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="social-icon x-twitter" aria-label="X">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="social-icon instagram" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://www.facebook.com/share/1E8TxEBuhj/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="social-icon facebook" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-download">
            <h4>{t.footerDownloadApp}</h4>
            <div className="store-buttons">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="footer-store-badge" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="footer-store-badge" />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.footerCopyright}</p>
          <div className="footer-bottom-links">
            <a href="#contact">{t.footerTerms}</a>
            <a href="#contact">{t.footerPrivacy}</a>
          </div>
        </div>
      </footer>

      {selectedBook && (
        <div
          className={`book-modal-overlay ${isClosing ? 'is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? `قراءة قصة ${selectedBook.title}` : `Read story ${selectedBook.title}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseBook();
            }
          }}
        >
          <div className="book-modal-content">
            <div className="modal-flipbook-container">
              {isBookReady && (
                <HTMLFlipBook
                  key={selectedBook.id}
                  width={420}
                  height={560}
                  size="fixed"
                  minWidth={420}
                  maxWidth={420}
                  minHeight={560}
                  maxHeight={560}
                  showCover={false}
                  usePortrait={false}
                  drawShadow
                  maxShadowOpacity={0.45}
                  showPageCorners
                  flippingTime={900}
                  className="real-flipbook"
                  mobileScrollSupport
                >
                  {activeBookPages.map((pageImg, pageIndex) => (
                    <Page key={`${selectedBook.id}-page-${pageIndex}`}>
                      <img src={pageImg} alt={`Page ${pageIndex + 1} of ${selectedBook.title}`} className="page-image" />
                    </Page>
                  ))}
                </HTMLFlipBook>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

