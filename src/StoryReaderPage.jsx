import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import './StoryReaderPage.css';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="srp-page" ref={ref}>
      <div className="srp-page-content">
        {props.children}
      </div>
    </div>
  );
});

export default function StoryReaderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const flipBookRef = useRef();
  
  const bookData = location.state?.newBook;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!bookData) {
      console.warn("No book data found in state, redirecting...");
      navigate('/create');
    }
  }, [bookData, navigate]);

  if (!bookData) return null;

  // Ensure images are sorted by page number
  const sortedPages = [...bookData.storyImages].sort((a, b) => a.pageNumber - b.pageNumber);

  const onFlip = (e) => {
    setCurrentPage(e.data);
  };

  return (
    <div className="srp-layout">
      {/* Navbar */}
      <nav className="srp-navbar">
        <div className="srp-logo" onClick={() => navigate('/')}>حكايتي</div>
        <div className="srp-nav-info">
          <h1>{bookData.title}</h1>
        </div>
        <button className="srp-back-btn" onClick={() => navigate('/create')}>إنشاء قصة جديدة</button>
      </nav>

      {/* Reader Area */}
      <main className="srp-main-content">
        <div className="srp-book-container">
          <HTMLFlipBook
            width={550}
            height={733}
            size="stretch"
            minWidth={315}
            maxWidth={1000}
            minHeight={420}
            maxHeight={1350}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="srp-flipbook"
            ref={flipBookRef}
            startPage={0}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {/* Front Cover */}
            <Page>
              <div className="srp-cover">
                <img src={sortedPages[0]?.imageUrl} alt="Cover" className="srp-cover-bg" />
                <div className="srp-cover-overlay">
                  <h2 className="srp-cover-title">{bookData.title}</h2>
                  <div className="srp-cover-badge">قصة حصرية لـ {bookData.childName || 'بطلي الصغير'}</div>
                </div>
              </div>
            </Page>

            {/* Content Pages */}
            {sortedPages.map((page, index) => (
              <Page key={index}>
                <div className="srp-inner-page">
                  <img src={page.imageUrl} alt={`Page ${index + 1}`} className="srp-page-image" />
                  <div className="srp-page-text-container">
                    <p className="srp-page-text">{page.sceneTextAr}</p>
                    <span className="srp-page-num">{index + 1}</span>
                  </div>
                </div>
              </Page>
            ))}

            {/* Back Cover */}
            <Page>
              <div className="srp-back-cover">
                <div className="srp-back-content">
                  <h3>النهاية</h3>
                  <p>أتمنى أن تكون المغامرة قد أعجبتك يا {bookData.childName}!</p>
                  <button className="srp-re-btn" onClick={() => navigate('/create')}>تأليف مغامرة جديدة</button>
                </div>
              </div>
            </Page>
          </HTMLFlipBook>
        </div>

        {/* Controls */}
        <div className="srp-controls">
          <button 
            className="srp-ctrl-btn" 
            onClick={() => flipBookRef.current.pageFlip().flipPrev()}
          >
            السابق
          </button>
          <div className="srp-page-indicator">
             الصفحة {currentPage + 1} من {sortedPages.length + 2}
          </div>
          <button 
            className="srp-ctrl-btn" 
            onClick={() => flipBookRef.current.pageFlip().flipNext()}
          >
            التالي
          </button>
        </div>
      </main>
    </div>
  );
}
