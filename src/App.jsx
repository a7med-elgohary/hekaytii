import React, { useEffect, useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import heroSideImg from './assets/Gemini_Generated_Image_32tvnl32tvnl32tv.png';
import uploadPhotoImg from './assets/upload_photo.png';
import chooseInterestImg from './assets/choose_interest.png';
import aiGeneratesImg from './assets/ai_generates_boy.png';
import childReadsImg from './assets/child_reads.png';
import team1Img from './assets/team_1.png';
import team2Img from './assets/team_2.png';
import team3Img from './assets/team_3.png';
import aboutImg from './assets/hero3.png';
import HomeParallaxImg from './assets/Home.png';
import dreamyStarsImg from "./assets/dreamy_stars.png";
import bookPage1 from './assets/book_page_1.png';
import bookPage2 from './assets/book_page_2.png';
import './App.css';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const libraryBooks = [
    {
      id: 1,
      title: "مغامرات الفضاء",
      coverImg: bookPage1,
      pages: [bookPage2, chooseInterestImg, HomeParallaxImg, dreamyStarsImg]
    },
    {
      id: 2,
      title: "أبطال المستقبل",
      coverImg: aiGeneratesImg,
      pages: [childReadsImg, team1Img, uploadPhotoImg, team3Img]
    },
    {
      id: 3,
      title: "قصص خيالية",
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
        let dstY = viewH / 2 + 140;
        if (bookLabelRef.current) {
          const lRect = bookLabelRef.current.getBoundingClientRect();
          dstX = lRect.left + lRect.width / 2;
          dstY = lRect.bottom + 250; // Stack rests prominently below text
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
    { name: "Mariev Ashea", role: "Flutter Developer", img: team2Img },
    { name: "Reem Albadwy", role: "AI Engineer", img: team2Img },
    { name: "Basmala Elshabrawy", role: "Backend Developer", img: team2Img },
    { name: "Heba Tarek", role: "Flutter Developer", img: team2Img },
    { name: "Ahmed Elgohary", role: "Backend Developer", img: team1Img },
    { name: "Omar Kamal", role: "Business Analyst", img: team3Img },
    { name: "Abdulrahman Shalan", role: "Business Analyst", img: team3Img },
    { name: "Ali Sakr", role: "AI Engineer", img: team1Img },
    { name: "Mohamed Kardosha", role: "AI Engineer", img: team3Img }
  ];

  // Repeat inner pages to make the book feel thicker.
  const activeBookPages = selectedBook
    ? Array.from({ length: 3 }, () => selectedBook.pages).flat()
    : [];

  const testimonials = [
    {
      rating: "5.0",
      text: "بنتي كانت بتمل من القراءة بسرعة، لكن بعد حكايتي بقت كل يوم تطلب قصة جديدة وتقرأها للنهاية بحماس.",
      sourceLabel: "عرض التعليق الأصلي",
      sourceUrl: "https://www.instagram.com/",
      name: "أم ليان",
      city: "الرياض",
      img: team1Img,
    },
    {
      rating: "4.9",
      text: "الفكرة مبدعة جدًا، القصة مناسبة لعمر الطفل ومكتوبة عربي بشكل جميل. التطبيق فعلاً وفر علينا وقت كبير.",
      sourceLabel: "عرض التعليق الأصلي",
      sourceUrl: "https://www.facebook.com/",
      name: "أبو يزن",
      city: "جدة",
      img: team2Img,
    },
    {
      rating: "5.0",
      text: "أكثر شيء عجبني إن ابني هو بطل القصة فعلًا، وده خلّاه متعلق بالقراءة وبيتكلم عن القصص طول اليوم.",
      sourceLabel: "عرض التعليق الأصلي",
      sourceUrl: "https://www.linkedin.com/",
      name: "أم راكان",
      city: "القاهرة",
      img: team3Img,
    },
  ];

  return (
    <div className="app-container dynamic-gradient-bg">
      {/* NAVBAR */}
      <header className={`navbar ${isNavScrolled ? 'scrolled' : ''} ${isNavVisible ? 'visible' : 'hidden'}`}>
        <div className="navbar-logo">
          <div className="logo-icon">
            <span className="logo-h">ح</span>
          </div>
          <span className="logo-text">حكايتي</span>
        </div>

        <nav id="mobile-nav" className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>من نحن</a>
          <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>المميزات</a>
          <a href="#create" className="nav-link" onClick={() => setMobileMenuOpen(false)}>الأسعار</a>
          <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>تواصل معنا</a>
        </nav>

        <div className="navbar-actions">
          <a href="#create" className="btn btn-primary rounded-pill">ابدأ بابتكار قصة</a>
          <a href="#demo-video" className="btn btn-outline rounded-pill flex-center">
            شاهد العرض <span className="play-icon">▶</span>
          </a>
        </div>

        <button
          type="button"
          className="burger-menu"
          aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="hero-section">
        {/* Left: Image */}
        <div className="hero-image-side reveal-scale">
          <img src={heroSideImg} alt="حكايتي - طفل يقرأ قصته" className="hero-side-img magical-float" />
        </div>

        {/* Right: Text Content */}
        <div className="hero-content reveal-up">
          <h1 className="hero-title-ar">
            إجعل طفلك بطلاً <br />
            <span className="text-gradient">لقصته الخاصة</span>
          </h1>
          <p className="hero-desc">
            حكايتي هو دليلك لعالم من السحر والخيال، تطبيق مدعوم بالذكاء الاصطناعي
            يحول صورة طفلك إلى قصة أطفال عربية مخصصة يكون فيها طفلك هو البطل.
          </p>

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
            <span>🚀 قريباً جداً <span className="marquee-star">✦</span> ترقبوا الإطلاق <span className="marquee-star">✦</span> جهزوا أطفالكم لعالم الخيال <span className="marquee-star">✦</span></span>
            <span>🚀 قريباً جداً <span className="marquee-star">✦</span> ترقبوا الإطلاق <span className="marquee-star">✦</span> جهزوا أطفالكم لعالم الخيال <span className="marquee-star">✦</span></span>
            <span>🚀 قريباً جداً <span className="marquee-star">✦</span> ترقبوا الإطلاق <span className="marquee-star">✦</span> جهزوا أطفالكم لعالم الخيال <span className="marquee-star">✦</span></span>
            <span>🚀 قريباً جداً <span className="marquee-star">✦</span> ترقبوا الإطلاق <span className="marquee-star">✦</span> جهزوا أطفالكم لعالم الخيال <span className="marquee-star">✦</span></span>
          </div>
        </div>
        <div className="about-container">
          <div className="about-content reveal-up">
            <h2 className="section-title about-title">عن <span className="text-gradient">تطبيق حكايتي</span></h2>
            <p className="about-desc">
              تطبيق حكايتي هو المنصة الأولى التي تدمج بين خيال الأطفال وقوة الذكاء الاصطناعي لإنشاء قصص فريدة من نوعها. نهدف إلى تغيير طريقة تفاعل الأطفال مع القصص وتحويل وقت الشاشة إلى تجربة قراءة تفاعلية وممتعة. نجعل كل طفل المبتكر والملهم وبطل قصته!
            </p>
            <a href="#how-it-works" className="btn btn-outline rounded-pill about-btn">اكتشف المزيد</a>
          </div>
          <div className="about-image-wrapper reveal-scale">
            <img src={aboutImg} alt="عن حكايتي" className="about-main-img magical-float" />
          </div>
        </div>
      </section>

      {/* PARALLAX SEPARATOR SECTION */}
      <section className="parallax-separator reveal-up" style={{ backgroundImage: `url(${HomeParallaxImg})` }}>
        <div className="parallax-content">
          <h2>حيث يتحول الخيال إلى حقيقة</h2>
          <p>امنح طفلك فرصة ليكون بطل كل يوم جديد</p>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="how-section" ref={howSectionRef}>
        <div className="section-header reveal-up">
          <h2 className="section-title">كيف <span className="text-gradient">يعمل التطبيق</span></h2>
          <p className="section-subtitle">رحلة سحرية من 4 خطوات تحول طفلك إلى بطل حكايته الأولى</p>
        </div>

        <div className="cards-fan">

          <div className="fan-card fan-card-1 reveal-scale">
            <div className="fan-card-img">
              <img src={uploadPhotoImg} alt="ارفع صورة طفلك" />
            </div>
            <div className="fan-card-num">١</div>
            <div className="fan-card-body">
              <h3>ارفع صورة طفلك</h3>
              <p>اختر صورة واضحة ليبني الذكاء الاصطناعي شخصيته الكرتونية.</p>
            </div>
          </div>

          <div className="fan-arrow">←</div>

          <div className="fan-card fan-card-2 reveal-scale">
            <div className="fan-card-img">
              <img src={chooseInterestImg} alt="اختر الاهتمامات" />
            </div>
            <div className="fan-card-num">٢</div>
            <div className="fan-card-body">
              <h3>اختر الاهتمامات</h3>
              <p>فضاء، ديناصورات، سحر؟ أنت تحدد مسار المغامرة.</p>
            </div>
          </div>

          <div className="fan-arrow">←</div>

          <div className="fan-card fan-card-3 reveal-scale">
            <div className="fan-card-img">
              <img src={aiGeneratesImg} alt="الذكاء يبتكر" />
            </div>
            <div className="fan-card-num">٣</div>
            <div className="fan-card-body">
              <h3>الذكاء يبتكر</h3>
              <p>في ثوانٍ ينسج نظامنا قصة ورسوميات بطلها طفلك.</p>
            </div>
          </div>

          <div className="fan-arrow">←</div>

          <div className="fan-card fan-card-4 reveal-scale">
            <div className="fan-card-img fan-card-img-book">
              <div className="mini-book-preview" ref={miniBookRef} style={{ width: '55px', height: '75px', margin: '0 auto', background: 'transparent' }}>
                {/* Empty placeholder for the flying books */}
              </div>
            </div>
            <div className="fan-card-num">٤</div>
            <div className="fan-card-body">
              <h3>طفلك يقرأ</h3>
              <p>استلم القصة جاهزة واجعل طفلك يعيش متعة القراءة.</p>
            </div>
          </div>

        </div>
      </section>


      {/* SCROLL-ZOOM BOOK SECTION — gives scroll space */}
      <div id="interactive-book" className="scroll-zoom-container" ref={scrollZoomRef}>
        <div className="scroll-zoom-sticky">
          <div className="scroll-zoom-label" ref={bookLabelRef}>
            <h2 className="section-title">مكتبة <span className="text-gradient">السحر</span></h2>
            <p className="section-subtitle">إليك لمحة عن القصص المذهلة — مرِّر الماوس فوق الكتب واضغط لتصفحها</p>
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
            aria-label={`افتح قصة ${book.title}`}
            onClick={() => setSelectedBook(book)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedBook(book);
              }
            }}
          >
            <div className="bookshelf-cover-wrapper" style={{ width: '100%', height: '100%' }}>
              <img src={book.coverImg} alt={book.title} className="bookshelf-cover-img" />
              <div className="bookshelf-overlay">
                <h3 className="bookshelf-book-title">{book.title}</h3>
                <button type="button" className="read-btn">اقرأ الآن</button>
              </div>
            </div>
          </div>
        ))}
      </div>



      <section className="parallax-separator reveal-up" style={{ backgroundImage: `url(${dreamyStarsImg})` }}>
        <div className="parallax-content">
          <h2>وراء كل قصة.. فريق يؤمن بالسحر</h2>
          <p>تعرف على المبدعين الذين رسموا البصمة الأولى في ذكريات أطفالكم</p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="reviews-section">
        <div className="section-header reveal-up">
          <h2 className="section-title">آراء <span className="text-gradient">العملاء</span></h2>
          <p className="section-subtitle">تجارب حقيقية من أولياء أمور استخدموا حكايتي مع أطفالهم</p>
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
                  <img src={item.img} alt={`صورة ${item.name}`} className="reviewer-img" />
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
            <h2 className="demo-title">عرض توضيحي</h2>
            <h3 className="demo-subtitle">يوسف وطفلك الساحرة</h3>
            <p className="demo-desc">
              شاهد كيف يتفاعل يوسف مع قصته المخصصة. تجربة ساحرة تجعل القراءة ممتعة وملهمة.
            </p>
          </div>
          <div className="demo-video-wrapper">
            <img src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80" alt="عرض توضيحي" className="demo-video-poster" />
            <button type="button" className="play-button-overlay" aria-label="تشغيل العرض التوضيحي">
              <span className="play-btn-circle" aria-hidden="true">▶</span>
            </button>
          </div>
        </div>
      </section>

      {/* TEAM SECTION (3D Hover Effect + Marquee) */}
      <section id="team" className="team-section">
        <div className="section-header reveal-up">
          <h2 className="section-title">فريق <span className="text-gradient">العمل</span></h2>
          <p className="section-subtitle">المبدعون الذين جعلوا عالم حكايتي السحري حقيقة</p>
        </div>

        <div className="team-marquee-wrapper" dir="ltr">
          {/* Track 1 */}
          <div className="team-marquee-track">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={`track1-${index}`}>
                <div className="team-card-bg">
                  <img src={member.img} alt={`${member.name} مسطح`} className="team-img-flat" />
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </div>
                <img src={member.img} alt={`${member.name} واقف`} className="team-img-stand" />
              </div>
            ))}
          </div>

          {/* Track 2 (Duplicate for seamless loop) */}
          <div className="team-marquee-track" aria-hidden="true">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={`track2-${index}`}>
                <div className="team-card-bg">
                  <img src={member.img} alt={`${member.name} مسطح`} className="team-img-flat" />
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </div>
                <img src={member.img} alt={`${member.name} واقف`} className="team-img-stand" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="create" className="cta-section">
        <div className="cta-box reveal-up">
          <h2>جاهز تبدأ قصة طفلك؟</h2>
          <p>اختر نمط القصة، حمّل صورة طفلك، وخلال ثوانٍ تحصل على قصة عربية مخصصة.</p>
          <div className="cta-buttons">
            <a href="#demo-video" className="btn btn-primary rounded-pill">شاهد العرض أولاً</a>
            <a href="#contact" className="btn btn-outline rounded-pill">تواصل مع الفريق</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon">ح</div>
            <span className="logo-text">حكايتي</span>
            <p className="footer-brand-desc">
              نصنع لطفلك ذكريات لا تُنسى من خلال قصص مخصصة بتقنيات الذكاء الاصطناعي لتنمية خياله وحبه للقراءة.
            </p>
          </div>

          <div className="footer-links">
            <h4>روابط هامة</h4>
            <ul>
              <li><a href="#about">من نحن</a></li>
              <li><a href="#how-it-works">كيف يعمل التطبيق</a></li>
              <li><a href="#testimonials">آراء العملاء</a></li>
              <li><a href="#create">ابدأ الآن</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>تواصل معنا</h4>
            <div className="social-icons">
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                <img src="https://cdn.simpleicons.org/linkedin/4b5563" alt="" className="social-icon-img" />
              </a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="social-icon" aria-label="X">
                <img src="https://cdn.simpleicons.org/x/4b5563" alt="" className="social-icon-img" />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                <img src="https://cdn.simpleicons.org/instagram/4b5563" alt="" className="social-icon-img" />
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="social-icon" aria-label="Facebook">
                <img src="https://cdn.simpleicons.org/facebook/4b5563" alt="" className="social-icon-img" />
              </a>
            </div>
          </div>

          <div className="footer-download">
            <h4>حمل التطبيق</h4>
            <div className="store-buttons">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="footer-store-badge" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="footer-store-badge" />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>جميع الحقوق محفوظة © 2026 حكايتي</p>
          <div className="footer-bottom-links">
            <a href="#contact">الشروط والأحكام</a>
            <a href="#contact">سياسة الخصوصية</a>
          </div>
        </div>
      </footer>

      {selectedBook && (
        <div
          className="book-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`قراءة قصة ${selectedBook.title}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBook(null);
            }
          }}
        >
          <div className="book-modal-content">
            <button
              type="button"
              className="book-modal-close"
              onClick={() => setSelectedBook(null)}
            >
              إغلاق
            </button>

            <div className="modal-flipbook-container">
              <HTMLFlipBook
                width={420}
                height={560}
                size="fixed"
                minWidth={420}
                maxWidth={420}
                minHeight={560}
                maxHeight={560}
                showCover
                usePortrait={false}
                drawShadow
                maxShadowOpacity={0.45}
                showPageCorners
                flippingTime={900}
                className="real-flipbook"
                mobileScrollSupport
              >
                <Page key={`${selectedBook.id}-cover`}>
                  <div className="book-cover-solid">
                    <img src={selectedBook.coverImg} alt={selectedBook.title} className="cover-image-bg" />
                    <div className="cover-overlay">
                      <h2 className="cover-title">{selectedBook.title}</h2>
                    </div>
                  </div>
                </Page>
                {activeBookPages.map((pageImg, pageIndex) => (
                  <Page key={`${selectedBook.id}-page-${pageIndex}`}>
                    <img src={pageImg} alt={`صفحة ${pageIndex + 1} من ${selectedBook.title}`} className="page-image" />
                  </Page>
                ))}
                <Page key={`${selectedBook.id}-back-cover`}>
                  <div className="book-cover-solid">
                    <img src={selectedBook.coverImg} alt={`الغلاف الخلفي - ${selectedBook.title}`} className="cover-image-bg" />
                    <div className="cover-overlay">
                      <h2 className="cover-title">النهاية</h2>
                    </div>
                  </div>
                </Page>
              </HTMLFlipBook>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
