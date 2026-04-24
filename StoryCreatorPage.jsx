import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';
import './StoryCreatorPage.css';

import bookPage1 from './assets/book_page_1.png';

/* ─────────────────── constants ─────────────────── */
const TOPICS = [
  { id: 'space',     emoji: '🚀', label: 'الفضاء', color: '#3b82f6' },
  { id: 'dinosaurs', emoji: '🦕', label: 'ديناصورات', color: '#10b981' },
  { id: 'magic',     emoji: '🧙‍♂️', label: 'السحر', color: '#8b5cf6' },
  { id: 'ocean',     emoji: '🐬', label: 'المحيط', color: '#06b6d4' },
  { id: 'jungle',    emoji: '🦁', label: 'الغابة', color: '#f59e0b' },
  { id: 'heroes',    emoji: '🦸', label: 'الأبطال', color: '#ef4444' },
  { id: 'robots',    emoji: '🤖', label: 'الروبوتات', color: '#64748b' },
  { id: 'animals',   emoji: '🐾', label: 'الحيوانات', color: '#d946ef' },
];

const LENGTHS = [
  { id: 'short',  emoji: '📖', label: 'قصيرة',  desc: 'حوالي 5 دقائق قراءة'  },
  { id: 'medium', emoji: '📚', label: 'متوسطة', desc: 'حوالي 10 دقائق قراءة' },
  { id: 'long',   emoji: '📕', label: 'طويلة',  desc: 'حوالي 15 دقيقة قراءة' },
];

/* ─────────────────── step meta ─────────────────── */
const STEPS = [
  { id: 1, icon: '👤', title: 'بيانات بطلنا', desc: 'من هو بطل هذه المغامرة؟' },
  { id: 2, icon: '🎯', title: 'عالم القصة', desc: 'أين ستدور أحداث المغامرة؟' },
  { id: 3, icon: '📏', title: 'طول الرحلة', desc: 'كم من الوقت ستستغرق القصة؟' },
  { id: 4, icon: '📸', title: 'صورة البطل', desc: 'لنرى وجه بطلنا الشجاع' },
];

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="demoPage" ref={ref}>
      <div className="page-content" style={{ width: '100%', height: '100%' }}>
        {props.children}
      </div>
    </div>
  );
});

export default function StoryCreatorPage() {
  const navigate = useNavigate();

  /* ── state ── */
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    name:    '',
    age:     '',
    gender:  '',
    topic:   '',
    length:  '',
    photo:   null,
    photoPreview: null,
  });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [readingBook, setReadingBook] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isBookReady, setIsBookReady] = useState(false);

  /* ── refs ── */
  const mainContentRef = useRef(null);
  const illustrationRef = useRef(null);

  /* ── mount animation ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (illustrationRef.current) {
      gsap.fromTo(illustrationRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  /* ── validation ── */
  const validate = useCallback(() => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim())    e.name   = 'نسيت كتابة اسم البطل!';
      if (!form.age || form.age < 3 || form.age > 12) e.age = 'اختر عمراً مناسباً';
      if (!form.gender)         e.gender = 'هل هو ولد أم بنت؟';
    }
    if (step === 2 && !form.topic)  e.topic  = 'يجب اختيار عالم القصة!';
    if (step === 3 && !form.length) e.length = 'حدد طول القصة التي تفضلها';
    return e;
  }, [step, form]);

  const handleNext = useCallback(() => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (mainContentRef.current) {
      gsap.to(mainContentRef.current, { x: -80, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
        setStep(s => s + 1);
        gsap.fromTo(mainContentRef.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
      }});
    } else {
      setStep(s => s + 1);
    }
  }, [validate]);

  const handleBack = useCallback(() => {
    setErrors({});
    if (mainContentRef.current) {
      gsap.to(mainContentRef.current, { x: 80, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
        setStep(s => s - 1);
        gsap.fromTo(mainContentRef.current, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
      }});
    } else {
      setStep(s => s - 1);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photo: file, photoPreview: ev.target.result }));
    reader.readAsDataURL(file);
  }, []);

  const updateForm = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(er => { const n = { ...er }; delete n[key]; return n; });
  }, []);

  const handleCloseBook = () => {
    setIsClosing(true);
    setTimeout(() => {
      setReadingBook(null);
      setIsClosing(false);
      setIsBookReady(false);
    }, 1500);
  };

  useEffect(() => {
    if (readingBook && !isClosing) {
      const timer = setTimeout(() => setIsBookReady(true), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [readingBook, isClosing]);

  /* ─────── render ─────── */
  return (
    <div className="scp-layout">
      {/* TOP NAVBAR */}
      <nav className="scp-navbar">
        <div className="scp-logo" onClick={() => navigate('/')}>
          <div className="scp-logo-icon">ح</div>
          <span className="scp-logo-text">حكايتي</span>
        </div>
        <button className="scp-btn-outline" onClick={() => navigate('/')}>
          إلغاء والعودة للرئيسية
        </button>
      </nav>

      {/* MAIN CONTAINER: Split layout */}
      <div className="scp-container">
        
        {/* RIGHT SIDEBAR (Steps & Info) */}
        <aside className="scp-sidebar">
          <div className="scp-sidebar-content">
            <h1 className="scp-page-title">
              ابتكر قصة <br/><span className="text-gradient">خيالية جديدة</span> ✨
            </h1>
            <p className="scp-page-subtitle">
              اتبع الخطوات السحرية لنصنع معاً مغامرة يكون طفلك بطلها الأول!
            </p>

            <div className="scp-stepper">
              {STEPS.map((s, i) => {
                const isActive = step === s.id;
                const isPast = step > s.id;
                return (
                  <div key={s.id} className={`scp-step-item ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
                    <div className="scp-step-icon-wrap">
                      <div className="scp-step-line" />
                      <div className="scp-step-icon">{isPast ? '✓' : s.icon}</div>
                    </div>
                    <div className="scp-step-text">
                      <h4 className="scp-step-title">{s.title}</h4>
                      <p className="scp-step-desc">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </aside>

        {/* LEFT MAIN AREA (Form Content) */}
        <main className="scp-main">
          {submitted ? (
            <SuccessView 
              form={form} 
              onHome={() => navigate('/')} 
              onReadNow={() => setReadingBook({ 
                id: 999, 
                title: `مغامرة ${form.name}`, 
                coverImg: bookPage1, 
                pages: [bookPage1, bookPage1, bookPage1, bookPage1] 
              })} 
            />
          ) : (
            <div className="scp-form-card">
              <div className="scp-step-content-area" ref={mainContentRef}>
                {step === 1 && <Step1 form={form} errors={errors} updateForm={updateForm} />}
                {step === 2 && <Step2 form={form} errors={errors} updateForm={updateForm} />}
                {step === 3 && <Step3 form={form} errors={errors} updateForm={updateForm} />}
                {step === 4 && <Step4 form={form} errors={errors} updateForm={updateForm} onPhotoChange={handlePhotoChange} />}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="scp-form-actions">
                {step > 1 ? (
                  <button className="scp-btn-secondary" onClick={handleBack}>
                    الخطوة السابقة
                  </button>
                ) : <div></div>}

                {step < STEPS.length ? (
                  <button className="scp-btn-primary" onClick={handleNext}>
                    متابعة للخطوة التالية <span>←</span>
                  </button>
                ) : (
                  <button className="scp-btn-primary magic-btn" onClick={handleSubmit}>
                    🪄 ابدأ بإنشاء القصة!
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

      </div>

      {/* STORY READER OVERLAY */}
      {readingBook && (
        <div
          className={`book-modal-overlay ${isClosing ? 'is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleCloseBook();
          }}
        >
          <div className="book-modal-content">
            <div className="modal-flipbook-container">
              {isBookReady && (
                <HTMLFlipBook
                  key={readingBook.id}
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
                  {readingBook.pages.map((pageImg, pageIndex) => (
                    <Page key={`${readingBook.id}-page-${pageIndex}`}>
                      <img src={pageImg} alt={`صفحة ${pageIndex + 1}`} className="page-image" />
                    </Page>
                  ))}
                </HTMLFlipBook>
              )}
            </div>
            <button className="book-close-btn" onClick={handleCloseBook}>
              <span className="close-icon-text">✕</span>
              <span>إغلاق الكتاب</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 1 — child info
════════════════════════════════════════════ */
function Step1({ form, errors, updateForm }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>أهلاً بك! من هو بطل قصتنا اليوم؟ 👶</h2>
        <p>نحتاج لبعض التفاصيل البسيطة لنجعل القصة مناسبة وممتعة.</p>
      </div>

      <div className="scp-form-grid">
        <div className="scp-input-group full-width">
          <label>اسم البطل</label>
          <div className="scp-input-wrapper">
            <span className="scp-input-icon">✏️</span>
            <input
              className={`scp-input ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder="مثال: يوسف، مريم..."
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              maxLength={30}
              autoComplete="off"
            />
          </div>
          {errors.name && <span className="scp-error-msg">{errors.name}</span>}
        </div>

        <div className="scp-input-group">
          <label>عمر البطل (سنوات)</label>
          <div className="scp-pills-row">
            {[3,4,5,6,7,8,9,10,11,12].map(a => (
              <button
                key={a}
                type="button"
                className={`scp-pill ${form.age === a ? 'selected' : ''}`}
                onClick={() => updateForm('age', a)}
              >
                {a}
              </button>
            ))}
          </div>
          {errors.age && <span className="scp-error-msg">{errors.age}</span>}
        </div>

        <div className="scp-input-group">
          <label>هل بطلنا ولد أم بنت؟</label>
          <div className="scp-gender-cards">
            <button
              type="button"
              className={`scp-gender-card ${form.gender === 'boy' ? 'selected' : ''}`}
              onClick={() => updateForm('gender', 'boy')}
            >
              <span className="scp-gender-emoji">👦</span>
              <span className="scp-gender-text">ولد</span>
            </button>
            <button
              type="button"
              className={`scp-gender-card ${form.gender === 'girl' ? 'selected' : ''}`}
              onClick={() => updateForm('gender', 'girl')}
            >
              <span className="scp-gender-emoji">👧</span>
              <span className="scp-gender-text">بنت</span>
            </button>
          </div>
          {errors.gender && <span className="scp-error-msg">{errors.gender}</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 2 — topic
════════════════════════════════════════════ */
function Step2({ form, errors, updateForm }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>عالم المغامرة 🎯</h2>
        <p>ما هو العالم الذي يفضل طفلك استكشافه؟ الذكاء الاصطناعي سيبني القصة حوله.</p>
      </div>

      <div className="scp-topics-grid">
        {TOPICS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`scp-topic-card ${form.topic === t.id ? 'selected' : ''}`}
            onClick={() => updateForm('topic', t.id)}
            style={{ '--topic-color': t.color }}
          >
            <div className="scp-topic-emoji">{t.emoji}</div>
            <div className="scp-topic-label">{t.label}</div>
            <div className="scp-topic-check">✓</div>
          </button>
        ))}
      </div>
      {errors.topic && <span className="scp-error-msg" style={{marginTop: '15px', display:'block'}}>{errors.topic}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 3 — length
════════════════════════════════════════════ */
function Step3({ form, errors, updateForm }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>طول الرحلة 📏</h2>
        <p>هل تفضل قصة سريعة قبل النوم أم مغامرة طويلة ومفصلة؟</p>
      </div>

      <div className="scp-lengths-list">
        {LENGTHS.map(l => (
          <button
            key={l.id}
            type="button"
            className={`scp-length-card ${form.length === l.id ? 'selected' : ''}`}
            onClick={() => updateForm('length', l.id)}
          >
            <div className="scp-length-icon">{l.emoji}</div>
            <div className="scp-length-info">
              <h3>قصة {l.label}</h3>
              <p>{l.desc}</p>
            </div>
            <div className="scp-length-radio">
              <div className="scp-radio-inner"></div>
            </div>
          </button>
        ))}
      </div>
      {errors.length && <span className="scp-error-msg" style={{marginTop: '15px', display:'block'}}>{errors.length}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 4 — photo
════════════════════════════════════════════ */
function Step4({ form, updateForm, onPhotoChange }) {
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEv = { target: { files: [file] } };
    onPhotoChange(fakeEv);
  }, [onPhotoChange]);

  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>صورة البطل (اختيارية) 📸</h2>
        <p>ارفع صورة لطفلك وسيقوم الذكاء الاصطناعي برسم شخصيته الكرتونية داخل القصة!</p>
      </div>

      <div
        ref={dropRef}
        className={`scp-dropzone ${form.photoPreview ? 'has-photo' : ''}`}
        onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('drag-over'); }}
        onDragLeave={() => dropRef.current?.classList.remove('drag-over')}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {form.photoPreview ? (
          <div className="scp-photo-preview-wrap">
            <img src={form.photoPreview} alt="معاينة الصورة" />
            <div className="scp-photo-overlay">
              <span>تغيير الصورة 🔄</span>
            </div>
          </div>
        ) : (
          <div className="scp-dropzone-content">
            <div className="scp-dropzone-icon">🖼️</div>
            <h3>اسحب وأفلت الصورة هنا</h3>
            <p>أو اضغط لتصفح ملفات جهازك</p>
            <div className="scp-btn-fake">اختيار صورة</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onPhotoChange}
      />

      <div className="scp-skip-wrap">
        <p>لا ترغب في رفع صورة؟</p>
        <button type="button" className="scp-btn-text" onClick={() => updateForm('photo', 'skip')}>
          تخطي هذه الخطوة
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUCCESS VIEW
════════════════════════════════════════════ */
function SuccessView({ form, onHome, onReadNow }) {
  const successRef = useRef(null);
  const resultRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (successRef.current && isGenerating) {
      gsap.fromTo(successRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, [isGenerating]);

  useEffect(() => {
    if (resultRef.current && !isGenerating) {
      gsap.fromTo(resultRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }
      );
    }
  }, [isGenerating]);

  // Simulate AI Generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 4500); // 4.5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  const topicLabel = TOPICS.find(t => t.id === form.topic)?.label || '';

  if (!isGenerating) {
    return (
      <div className="scp-result-view" ref={resultRef}>
        <div className="scp-result-header">
          <span className="scp-result-badge">✨ قصة جديدة جاهزة</span>
          <h2>مغامرة {form.name} في عالم {topicLabel}</h2>
        </div>

        <div className="scp-result-book-card">
          <div className="scp-rbc-image">
            <img src={bookPage1} alt="غلاف القصة" />
            <div className="scp-rbc-overlay">
              <button className="scp-btn-play" onClick={onReadNow}>▶ قراءة تفاعلية</button>
            </div>
          </div>
          <div className="scp-rbc-details">
            <h3>الملخص</h3>
            <p>
              في يوم مشمس، استيقظ بطلنا {form.name} ليجد نفسه أمام بوابة سحرية تأخذه إلى عالم {topicLabel}.
              هناك تبدأ مغامرة لا تُنسى مليئة بالتشويق والأصدقاء الجدد.
            </p>
            <div className="scp-rbc-meta">
              <span>طول القصة: {LENGTHS.find(l=>l.id===form.length)?.label}</span>
              <span>العمر: {form.age} سنوات</span>
            </div>
          </div>
        </div>

        <div className="scp-result-actions">
          <button className="scp-btn-primary" onClick={onReadNow}>
            اقرأ القصة الآن 📖
          </button>
          <button className="scp-btn-secondary" onClick={() => alert('جاري تحميل القصة بصيغة PDF...')}>
            تنزيل (PDF) 📥
          </button>
          <button className="scp-btn-outline" style={{width: 'auto'}} onClick={onHome}>
            الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scp-success-view" ref={successRef}>
      <div className="scp-success-icon-wrap">
        <span className="scp-magic-wand">🪄</span>
        <div className="scp-pulse-ring"></div>
      </div>
      
      <h1 className="scp-success-title">سحر الذكاء الاصطناعي يعمل الآن!</h1>
      <p className="scp-success-desc">
        نحن ننسج خيوط مغامرة <strong>{form.name}</strong> في عالم <strong>{topicLabel}</strong>. 
        يرجى الانتظار قليلاً بينما تكتمل القصة السحرية والرسومات.
      </p>

      <div className="scp-summary-cards">
        {form.photoPreview && form.photo !== 'skip' && (
          <div className="scp-summary-photo">
            <img src={form.photoPreview} alt="البطل" />
          </div>
        )}
        <div className="scp-summary-details">
          <div className="scp-sd-item"><span>البطل:</span> {form.name} ({form.age} سنوات)</div>
          <div className="scp-sd-item"><span>العالم:</span> {topicLabel}</div>
          <div className="scp-sd-item"><span>طول القصة:</span> {LENGTHS.find(l=>l.id===form.length)?.label}</div>
        </div>
      </div>

      <div className="scp-loader-container">
        <div className="scp-loader-bar">
          <div className="scp-loader-fill"></div>
        </div>
        <p className="scp-loader-text">جاري توليد القصة... ⏳</p>
      </div>

      <button className="scp-btn-secondary" onClick={onHome} style={{marginTop: '20px'}}>
        إلغاء
      </button>
    </div>
  );
}
