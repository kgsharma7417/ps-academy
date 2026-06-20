import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  onSnapshot,
  doc,
  db,
  collection,
  getDocs,
  query,
  orderBy,
} from "../firebase";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES — NMAJS-inspired: White + Navy + Gold, Playfair headings, clean
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  color: #1a1a2e;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, .serif {
  font-family: 'Playfair Display', serif;
}

/* ── CSS Variables ── */
:root {
  --navy: #0f1b3d;
  --navy-light: #1a2d5e;
  --navy-dark: #080e22;
  --gold: #c9a84c;
  --gold-light: #e8d48b;
  --gold-dark: #a8862e;
  --white: #ffffff;
  --off-white: #f8f7f4;
  --gray-100: #f3f2ef;
  --gray-200: #e2e1dd;
  --gray-300: #c4c3bf;
  --gray-400: #8a8986;
  --gray-500: #62615e;
  --gray-600: #484744;
  --gray-700: #333230;
  --text: #1a1a2e;
  --text-light: #5a5a6e;
  --border: #e2e1dd;
  --shadow: 0 4px 20px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
  --shadow-xl: 0 20px 60px rgba(0,0,0,0.1);
}

/* ── Container & Section ── */
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section { padding: 100px 0; }
.section-alt { background: var(--off-white); }

.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--gold-dark);
  margin-bottom: 12px;
}
.section-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  color: var(--navy);
  line-height: 1.15;
  margin-bottom: 16px;
}
.section-subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  line-height: 1.6;
  max-width: 600px;
}

/* ── Top Info Bar ── */
.top-bar {
  background: var(--navy);
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  padding: 8px 0;
  position: relative;
  z-index: 101;
}
.top-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.top-bar-left { display: flex; align-items: center; gap: 20px; }
.top-bar-left span { display: flex; align-items: center; gap: 6px; }
.top-bar-left .icon { font-size: 0.85rem; }
.top-bar-right { display: flex; align-items: center; gap: 12px; }
.top-bar-right a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.85rem;
}
.top-bar-right a:hover { color: var(--gold-light); }

/* ── Navbar ── */
.navbar {
  position: sticky; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}
.navinner {
  display: flex; align-items: center; justify-content: space-between;
  height: 72px;
}
.nav-logo {
  display: flex; align-items: center; gap: 12px; text-decoration: none;
}
.nav-logo-icon {
  width: 42px; height: 42px;
  background: var(--navy);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 700; font-size: 1.1rem; color: var(--gold-light);
}
.nav-logo-text {
  font-family: 'Playfair Display', serif;
  font-weight: 700; font-size: 1.2rem; color: var(--navy);
}
.nav-logo-sub { font-size: 0.65rem; color: var(--gray-400); letter-spacing: 0.08em; margin-top: -1px; }
.nav-links { display: flex; align-items: center; gap: 28px; }
.nav-link {
  color: var(--text-light);
  text-decoration: none; font-size: 0.85rem; font-weight: 500;
  transition: color 0.2s; cursor: pointer; background: none; border: none;
  padding: 0;
}
.nav-link:hover { color: var(--navy); }
.nav-cta {
  padding: 10px 24px;
  border-radius: 6px;
  background: var(--gold);
  color: var(--navy-dark);
  font-weight: 700; font-size: 0.85rem; text-decoration: none;
  transition: all 0.2s; border: none; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.nav-cta:hover { background: var(--gold-light); transform: translateY(-1px); }
.nav-cta-outline {
  padding: 9px 22px;
  border-radius: 6px;
  border: 2px solid var(--navy);
  color: var(--navy);
  font-weight: 600; font-size: 0.85rem; text-decoration: none;
  transition: all 0.2s;
}
.nav-cta-outline:hover { background: var(--navy); color: #fff; }

.mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
.mobile-toggle span {
  display: block; width: 24px; height: 2px;
  background: var(--navy); margin: 5px 0;
  transition: all 0.3s; border-radius: 2px;
}

/* ── Hero Slider ── */
.hero-slider {
  position: relative;
  height: 85vh;
  min-height: 520px;
  max-height: 700px;
  overflow: hidden;
  background: var(--navy-dark);
}
.hero-slide {
  position: absolute; inset: 0;
  transition: opacity 0.8s ease;
}
.hero-slide.active { opacity: 1; z-index: 2; }
.hero-slide:not(.active) { opacity: 0; z-index: 1; pointer-events: none; }
.hero-slide img {
  width: 100%; height: 100%; object-fit: cover;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(8,14,34,0.85) 0%, rgba(15,27,61,0.6) 50%, rgba(0,0,0,0.3) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; justify-content: center;
  z-index: 3; padding: 0 40px;
}
.hero-content-inner { max-width: 700px; }
.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 4px;
  background: rgba(201,168,76,0.2);
  border: 1px solid rgba(201,168,76,0.4);
  color: var(--gold-light);
  font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 20px;
}
.hero-title {
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 12px;
}
.hero-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 560px;
}
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-btn-primary {
  padding: 14px 32px;
  border-radius: 6px;
  background: var(--gold);
  color: var(--navy-dark);
  font-weight: 700; font-size: 0.9rem;
  text-decoration: none; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.hero-btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); }
.hero-btn-secondary {
  padding: 13px 30px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.3);
  color: #fff;
  font-weight: 600; font-size: 0.9rem;
  text-decoration: none; transition: all 0.2s;
}
.hero-btn-secondary:hover { border-color: #fff; background: rgba(255,255,255,0.08); }

/* Hero nav dots */
.hero-dots {
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 10px; z-index: 5;
}
.hero-dot {
  width: 40px; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s;
  border: none;
}
.hero-dot.active { background: var(--gold); width: 60px; }

/* ── Announcement Ticker ── */
.ticker-wrap {
  background: var(--gold);
  overflow: hidden;
  height: 44px;
  display: flex;
  align-items: center;
  position: relative;
}
.ticker-label {
  background: var(--navy);
  color: #fff;
  padding: 0 20px;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  height: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
.ticker-track {
  display: flex;
  overflow: hidden;
  flex: 1;
}
.ticker-scroll {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 0 24px;
  animation: tickerScroll 30s linear infinite;
  white-space: nowrap;
}
.ticker-item {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--navy-dark);
  display: flex; align-items: center; gap: 8px;
}
.ticker-item::before { content: "•"; color: var(--navy); font-size: 1.2rem; }
@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── Stats Bar ── */
.stats-bar {
  background: var(--navy);
  padding: 60px 0;
}
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.stat-item { text-align: center; padding: 0 16px; }
.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  color: var(--gold-light);
  line-height: 1;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

/* ── About ── */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.about-image {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}
.about-image img { width: 100%; height: 450px; object-fit: cover; display: block; }
.about-text .section-title { margin-bottom: 20px; }
.about-text p {
  color: var(--text-light);
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 1rem;
}
.about-features { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
.about-feat {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.9rem; font-weight: 500; color: var(--navy);
}
.about-feat .check { color: var(--gold-dark); font-weight: 700; }

/* ── Leadership ── */
.leaders-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.leader-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  background: var(--navy);
  cursor: pointer;
}
.leader-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}
.leader-card:hover .leader-img { transform: scale(1.05); }
.leader-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,14,34,0.9) 0%, rgba(15,27,61,0.5) 40%, transparent 70%);
}
.leader-content { position: relative; z-index: 2; }
.leader-role {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--gold-light);
  margin-bottom: 8px;
}
.leader-quote {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.15rem;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 20px;
  opacity: 0.9;
}
.leader-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}
.leader-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
}

/* ── Why Choose Us ── */
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.feature-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px 28px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}
.feature-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--gold);
  transform: translateY(-4px);
}
.feature-icon {
  width: 56px; height: 56px;
  border-radius: 12px;
  background: var(--off-white);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
}
.feature-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--navy);
  margin-bottom: 8px;
}
.feature-card p {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.6;
}

/* ── Our Classes (vertical cards) ── */
.classes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.class-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  background: var(--navy);
}
.class-card-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s;
}
.class-card:hover .class-card-img { transform: scale(1.08); }
.class-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,14,34,0.9) 0%, rgba(8,14,34,0.3) 50%, transparent 70%);
}
.class-card-content { position: relative; z-index: 2; padding: 36px; }
.class-card-tag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--gold-light);
  margin-bottom: 8px;
}
.class-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}
.class-card-desc {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}

/* ── Notice Board ── */
.notices-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.notice-card {
  display: flex; gap: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}
.notice-card:hover { box-shadow: var(--shadow); border-color: var(--gold); }
.notice-date {
  text-align: center;
  min-width: 64px;
  flex-shrink: 0;
}
.notice-day {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
}
.notice-mon {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gold-dark);
  letter-spacing: 0.05em;
  margin-top: 2px;
}
.notice-info { flex: 1; }
.notice-info h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: var(--navy);
  margin-bottom: 6px;
}
.notice-info p {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 8px;
}
.notice-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.notice-tag.event { background: rgba(201,168,76,0.15); color: var(--gold-dark); }
.notice-tag.meeting { background: #e8f0fe; color: #1a73e8; }
.notice-tag.holiday { background: #e6f4ea; color: #1e8e3e; }
.notice-tag.exam { background: #fce8e6; color: #d93025; }

/* ── Gallery Preview ── */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.gallery-item:hover img { transform: scale(1.1); }
.gallery-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,14,34,0.85), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
}
.gallery-item:hover .gallery-overlay { opacity: 1; }
.gallery-event {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold-light);
  margin-bottom: 4px;
}
.gallery-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}
.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: 2px solid var(--navy);
  color: var(--navy);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 32px;
}
.view-all-btn:hover { background: var(--navy); color: #fff; }

/* ── Contact ── */
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.contact-info-card { }
.contact-item {
  display: flex; gap: 16px;
  margin-bottom: 24px;
}
.contact-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: var(--off-white);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.contact-item h4 { font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.contact-item p { font-size: 0.95rem; color: var(--text-light); }
.contact-form { }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--navy); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.form-group input,
.form-group textarea {
  width: 100%; padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}
.form-group input:focus,
.form-group textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
.form-group textarea { resize: vertical; min-height: 100px; }
.submit-btn {
  padding: 14px 32px;
  border-radius: 8px;
  background: var(--navy);
  color: #fff;
  font-weight: 700; font-size: 0.9rem;
  border: none; cursor: pointer;
  transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.submit-btn:hover { background: var(--navy-light); transform: translateY(-1px); }

/* ── Footer ── */
.footer {
  background: var(--navy-dark);
  color: rgba(255,255,255,0.7);
  padding: 64px 0 32px;
}
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
.footer-brand .nav-logo-icon { margin-bottom: 16px; }
.footer-brand p { font-size: 0.85rem; line-height: 1.7; margin-bottom: 20px; }
.footer-socials { display: flex; gap: 10px; }
.footer-socials a {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.footer-socials a:hover { background: var(--gold); color: var(--navy-dark); border-color: var(--gold); }
.footer h4 {
  font-family: 'Playfair Display', serif;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 16px;
}
.footer-links { list-style: none; }
.footer-links li { margin-bottom: 10px; }
.footer-links a {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--gold-light); }
.footer-bottom {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}

/* ── Lightbox Modal ── */
.lightbox-bg {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.lightbox-bg img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}
.lightbox-close {
  position: absolute; top: 20px; right: 20px;
  background: none; border: none; color: #fff;
  font-size: 2rem; cursor: pointer;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.1); }
.lightbox-info {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  color: #fff; text-align: center;
}
.lightbox-info .ev { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold-light); margin-bottom: 4px; }
.lightbox-info .dt { font-size: 0.8rem; opacity: 0.6; }

/* ── Mobile Responsive ── */
@media (max-width: 1024px) {
  .about-grid { grid-template-columns: 1fr; gap: 32px; }
  .about-image img { height: 300px; }
  .contact-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .top-bar-left { flex-direction: column; align-items: flex-start; gap: 4px; }
  .top-bar-right { display: none; }
  .nav-links { display: none; }
  .mobile-toggle { display: block; }
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: absolute; top: 72px; left: 0; right: 0;
    background: #fff;
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    gap: 16px;
    box-shadow: var(--shadow-lg);
  }
  .hero-slider { height: 70vh; }
  .hero-content { padding: 0 24px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .leaders-grid { grid-template-columns: 1fr; }
  .leader-card { min-height: 400px; }
  .classes-grid { grid-template-columns: 1fr; }
  .class-card { min-height: 320px; }
  .notices-grid { grid-template-columns: 1fr; }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; gap: 32px; }
  .stats-bar { padding: 40px 0; }
}
@media (max-width: 480px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .about-features { grid-template-columns: 1fr; }
}
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_CONTENT = {
  // School
  schoolName: "P.S. Academy",
  schoolTagline: "Dare to Dream... Learn to Excel",
  affiliationText: "CBSE Affiliation No: 2132163",

  // Top Bar
  topPhone: "+91 99271 70258",
  topEmail: "psacademysemra@gmail.com",

  // Hero Slides
  heroSlides: [
    {
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
      title: "Welcome to P.S. Academy",
      subtitle:
        "Semra Khandoli, Agra mein ek pratishthit shikshan sanstha. Hum bachon mein jigyasa, anushasan aur utkrishtata ka vikas karte hain.",
      badge: "Admissions Open 2025–26",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
      title: "Aadhunik Shiksha ka Kendra",
      subtitle:
        "Vigyan labs, computer labs, library aur khel maidan — sabhi aadhunik suvidhaon se yukt.",
      badge: "CBSE Affiliated School",
    },
    {
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1920&auto=format&fit=crop",
      title: "Sarvangin Vikas ki Ore",
      subtitle:
        "Khel, kala, sanskritik karyakram aur naitik shiksha ke saath har bachche ka sarwangin vikas.",
      badge: "Est. 2005",
    },
  ],

  // Stats
  statsStudents: 1250,
  statsFaculty: 85,
  statsPassRate: 96,
  statsYears: 20,

  // About
  aboutTitle: "Hamara Vishwas",
  aboutDesc:
    "P.S. Academy Semra Khandoli, Agra mein hum maante hain ki shiksha sirf kitaabi gyan nahi, balki ek aisa prakash hai jo bachche ke jeevan ko safalta aur santosha ki or le jaata hai. Humara uddeshya hai — har bachche mein jigyasa jagana, anushasan ka vikas karna, aur unhe ek jimmedar nagrik banana.",
  aboutMission:
    "Gyan, anushasan aur samvedansheelta ke saath ek behtar samaj ka nirmaan.",
  aboutImage:
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop",
  aboutFeatures: [
    "CBSE Affiliated (2132163)",
    "Science & Computer Labs",
    "Sports Ground & Library",
    "Music, Dance & Art Classes",
  ],

  // Leadership
  principalName: "Mrs. Savita Sharma",
  principalQuote:
    "Shiksha ka uddeshya sirf marks nahi hai — yeh har bachche mein jigyasa, anushasan aur manavta ki lau jalane ka madhyam hai. P.S. Academy mein hum pratyek vidyarthi mein apni mahima pahchanne mein vishwas rakhte hain.",
  principalRole: "Principal",
  principalPhoto:
    "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?q=80&w=800&auto=format&fit=crop",
  managerName: "Shri Gopal Sharma",
  managerQuote:
    "P.S. Academy Semra Khandoli, Agra ka prabandhan samiti hamesha se ek aisi shikshan sanstha pradan karne ke liye pratibaddh raha hai jo sabke liye sulabh aur uttam koti ki ho. Hamare vidyarthi hi hamari sabse badi uplabdhi hain.",
  managerRole: "Chairman, Board of Management",
  managerPhoto:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",

  // Why Choose Us
  whyCards: [
    {
      icon: "🏆",
      title: "Academic Excellence",
      desc: "CBSE board mein lagatar behtarin parinam — 96%+ pass rate har saal.",
    },
    {
      icon: "🕉️",
      title: "Naitik Mulya",
      desc: "Pratidin prarthana, yog aur sanskrit shlokon ke through charitra nirman.",
    },
    {
      icon: "🔬",
      title: "Aadhunik Labs",
      desc: "Physics, Chemistry, Biology aur Computer labs — vyavaharik shiksha ke liye.",
    },
    {
      icon: "⚽",
      title: "Khel aur Kala",
      desc: "Varshik khel samaroh, sanskritik karyakram — har pratibha ko pehchan.",
    },
    {
      icon: "📚",
      title: "Pustakalay",
      desc: "1000+ books ka library — gyan ka sampoorna bhandar.",
    },
    {
      icon: "🎵",
      title: "Sangeet aur Nritya",
      desc: "Music, dance aur art & craft — sanskritik vikas ke liye.",
    },
  ],

  // Classes
  classes: [
    {
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
      tag: "Primary",
      title: "Classes I – V",
      desc: "Buniyadi shiksha, khel-khel mein gyan, naitik moolya aur sanskaron ki neev.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
      tag: "Middle",
      title: "Classes VI – VIII",
      desc: "Science, Maths, Social Studies mein gahrai — jigyasa aur tark-shakti ka vikas.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
      tag: "Senior",
      title: "Classes IX – XII",
      desc: "Board exam ki taiyari, career counselling aur career nirman ki disha.",
    },
  ],

  // Notices
  notices: [
    {
      day: "01",
      mon: "Apr",
      title: "Naye Shiksha Sesh 2025–26 ke liye Admission Khule",
      desc: "Class 1 se 11 tak admission khule hain. School office se sampark karein 9 AM se 2 PM ke beech.",
      tag: "event",
    },
    {
      day: "15",
      mon: "Aug",
      title: "Swatantrata Diwas Samaroh – 15 August",
      desc: "Sabhi vidyarthi aur staff 15 August ko 7:00 AM par upasthit rahein. White uniform anivarya hai.",
      tag: "event",
    },
    {
      day: "10",
      mon: "Jun",
      title: "Parent-Teacher Meeting – Class 6 se 10",
      desc: "PTM 22 June (Shanivar) 9 AM – 1 PM ke beech hogi. Abhibhavak progress report lena na bhoolen.",
      tag: "meeting",
    },
    {
      day: "05",
      mon: "Jun",
      title: "Garmi ki Chhuttiyan",
      desc: "Vidyalay 20 June se 30 June tak garmi ki chhuttiyon ke liye band rahega.",
      tag: "holiday",
    },
  ],

  // Ticker announcements
  announcements: [
    "🎓 Admissions Open for Session 2025-26 — Class I to XI Apply Now!",
    "🏆 P.S. Academy achieved 96% pass rate in CBSE Board Exams 2025",
    "📢 Parent-Teacher Meeting on 22 June — All Parents are requested to attend",
    "🎭 Annual Day Celebration will be held in December — Students prepare for performances!",
    "📚 New Library inaugurated — Over 1000 books now available for students",
  ],

  // Contact
  contactAddress: "P.S. Academy, Semra Khandoli, Agra, Uttar Pradesh",
  contactPhone: "+91 99271 70258",
  contactEmail: "psacademysemra@gmail.com",
  contactHours: "Mon – Sat: 8:00 AM – 3:00 PM",

  // Social
  socialLinks: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },

  // Theme
  primaryColor: "#0f1b3d",
  accentColor: "#c9a84c",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LANDING PAGE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const LandingPage = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const { userRole } = useAuth();
  const slideInterval = useRef(null);

  // ── Inject styles ──
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Firebase real-time listener for settings ──
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "landingPage"), (snap) => {
      if (snap.exists()) {
        setContent((prev) => ({ ...DEFAULT_CONTENT, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  // ── Fetch gallery photos from Firebase ──
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(
          collection(db, "gallery"),
          orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const photos = [];
        snap.forEach((doc) => photos.push({ id: doc.id, ...doc.data() }));
        setGalleryPhotos(photos);
      } catch (e) {
        console.error("Error fetching gallery:", e);
      }
    };
    fetchGallery();
  }, []);

  // ── Hero slider auto-play ──
  useEffect(() => {
    const slides = content.heroSlides || [];
    if (slides.length <= 1) return;
    slideInterval.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval.current);
  }, [content.heroSlides]);

  // ── Utils ──
  const goToSlide = (idx) => {
    setActiveSlide(idx);
    clearInterval(slideInterval.current);
  };
  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "webadmin") return "/webadmin";
    if (userRole === "teacher") return "/teacher";
    if (userRole === "parent") return "/parent";
    return "/login";
  };
  const slides = content.heroSlides || [];
  const notices = content.notices || [];
  const classes = content.classes || [];
  const whyCards = content.whyCards || [];
  const galleryPreview = galleryPhotos.slice(0, 6);
  const announcements = content.announcements || [];

  const headerHeight = 72;

  return (
    <div>
      {/* ── TOP INFO BAR ── */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-left">
            <span>
              <span className="icon">📞</span> {content.topPhone}
            </span>
            <span>
              <span className="icon">✉️</span> {content.topEmail}
            </span>
            <span>
              <span className="icon">🏛️</span> {content.affiliationText}
            </span>
          </div>
          <div className="top-bar-right">
            <a
              href={content.socialLinks?.facebook || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              FB
            </a>
            <a
              href={content.socialLinks?.instagram || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              IG
            </a>
            <a
              href={content.socialLinks?.youtube || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              YT
            </a>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="container navinner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">PS</div>
            <div>
              <div className="nav-logo-text">{content.schoolName}</div>
              <div className="nav-logo-sub">{content.schoolTagline}</div>
            </div>
          </Link>
          <div className={`nav-links${mobileOpen ? " open" : ""}`}>
            <a
              href="#about"
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <a
              href="#classes"
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              Classes
            </a>
            <a
              href="#notices"
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              Notices
            </a>
            <a
              href="#gallery"
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </a>
            <Link to={getDashboardPath()} className="nav-cta-outline">
              {userRole ? "Dashboard" : "Portal Login"}
            </Link>
            <a
              href="#contact"
              className="nav-cta"
              onClick={() => setMobileOpen(false)}
            >
              Admission Enquiry →
            </a>
          </div>
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span
              style={{
                transform: mobileOpen
                  ? "rotate(45deg) translate(5px,5px)"
                  : "none",
              }}
            />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span
              style={{
                transform: mobileOpen
                  ? "rotate(-45deg) translate(5px,-5px)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── HERO SLIDER ── */}
      <section className="hero-slider">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-slide${idx === activeSlide ? " active" : ""}`}
          >
            <img src={slide.image} alt={slide.title} />
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="container" style={{ padding: 0 }}>
            <div className="hero-content-inner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {slides[activeSlide]?.badge && (
                    <div className="hero-badge">
                      {slides[activeSlide].badge}
                    </div>
                  )}
                  <h1 className="hero-title">{slides[activeSlide]?.title}</h1>
                  <p className="hero-subtitle">
                    {slides[activeSlide]?.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="hero-actions">
                <a href="#contact" className="hero-btn-primary">
                  Apply Now →
                </a>
                <a href="#about" className="hero-btn-secondary">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
        {slides.length > 1 && (
          <div className="hero-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot${idx === activeSlide ? " active" : ""}`}
                onClick={() => goToSlide(idx)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── ANNOUNCEMENT TICKER ── */}
      {announcements.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker-label">📢 Updates</div>
          <div className="ticker-track">
            <div className="ticker-scroll">
              {[...announcements, ...announcements].map((item, idx) => (
                <span key={idx} className="ticker-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-num">{content.statsStudents}+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{content.statsFaculty}+</div>
              <div className="stat-label">Expert Faculty</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{content.statsPassRate}%</div>
              <div className="stat-label">Pass Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">{content.statsYears}+</div>
              <div className="stat-label">Years Legacy</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <div className="section-label">About Us</div>
              <h2 className="section-title">{content.aboutTitle}</h2>
              <p>{content.aboutDesc}</p>
              <p
                style={{
                  fontStyle: "italic",
                  color: "var(--navy)",
                  fontWeight: 500,
                }}
              >
                "{content.aboutMission}"
              </p>
              <div className="about-features">
                {(content.aboutFeatures || []).map((f, idx) => (
                  <div key={idx} className="about-feat">
                    <span className="check">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="about-image">
              <img src={content.aboutImage} alt="P.S. Academy Campus" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP SECTION ── */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Leadership</div>
            <h2 className="section-title">Meet Our Leaders</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Guided by visionaries dedicated to shaping the future of every
              student.
            </p>
          </div>
          <div className="leaders-grid">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="leader-card"
            >
              <img
                src={content.principalPhoto}
                alt={content.principalName}
                className="leader-img"
              />
              <div className="leader-overlay" />
              <div className="leader-content">
                <div className="leader-role">{content.principalRole}</div>
                <div className="leader-quote">"{content.principalQuote}"</div>
                <div className="leader-name">{content.principalName}</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="leader-card"
            >
              <img
                src={content.managerPhoto}
                alt={content.managerName}
                className="leader-img"
              />
              <div className="leader-overlay" />
              <div className="leader-content">
                <div className="leader-role">{content.managerRole}</div>
                <div className="leader-quote">"{content.managerQuote}"</div>
                <div className="leader-name">{content.managerName}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="section-label">Why Choose Us</div>
            <h2 className="section-title">Hamari Visheshtayen</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Jo cheezein hamein alag banati hain.
            </p>
          </div>
          <div className="features-grid">
            {whyCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="feature-card"
              >
                <div className="feature-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR CLASSES ── */}
      <section id="classes" className="section section-alt">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Our Classes</div>
            <h2 className="section-title">Academic Sections</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Har class ke liye alag approach — chaahe buniyad ho ya board ki
              taiyari.
            </p>
          </div>
          <div className="classes-grid">
            {classes.map((cls, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="class-card"
              >
                <img
                  src={cls.image}
                  alt={cls.title}
                  className="class-card-img"
                />
                <div className="class-card-overlay" />
                <div className="class-card-content">
                  <div className="class-card-tag">{cls.tag}</div>
                  <div className="class-card-title">{cls.title}</div>
                  <div className="class-card-desc">{cls.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTICE BOARD ── */}
      <section id="notices" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Notice Board</div>
            <h2 className="section-title">Latest Announcements</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Naye updates aur ghoshnaon ke liye dekhte rahein.
            </p>
          </div>
          <div className="notices-grid">
            {notices.map((n, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="notice-card"
              >
                <div className="notice-date">
                  <div className="notice-day">{n.day}</div>
                  <div className="notice-mon">{n.mon}</div>
                </div>
                <div className="notice-info">
                  <h3>{n.title}</h3>
                  <p>{n.desc}</p>
                  <span className={`notice-tag ${n.tag}`}>{n.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ── */}
      <section id="gallery" className="section section-alt">
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div className="section-label">Gallery</div>
              <h2 className="section-title">School Memories</h2>
              <p className="section-subtitle">Hamare school ki jhalakiyan.</p>
            </div>
            <Link to="/gallery" className="view-all-btn">
              View All Photos →
            </Link>
          </div>
          {galleryPreview.length > 0 ? (
            <div className="gallery-grid">
              {galleryPreview.map((photo, idx) => (
                <motion.div
                  key={photo.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="gallery-item"
                  onClick={() => setLightbox(photo)}
                >
                  <img
                    src={photo.image}
                    alt={photo.eventName || "School Photo"}
                  />
                  <div className="gallery-overlay">
                    <div className="gallery-event">
                      {photo.eventName || "School Event"}
                    </div>
                    <div className="gallery-name">{photo.eventDate || ""}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--gray-400)",
              }}
            >
              <p style={{ fontSize: "2rem", marginBottom: 12 }}>📸</p>
              <p>
                Gallery photos abhi add nahi hui hain. Web Admin se photos add
                karein.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Get in Touch</div>
            <h2 className="section-title">Sampark Karein</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Admission ke liye ya kisi bhi jankari ke liye humse sampark
              karein.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info-card">
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Address</h4>
                  <p>{content.contactAddress}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>{content.contactPhone}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>{content.contactEmail}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h4>Office Hours</h4>
                  <p>{content.contactHours}</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    "Thank you! Aapka enquiry form submit ho gaya hai. Hum jald hi aapse sampark karenge.",
                  );
                }}
              >
                <div className="form-group">
                  <label>Aapka Naam</label>
                  <input
                    type="text"
                    placeholder="Apna poora naam likhein"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" placeholder="+91 9XXXXXXXX" required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="example@email.com" />
                </div>
                <div className="form-group">
                  <label>Aapka Sandesh</label>
                  <textarea placeholder="Kya jankari chahiye? Admission, fees, classes ke baare mein..." />
                </div>
                <button type="submit" className="submit-btn">
                  Send Enquiry →
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div
                className="nav-logo-icon"
                style={{ width: 48, height: 48, fontSize: "1.3rem" }}
              >
                PS
              </div>
              <div
                className="nav-logo-text"
                style={{ color: "#fff", fontSize: "1.3rem", marginBottom: 8 }}
              >
                {content.schoolName}
              </div>
              <p>
                {content.schoolTagline} — Semra Khandoli, Agra mein CBSE
                affiliated school. Hum bachon ki shiksha aur unke sarvangin
                vikas ke liye pratibaddh hain.
              </p>
              <div className="footer-socials">
                <a
                  href={content.socialLinks?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  f
                </a>
                <a
                  href={content.socialLinks?.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  ig
                </a>
                <a
                  href={content.socialLinks?.youtube || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  yt
                </a>
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#classes">Our Classes</a>
                </li>
                <li>
                  <a href="#notices">Notice Board</a>
                </li>
                <li>
                  <a href="#gallery">Gallery</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
                <li>
                  <Link to="/gallery">All Photos</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Academics</h4>
              <ul className="footer-links">
                <li>
                  <a href="#classes">Primary (I-V)</a>
                </li>
                <li>
                  <a href="#classes">Middle (VI-VIII)</a>
                </li>
                <li>
                  <a href="#classes">High School (IX-X)</a>
                </li>
                <li>
                  <a href="#classes">Senior Secondary (XI-XII)</a>
                </li>
                <li>
                  <a href="#about">Facilities</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Contact Info</h4>
              <ul
                className="footer-links"
                style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}
              >
                <li style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span>📍</span> <span>{content.contactAddress}</span>
                </li>
                <li style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span>📞</span> <span>{content.contactPhone}</span>
                </li>
                <li style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span>✉️</span> <span>{content.contactEmail}</span>
                </li>
                <li style={{ display: "flex", gap: 8 }}>
                  <span>🕐</span> <span>{content.contactHours}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 {content.schoolName}. All rights reserved. | CBSE Affiliation
            No: 2132163
          </div>
        </div>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-bg" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            ✕
          </button>
          <img
            src={lightbox.image}
            alt={lightbox.eventName || "Photo"}
            onClick={(e) => e.stopPropagation()}
          />
          {(lightbox.eventName || lightbox.eventDate) && (
            <div className="lightbox-info">
              {lightbox.eventName && (
                <div className="ev">{lightbox.eventName}</div>
              )}
              {lightbox.eventDate && (
                <div className="dt">{lightbox.eventDate}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
