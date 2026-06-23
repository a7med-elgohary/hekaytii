import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';
import './StoryCreatorPage.css';

import bookPage1 from './assets/book_page_1.png';

import { 
  STORY_CREATOR_TRANSLATIONS, 
  getLocalizedTopics, 
  getLocalizedLengths, 
  getLocalizedSteps 
} from './translations.js';

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
  const lang = localStorage.getItem('lang') || 'ar';
  const t = STORY_CREATOR_TRANSLATIONS[lang];
  const steps = getLocalizedSteps(lang);
  const topics = getLocalizedTopics(lang);
  const lengths = getLocalizedLengths(lang);


  /* ── state ── */
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    topic: '',
    customTopic: '',
    length: '',
    photo: null,
    photoPreview: null,
  });
  const [errors, setErrors] = useState({});
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
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (illustrationRef.current) {
      gsap.fromTo(illustrationRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [lang]);

  /* ── validation ── */
  const validate = useCallback(() => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = t.errName;
      if (!form.age || form.age < 3 || form.age > 12) e.age = t.errAge;
      if (!form.gender) e.gender = t.errGender;
    }
    if (step === 2) {
      if (!form.topic) e.topic = t.errTopic;
      if (form.topic === 'other' && !form.customTopic.trim()) e.customTopic = t.errCustomTopic;
    }
    if (step === 3 && !form.length) e.length = t.errLength;
    return e;
  }, [step, form, t]);

  const handleNext = useCallback(() => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (mainContentRef.current) {
      const xOffset = lang === 'ar' ? -80 : 80;
      gsap.to(mainContentRef.current, {
        x: xOffset, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
          setStep(s => s + 1);
          gsap.fromTo(mainContentRef.current, { x: -xOffset, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
        }
      });
    } else {
      setStep(s => s + 1);
    }
  }, [validate, lang]);

  const handleBack = useCallback(() => {
    setErrors({});
    if (mainContentRef.current) {
      const xOffset = lang === 'ar' ? 80 : -80;
      gsap.to(mainContentRef.current, {
        x: xOffset, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
          setStep(s => s - 1);
          gsap.fromTo(mainContentRef.current, { x: -xOffset, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
        }
      });
    } else {
      setStep(s => s - 1);
    }
  }, [lang]);

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
          <div className="scp-logo-icon">{lang === 'ar' ? 'ح' : 'H'}</div>
          <span className="scp-logo-text">{lang === 'ar' ? 'حكايتي' : 'Hekayti'}</span>
        </div>
        <button className="scp-btn-outline" onClick={() => navigate('/')}>
          {t.cancelBtn}
        </button>
      </nav>

      {/* MAIN CONTAINER: Split layout */}
      <div className="scp-container">

        {/* RIGHT SIDEBAR (Steps & Info) */}
        <aside className="scp-sidebar">
          <div className="scp-sidebar-content">
            <h1 className="scp-page-title">
              {t.pageTitle1} <br /><span className="text-gradient">{t.pageTitle2}</span>
            </h1>
            <p className="scp-page-subtitle">
              {t.pageSubtitle}
            </p>

            <div className="scp-stepper">
              {steps.map((s, i) => {
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
              onReadNow={(bookData) => navigate('/', { state: { newBook: bookData } })}
            />
          ) : (
            <div className="scp-form-card">
              <div className="scp-step-content-area" ref={mainContentRef}>
                {step === 1 && <Step1 form={form} errors={errors} updateForm={updateForm} t={t} />}
                {step === 2 && <Step2 form={form} errors={errors} updateForm={updateForm} t={t} topics={topics} />}
                {step === 3 && <Step3 form={form} errors={errors} updateForm={updateForm} t={t} lengths={lengths} />}
                {step === 4 && <Step4 form={form} errors={errors} updateForm={updateForm} onPhotoChange={handlePhotoChange} t={t} />}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="scp-form-actions">
                {step > 1 ? (
                  <button className="scp-btn-secondary" onClick={handleBack}>
                    {t.prevStep}
                  </button>
                ) : <div></div>}

                {step < steps.length ? (
                  <button className="scp-btn-primary" onClick={handleNext}>
                    {t.nextStep} <span style={{ display: 'inline-block', transform: lang === 'en' ? 'rotate(180deg)' : 'none' }}>{t.nextStepArrow}</span>
                  </button>
                ) : (
                  <button className="scp-btn-primary magic-btn" onClick={handleSubmit}>
                    {t.createBtn}
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
                      <img src={pageImg} alt={`Page ${pageIndex + 1}`} className="page-image" />
                    </Page>
                  ))}
                </HTMLFlipBook>
              )}
            </div>
            <button className="book-close-btn" onClick={handleCloseBook}>
              <span className="close-icon-text">✕</span>
              <span>{t.closeBook}</span>
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
function Step1({ form, errors, updateForm, t }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>{t.step1Title}</h2>
        <p>{t.step1Subtitle}</p>
      </div>

      <div className="scp-form-grid">
        <div className="scp-input-group full-width">
          <label>{t.heroName}</label>
          <div className="scp-input-wrapper">
            <span className="scp-input-icon">✏️</span>
            <input
              className={`scp-input ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder={t.heroNamePlaceholder}
              value={form.name}
              onChange={e => updateForm('name', e.target.value)}
              maxLength={30}
              autoComplete="off"
            />
          </div>
          {errors.name && <span className="scp-error-msg">{errors.name}</span>}
        </div>

        <div className="scp-input-group">
          <label>{t.heroAge}</label>
          <div className="scp-pills-row">
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(a => (
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
          <label>{t.heroGender}</label>
          <div className="scp-gender-cards">
            <button
              type="button"
              className={`scp-gender-card ${form.gender === 'boy' ? 'selected' : ''}`}
              onClick={() => updateForm('gender', 'boy')}
            >
              <span className="scp-gender-emoji">👦</span>
              <span className="scp-gender-text">{t.boy}</span>
            </button>
            <button
              type="button"
              className={`scp-gender-card ${form.gender === 'girl' ? 'selected' : ''}`}
              onClick={() => updateForm('gender', 'girl')}
            >
              <span className="scp-gender-emoji">👧</span>
              <span className="scp-gender-text">{t.girl}</span>
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
function Step2({ form, errors, updateForm, t, topics }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>{t.step2Title}</h2>
        <p>{t.step2Subtitle}</p>
      </div>

      <div className="scp-topics-grid">
        {topics.map(tData => (
          <button
            key={tData.id}
            type="button"
            className={`scp-topic-card ${form.topic === tData.id ? 'selected' : ''}`}
            onClick={() => updateForm('topic', tData.id)}
            style={{ '--topic-color': tData.color }}
          >
            <div className="scp-topic-emoji">{tData.emoji}</div>
            <div className="scp-topic-label">{tData.label}</div>
            <div className="scp-topic-check">✓</div>
          </button>
        ))}
      </div>

      {form.topic === 'other' && (
        <div className="scp-input-group full-width" style={{ marginTop: '25px', animation: 'fadeIn 0.4s ease' }}>
          <label>{t.customTopicLabel}</label>
          <div className="scp-input-wrapper">
            <span className="scp-input-icon">🪄</span>
            <input
              className={`scp-input ${errors.customTopic ? 'error' : ''}`}
              type="text"
              placeholder={t.customTopicPlaceholder}
              value={form.customTopic}
              onChange={e => updateForm('customTopic', e.target.value)}
              autoComplete="off"
            />
          </div>
          {errors.customTopic && <span className="scp-error-msg">{errors.customTopic}</span>}
        </div>
      )}

      {errors.topic && <span className="scp-error-msg" style={{ marginTop: '15px', display: 'block' }}>{errors.topic}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 3 — length
════════════════════════════════════════════ */
function Step3({ form, errors, updateForm, t, lengths }) {
  return (
    <div className="scp-step-view">
      <div className="scp-view-header">
        <h2>{t.step3Title}</h2>
        <p>{t.step3Subtitle}</p>
      </div>

      <div className="scp-lengths-list">
        {lengths.map(l => (
          <button
            key={l.id}
            type="button"
            className={`scp-length-card ${form.length === l.id ? 'selected' : ''}`}
            onClick={() => updateForm('length', l.id)}
          >
            <div className="scp-length-icon">{l.emoji}</div>
            <div className="scp-length-info">
              <h3>{l.label}</h3>
              <p>{l.desc}</p>
            </div>
            <div className="scp-length-radio">
              <div className="scp-radio-inner"></div>
            </div>
          </button>
        ))}
      </div>
      {errors.length && <span className="scp-error-msg" style={{ marginTop: '15px', display: 'block' }}>{errors.length}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 4 — photo
════════════════════════════════════════════ */
function Step4({ form, updateForm, onPhotoChange, t }) {
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
        <h2>{t.step4Title}</h2>
        <p>{t.step4Subtitle}</p>
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
            <img src={form.photoPreview} alt="Preview" />
            <div className="scp-photo-overlay">
              <span>{t.changePhoto}</span>
            </div>
          </div>
        ) : (
          <div className="scp-dropzone-content">
            <div className="scp-dropzone-icon">🖼️</div>
            <h3>{t.dragDrop}</h3>
            <p>{t.orClick}</p>
            <div className="scp-btn-fake">{t.choosePhoto}</div>
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
        <p>{t.noPhotoText}</p>
        <button type="button" className="scp-btn-text" onClick={() => updateForm('photo', 'skip')}>
          {t.skipStep}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUCCESS VIEW — Real API Integration
════════════════════════════════════════════ */
function SuccessView({ form, onHome, onReadNow }) {
  const lang = localStorage.getItem('lang') || 'ar';
  const t = STORY_CREATOR_TRANSLATIONS[lang];
  const topics = getLocalizedTopics(lang);
  const lengths = getLocalizedLengths(lang);

  const successRef = useRef(null);
  const resultRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const BASE_URL = 'https://localhost:7141/api/Story';
  // Note: In a real app, token should come from Auth context
  const TOKEN = localStorage.getItem('token') || 'YOUR_TOKEN_HERE';

  useEffect(() => {
    if (!isGenerating || generatedStory) return;

    const generateStory = async () => {
      try {
        setError(null);
        const response = await fetch(`${BASE_URL}/1`, { // Hardcoded childId=1 for demo
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
          },
          body: JSON.stringify({
            name: form.name,
            hobby: form.topic === 'other' ? form.customTopic : topics.find(tData => tData.id === form.topic)?.label,
            gender: form.gender === 'boy' ? (lang === 'ar' ? 'ولد' : 'boy') : (lang === 'ar' ? 'بنت' : 'girl'),
            photoBase64: form.photoPreview ? form.photoPreview.split(',')[1] : "",
            numChapters: form.length === 'short' ? 5 : form.length === 'medium' ? 10 : 15
          })
        });

        if (!response.ok) throw new Error(lang === 'ar' ? 'فشل في توليد القصة. تأكد من تشغيل الـ Backend' : 'Failed to generate story. Make sure Backend is running.');

        const data = await response.json();
        setGeneratedStory(data);
        setIsGenerating(false);
      } catch (error) {
        console.error(error);
        setError(error.message);
        setIsGenerating(false);
      }
    };

    generateStory();
  }, [form, TOKEN, isGenerating, generatedStory, lang, topics]);

  const handleDownloadPdf = async () => {
    if (!generatedStory) return;
    setPdfLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/generate-pdf/1/${generatedStory.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });
      const data = await response.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
    } catch (error) {
      alert(t.pdfError);
    } finally {
      setPdfLoading(false);
    }
  };

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

  const topicLabel = form.topic === 'other' ? form.customTopic : (topics.find(tData => tData.id === form.topic)?.label || '');

  if (!isGenerating && generatedStory) {
    return (
      <div className="scp-result-view" ref={resultRef}>
        <div className="scp-result-header">
          <span className="scp-result-badge">{t.readyBadge}</span>
          <h2>{generatedStory.title || (lang === 'ar' ? `مغامرة ${form.name} في عالم ${topicLabel}` : `${form.name}'s adventure in ${topicLabel}`)}</h2>
        </div>

        <div className="scp-result-book-card">
          <div className="scp-rbc-image">
            <img src={generatedStory.storyImages?.[0]?.imageUrl || bookPage1} alt="Cover" />
            <div className="scp-rbc-overlay">
              <button className="scp-btn-play" onClick={() => onReadNow({
                id: generatedStory.id,
                title: generatedStory.title,
                pages: generatedStory.storyImages.map(img => img.imageUrl)
              })}>{t.readPlay}</button>
            </div>
          </div>
          <div className="scp-rbc-details">
            <h3>{t.summaryTitle}</h3>
            <p>{generatedStory.content}</p>
            <div className="scp-rbc-meta">
              <span>{t.summaryWorld} {topicLabel}</span>
              <span>{t.summaryHero} {form.name} ({form.age} {t.yearsOld})</span>
            </div>
          </div>
        </div>

        <div className="scp-result-actions">
          <button className="scp-btn-primary" onClick={() => onReadNow({
            id: generatedStory.id,
            title: generatedStory.title,
            pages: generatedStory.storyImages.map(img => img.imageUrl)
          })}>
            {t.readNowBtn}
          </button>
          <button className="scp-btn-secondary" onClick={handleDownloadPdf} disabled={pdfLoading}>
            {pdfLoading ? t.downloadingPdf : t.downloadPdf}
          </button>
          <button className="scp-btn-outline" style={{ width: 'auto' }} onClick={onHome}>
            {t.homeBtn}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scp-success-view">
        <div className="scp-success-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', marginBottom: '20px' }}>
          <span style={{ fontSize: '3rem' }}>❌</span>
        </div>
        <h1 className="scp-success-title" style={{ color: '#ef4444' }}>{t.errorTitle}</h1>
        <p className="scp-success-desc" style={{ marginBottom: '20px' }}>{error}</p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button className="scp-btn-primary" onClick={() => {
            setError(null);
            setIsGenerating(true);
          }}>
            {t.retryBtn}
          </button>
          <button className="scp-btn-secondary" onClick={onHome}>
            {t.backHomeBtn}
          </button>
        </div>
      </div>
    );
  }

  const localizedDesc = t.generatingDesc.replace('{name}', form.name).replace('{topic}', topicLabel);

  return (
    <div className="scp-success-view" ref={successRef}>
      <div className="scp-success-icon-wrap">
        <span className="scp-magic-wand">🪄</span>
        <div className="scp-pulse-ring"></div>
      </div>

      <h1 className="scp-success-title">{t.generatingTitle}</h1>
      <p className="scp-success-desc">{localizedDesc}</p>

      <div className="scp-summary-cards">
        {form.photoPreview && form.photo !== 'skip' && (
          <div className="scp-summary-photo">
            <img src={form.photoPreview} alt="Hero" />
          </div>
        )}
        <div className="scp-summary-details">
          <div className="scp-sd-item"><span>{t.summaryHero}</span> {form.name} ({form.age} {t.yearsOld})</div>
          <div className="scp-sd-item"><span>{t.summaryWorld}</span> {topicLabel}</div>
          <div className="scp-sd-item"><span>{t.summaryLength}</span> {lengths.find(l => l.id === form.length)?.label}</div>
        </div>
      </div>

      <div className="scp-loader-container">
        <div className="scp-loader-bar">
          <div className="scp-loader-fill"></div>
        </div>
        <p className="scp-loader-text">{t.generatingProgress}</p>
      </div>

      <button className="scp-btn-secondary" onClick={onHome} style={{ marginTop: '20px' }}>
        {t.cancel}
      </button>
    </div>
  );
}

