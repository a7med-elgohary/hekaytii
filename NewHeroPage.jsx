import React from 'react';
import './NewHeroPage.css';
import heroBg from './assets/hero3.png';

export default function NewHeroPage() {
  return (
    <div className="new-hero-container">
      {/* NAVBAR */}
      <header className="new-navbar">
        <div className="new-logo">
          Hekayti (حكايتي)
        </div>
        <div className="new-nav-actions">
          <a href="#" className="nav-login">Log.in</a>
          <button className="btn-dark-purple">ابدأ المغامرة الآن</button>
        </div>
      </header>

      {/* HERO SECTION SPLIT LAYOUT */}
      <main className="new-hero-split">

        {/* 1. TEXT SECTION ON RIGHT (First in DOM) */}
        <div className="hero-text-side">
          <h1>اجعل طفلك بطلاً لقصته الخاصة!</h1>
          <p className="subtitle">
            أفضل مساحة لقصص تفاعلية AI-powered personalized storytelling app for children aged 4-10
          </p>
          <div className="hero-buttons-side hide-on-mobile">
            <button className="btn-outline-play">
              <span className="play-icon-circle">▶</span> شاهد العرض
            </button>
            <button className="btn-dark-purple lg">ابدأ المغامرة الآن</button>
          </div>
        </div>

        {/* 2. IMAGE SECION ON LEFT (Second in DOM) */}
        <div className="hero-image-side">
          <img src={heroBg} alt="Hero Display" className="split-hero-img floating" />
        </div>

        {/* 3. MOBILE BUTTONS (Third in DOM, shows only on mobile) */}
        <div className="hero-buttons-side show-on-mobile">
          <button className="btn-outline-play">
            <span className="play-icon-circle">▶</span> شاهد العرض
          </button>
          <button className="btn-dark-purple lg">ابدأ المغامرة الآن</button>
        </div>

      </main>
    </div>
  );
}
