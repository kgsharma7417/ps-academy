import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --burgundy: #d3465a;
    --burgundy-dark: #b83048;
    --orange: #f18940;
    --orange-dark: #d4732a;
    --deep-blue: #00477a;
    --deep-blue-dark: #003460;
    --white: #ffffff;
    --off-white: #f7f8fc;
    --text-dark: #324c5e;
    --text-mid: #5a7080;
    --text-light: #8aa0b0;
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Open Sans', sans-serif;
    background: var(--white);
    color: var(--text-dark);
    overflow-x: hidden;
  }

  /* ── Main Navbar ── */
  .n-navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 199;
    display: flex; align-items: center; padding: 0 40px; height: 80px;
    transition: background 0.35s, box-shadow 0.35s;
    background: var(--burgundy);
    box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  }
  .n-navbar.scrolled {
    background: var(--burgundy-dark);
    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
  }
  .n-navbar-logo { display: flex; align-items: center; gap: 14px; text-decoration: none; flex-shrink: 0; }
  .n-logo-emblem {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #fff; overflow: hidden;
  }
  .n-logo-emblem img { width: 100%; height: 100%; object-fit: cover; }
  .n-logo-text { line-height: 1.25; }
  .n-logo-text .t1 { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #fff; display: block; letter-spacing: 0.02em; }
  .n-logo-text .t2 { font-size: 10px; color: rgba(255,255,255,0.65); display: block; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  .n-navlinks { margin-left: auto; display: flex; gap: 4px; align-items: center; }
  .n-navlink {
    font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9);
    text-decoration: none; padding: 10px 18px; border-radius: 4px;
    transition: all 0.2s; white-space: nowrap; font-family: 'Open Sans', sans-serif;
    background: none; border: none; cursor: pointer;
  }
  .n-navlink:hover { color: #fff; background: rgba(255,255,255,0.1); }
  .n-inquire-btn {
    margin-left: 16px; padding: 10px 24px; border-radius: 100px;
    border: 2px solid rgba(255,255,255,0.8); background: transparent;
    color: #fff; font-size: 14px; font-weight: 700;
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: all 0.25s; white-space: nowrap; font-family: 'Open Sans', sans-serif; cursor: pointer;
  }
  .n-inquire-btn:hover { background: #fff; color: var(--burgundy); }
  .n-menu-btn { display: none; background: none; border: none; color: #fff; padding: 8px; cursor: pointer; margin-left: 12px; }

  /* ── Hero Slider ── */
  .n-hero-wrapper { position: relative; width: 100%; height: calc(100vh - 0px); min-height: 600px; overflow: hidden; }
  .n-hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s ease; z-index: 0; }
  .n-hero-slide.active { opacity: 1; z-index: 1; }
  .n-hero-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .n-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,20,50,0.35) 0%, rgba(0,20,50,0.1) 40%, rgba(0,20,50,0.55) 100%);
    z-index: 2;
  }
  .n-hero-content { position: absolute; bottom: 14%; left: 5%; z-index: 3; max-width: 640px; color: #fff; }
  .n-hero-content h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 68px); font-weight: 700;
    line-height: 1.12; margin-bottom: 18px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.35);
  }
  .n-hero-content p { font-size: 17px; color: rgba(255,255,255,0.9); line-height: 1.7; text-shadow: 0 1px 8px rgba(0,0,0,0.3); }
  .n-hero-dots { position: absolute; bottom: 5%; right: 5%; display: flex; gap: 10px; align-items: center; z-index: 4; }
  .n-hero-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: rgba(255,255,255,0.45); border: 2px solid rgba(255,255,255,0.6);
    cursor: pointer; transition: all 0.3s; padding: 0;
  }
  .n-hero-dot.active { background: var(--orange); border-color: var(--orange); transform: scale(1.3); }
  .n-hero-dot-num { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }

  /* Sticky side portal button */
  .n-portal-side-btn {
    position: fixed; right: -62px; top: 50%;
    transform: translateY(-50%) rotate(90deg);
    transform-origin: right center;
    z-index: 150; border-radius: 4px 4px 0 0;
    background: var(--burgundy); color: #fff;
    padding: 13px 24px; font-size: 13px; font-weight: 700;
    text-decoration: none; display: flex; align-items: center; gap: 8px;
    transition: right 0.3s; letter-spacing: 0.05em;
    font-family: 'Open Sans', sans-serif; white-space: nowrap;
  }
  .n-portal-side-btn:hover { right: 0; }

  /* ── Stats Bar ── */
  .n-stats-bar {
    background: var(--deep-blue);
    display: flex; justify-content: center; gap: 0;
    flex-wrap: wrap;
  }
  .n-stat-item {
    padding: 20px 40px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.12);
    flex: 1; min-width: 120px;
  }
  .n-stat-item:last-child { border-right: none; }
  .n-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--orange);
    line-height: 1;
  }
  .n-stat-label { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── Leader Split Section ── */
  .n-leaders { display: grid; grid-template-columns: 1fr 1fr; min-height: 500px; }
  .n-leader-left {
    background: var(--burgundy); position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 50px 50px 40px; min-height: 460px;
  }
  .n-leader-right {
    background: var(--orange); position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 50px 50px 40px; min-height: 460px;
  }
  .n-leader-quote-mark {
    position: absolute; top: 40px; left: 44px;
    font-family: 'Playfair Display', serif; font-size: 100px; line-height: 0.8;
    color: rgba(255,255,255,0.18); pointer-events: none;
  }
  .n-leader-bg-pattern {
    position: absolute; top: 0; right: 0; bottom: 0; width: 60%;
    background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
    background-size: 22px 22px; pointer-events: none;
  }
  .n-leader-heading {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 2.5vw, 30px); font-weight: 600;
    color: rgba(255,255,255,0.9); line-height: 1.35;
    margin-bottom: 22px; margin-top: 60px; max-width: 360px;
  }
  .n-leader-quote { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.8; margin-bottom: 30px; max-width: 440px; }
  .n-leader-divider { width: 60px; height: 2px; background: rgba(255,255,255,0.4); margin-bottom: 18px; }
  .n-leader-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
  .n-leader-title { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 500; margin-top: 4px; }
  .n-leader-photo {
    position: absolute; bottom: 0; right: 0;
    width: 45%; max-height: 420px;
    object-fit: cover; object-position: top center; pointer-events: none;
  }

  /* ── Section Base ── */
  .n-section { padding: 80px 40px; }
  .n-section.alt-bg { background: var(--off-white); }
  .n-section-inner { max-width: 1200px; margin: 0 auto; }
  .n-section-header { text-align: center; margin-bottom: 50px; }
  .n-section-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 3.5vw, 44px); font-weight: 700; color: var(--text-dark); line-height: 1.2; }
  .n-section-sub { font-size: 16px; color: var(--text-mid); margin-top: 14px; line-height: 1.7; max-width: 560px; margin-left: auto; margin-right: auto; }

  /* ── Campuses / Feature Cards ── */
  .n-campuses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .n-campus-card { border-radius: 16px; overflow: hidden; position: relative; cursor: pointer; transition: transform 0.3s; text-decoration: none; }
  .n-campus-card:hover { transform: translateY(-6px); }
  .n-campus-card-img { width: 100%; height: 280px; object-fit: cover; display: block; }
  .n-campus-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; color: #fff; }
  .n-campus-card-overlay h3 { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; }
  .n-campus-card-overlay p { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; }

  /* ── Admissions CTA ── */
  .n-admissions { display: grid; grid-template-columns: 1fr 1fr; min-height: 360px; background: var(--burgundy); }
  .n-admissions-content { padding: 70px 60px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
  .n-admissions-content h2 { font-family: 'Playfair Display', serif; font-size: clamp(36px,4vw,56px); font-weight: 700; color: #fff; line-height: 1.1; }
  .n-admissions-content p { font-size: 16px; color: rgba(255,255,255,0.85); line-height: 1.7; max-width: 380px; }
  .n-admissions-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px;
    border-radius: 100px; border: 2px solid rgba(255,255,255,0.85); background: transparent;
    color: #fff; font-size: 14px; font-weight: 700; text-decoration: none;
    width: fit-content; transition: all 0.25s; font-family: 'Open Sans', sans-serif; cursor: pointer;
  }
  .n-admissions-btn:hover { background: #fff; color: var(--burgundy); }
  .n-admissions-img { height: 100%; width: 100%; object-fit: cover; display: block; }

  /* ── Notices ── */
  .n-notices-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .n-notice-card {
    display: flex; gap: 18px; align-items: flex-start;
    background: #fff; border-radius: 12px; padding: 22px;
    border: 1px solid #e8edf3; transition: border-color 0.2s, transform 0.2s;
  }
  .n-notice-card:hover { border-color: var(--burgundy); transform: translateX(4px); }
  .n-notice-date { flex-shrink: 0; text-align: center; background: var(--deep-blue); border-radius: 10px; padding: 10px 14px; color: #fff; min-width: 56px; }
  .n-notice-date .day { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }
  .n-notice-date .mon { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--orange); }
  .n-notice-title { font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 6px; }
  .n-notice-desc { font-size: 13px; color: var(--text-mid); line-height: 1.65; }
  .n-notice-tag { display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; }
  .n-tag-exam { background: #fde8e8; color: #b83048; }
  .n-tag-event { background: #e3e9fb; color: #2d3f8f; }
  .n-tag-holiday { background: #e2f0d9; color: #3a5a2a; }
  .n-tag-meeting { background: #fff3e0; color: #8a5a06; }

  /* ── Features ── */
  .n-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 24px; }
  .n-feature-card { background: #fff; border-radius: 16px; padding: 34px 28px; border: 1px solid #e8edf3; transition: all 0.25s; }
  .n-feature-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,71,122,0.1); border-color: var(--deep-blue); }
  .n-feature-icon { width: 54px; height: 54px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 20px; }
  .n-feature-card h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text-dark); margin-bottom: 10px; }
  .n-feature-card p { font-size: 14px; color: var(--text-mid); line-height: 1.7; }

  /* ── Principal ── */
  .n-principal-card {
    background: linear-gradient(135deg, var(--deep-blue) 0%, var(--deep-blue-dark) 100%);
    border-radius: 24px; padding: 56px;
    display: grid; grid-template-columns: 180px 1fr; gap: 48px;
    align-items: center; color: #fff;
  }
  .n-principal-avatar {
    width: 160px; height: 160px; border-radius: 20px;
    background: rgba(255,255,255,0.12); border: 3px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700;
    color: rgba(255,255,255,0.85); flex-shrink: 0;
  }
  .n-principal-quote-mark { font-family: 'Playfair Display', serif; font-size: 80px; line-height: 0.7; color: rgba(255,255,255,0.2); margin-bottom: 16px; }
  .n-principal-quote { font-size: 16px; line-height: 1.9; color: rgba(255,255,255,0.85); font-style: italic; margin-bottom: 28px; }
  .n-principal-divider { width: 48px; height: 2px; background: var(--orange); margin-bottom: 16px; }
  .n-principal-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--orange); }
  .n-principal-role { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px; }

  /* ── Gallery ── */
  .n-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 220px; gap: 14px; }
  .n-gallery-item { border-radius: 14px; overflow: hidden; position: relative; cursor: pointer; }
  .n-gallery-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
  .n-gallery-item:nth-child(4) { grid-column: span 2; }
  .n-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
  .n-gallery-item:hover .n-gallery-img { transform: scale(1.06); }
  .n-gallery-caption {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(0deg, rgba(0,20,50,0.85) 0%, transparent 100%);
    color: #fff; padding: 20px 16px 14px; font-size: 13px; font-weight: 600;
    opacity: 0; transition: opacity 0.3s;
  }
  .n-gallery-item:hover .n-gallery-caption { opacity: 1; }

  /* ── Contact ── */
  .n-contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; align-items: start; }
  .n-contact-info { display: flex; flex-direction: column; gap: 16px; }
  .n-contact-card {
    display: flex; gap: 16px; align-items: flex-start;
    background: var(--off-white); border-radius: 12px; padding: 18px 20px;
    border: 1px solid #e8edf3;
  }
  .n-contact-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--deep-blue); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .n-contact-label { font-size: 11px; color: var(--text-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .n-contact-value { font-size: 14.5px; font-weight: 600; color: var(--text-dark); line-height: 1.5; }
  .n-contact-form { display: flex; flex-direction: column; gap: 14px; }
  .n-field-label { font-size: 12px; font-weight: 600; color: var(--text-mid); margin-bottom: 5px; display: block; }
  .n-field-input, .n-field-select, .n-field-textarea {
    width: 100%; padding: 12px 16px; border: 1.5px solid #d8e4ee; border-radius: 10px;
    font-size: 14px; font-family: 'Open Sans', sans-serif;
    outline: none; background: #fff; color: var(--text-dark); transition: border-color 0.2s;
  }
  .n-field-input:focus, .n-field-select:focus, .n-field-textarea:focus { border-color: var(--deep-blue); }
  .n-field-textarea { resize: none; }
  .n-submit-btn {
    padding: 14px; background: var(--deep-blue); color: #fff;
    border: none; border-radius: 10px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Open Sans', sans-serif; transition: background 0.2s; width: 100%;
  }
  .n-submit-btn:hover { background: var(--deep-blue-dark); }
  .n-form-success { background: #e2f0d9; color: #3a5a2a; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; }

  /* ── Footer ── */
  .n-footer { background: var(--deep-blue); color: rgba(255,255,255,0.7); padding: 60px 40px 28px; }
  .n-footer-inner { max-width: 1200px; margin: 0 auto; }
  .n-footer-grid { display: grid; grid-template-columns: 200px 1fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .n-footer-logo { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
  .n-footer-logo-emblem {
    width: 66px; height: 66px; border-radius: 50%;
    background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #fff; overflow: hidden;
  }
  .n-footer-logo-emblem img { width: 100%; height: 100%; object-fit: cover; }
  .n-footer-logo-name { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #fff; line-height: 1.4; }
  .n-footer-logo-est { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
  .n-footer-col h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fff; margin-bottom: 18px; }
  .n-footer-col a, .n-footer-col button {
    display: block; font-size: 13px; color: rgba(255,255,255,0.65);
    text-decoration: none; margin-bottom: 12px;
    transition: color 0.18s; background: none; border: none;
    cursor: pointer; text-align: left; font-family: 'Open Sans', sans-serif; padding: 0;
  }
  .n-footer-col a:hover, .n-footer-col button:hover { color: var(--orange); }
  .n-footer-social { display: flex; gap: 12px; margin-top: 16px; }
  .n-social-link {
    width: 38px; height: 38px; border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.7); font-size: 16px;
    text-decoration: none; transition: all 0.2s;
  }
  .n-social-link:hover { border-color: var(--orange); color: var(--orange); }
  .n-footer-bottom {
    padding-top: 24px; display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: rgba(255,255,255,0.4); flex-wrap: wrap; gap: 10px;
  }

  /* ── Mobile Menu ── */
  .n-mobile-menu { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 300; transform: translateX(-100%); transition: transform 0.35s cubic-bezier(.4,0,.2,1); }
  .n-mobile-menu.open { transform: translateX(0); }
  .n-mobile-menu-panel { position: absolute; top: 0; left: 0; bottom: 0; width: 280px; background: var(--burgundy-dark); padding: 24px 0; display: flex; flex-direction: column; overflow-y: auto; box-shadow: 8px 0 32px rgba(0,0,0,0.35); }
  .n-mobile-menu-close { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 22px; cursor: pointer; padding: 8px 20px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-family: 'Open Sans', sans-serif; }
  .n-mobile-menu-close:hover { color: #fff; }
  .n-mobile-link { display: block; padding: 14px 24px; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.8); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.08); transition: all 0.18s; cursor: pointer; background: none; font-family: 'Open Sans', sans-serif; text-align: left; width: 100%; }
  .n-mobile-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .n-mobile-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .n-campuses-grid { grid-template-columns: 1fr 1fr; }
    .n-footer-grid { grid-template-columns: 1fr 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .n-navbar { padding: 0 20px; height: 70px; }
    .n-navlinks .n-navlink:not(.n-inquire-btn) { display: none; }
    .n-menu-btn { display: block; }
    .n-hero-wrapper { height: 70vh; }
    .n-leaders { grid-template-columns: 1fr; }
    .n-admissions { grid-template-columns: 1fr; }
    .n-admissions-img { height: 280px; }
    .n-campuses-grid { grid-template-columns: 1fr; }
    .n-notices-grid { grid-template-columns: 1fr; }
    .n-principal-card { grid-template-columns: 1fr; padding: 36px 28px; text-align: center; }
    .n-principal-avatar { margin: 0 auto; }
    .n-principal-divider { margin: 0 auto 16px; }
    .n-gallery-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; }
    .n-gallery-item:nth-child(1), .n-gallery-item:nth-child(4) { grid-column: span 2; grid-row: span 1; }
    .n-contact-grid { grid-template-columns: 1fr; }
    .n-footer-grid { grid-template-columns: 1fr 1fr; }
    .n-section { padding: 50px 20px; }
    .n-admissions-content { padding: 44px 28px; }
    .n-leader-left, .n-leader-right { padding: 36px 28px 36px; }
    .n-leader-photo { width: 40%; }
    .n-stats-bar .n-stat-item { padding: 16px 20px; min-width: 100px; }
  }
  @media (max-width: 480px) {
    .n-hero-content h1 { font-size: 28px; }
    .n-gallery-grid { grid-template-columns: 1fr; }
    .n-gallery-item:nth-child(1), .n-gallery-item:nth-child(4) { grid-column: span 1; }
    .n-footer-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Default Content (PS Academy Semra Khandoli, Agra) ───────────────────────
const DEFAULT_CONTENT = {
  heroTitle: "P.S. Academy",
  heroSubtitle:
    "P.S. Academy Semra Khandoli, Agra mein ek up-board se affiliates school hai. Hum bachon ki shiksha aur unke sarvagina vikas ke liye pratibaddh hain — academic excellence, naitik mulya, aur holistic development.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
  ctaText: "Admission ke liye sampark karein →",
  ctaSecondary: "Hamare School ko jaanein",
  heroBadge: "Admissions Open 2025–26",
  statsStudents: 4050,
  statsFaculty: 330,
  statsLabs: 12,
  statsPassRate: 96,
  statsYears: 20,
  slides: [
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
      caption: "🏫 P.S. Academy Semra Khandoli — Agra",
    },
    {
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
      caption: "📚 Aadhunik Classes — Gyan ki nai pehchan",
    },
    {
      src: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=1920&auto=format&fit=crop",
      caption: "🔬 Science Labs — Practical Shiksha",
    },
    {
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1920&auto=format&fit=crop",
      caption: "⚽ Khel Ka Maidan — Sarvangin Vikas",
    },
  ],
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900&auto=format&fit=crop",
      caption: "📍 P.S. Academy Campus — Semra Khandoli",
    },
    {
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop",
      caption: "🏫 Aadhunik Classes",
    },
    {
      src: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=900&auto=format&fit=crop",
      caption: "🔬 Science Laboratory",
    },
    {
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=900&auto=format&fit=crop",
      caption: "⚽ Sports Ground",
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900&auto=format&fit=crop",
      caption: "🎭 Varshik Samaroh",
    },
  ],
  principalQuoteShort:
    "Shiksha ka uddeshya sirf marks nahi hai — yeh har bachche mein jigyasa, anushasan aur manavta ki lau jalane ka madhyam hai. P.S. Academy mein hum pratyek vidyarthi mein apni mahima pahchanne mein vishwas rakhte hain.",
  principalName: "Principal - P.S. Academy",
  principalFull:
    "Shiksha ka uddeshya sirf akademik vikas nahi, balki ek aisa vatavaran banana hai jahan vidyarthi aur shikshak dono apne lakshya ko prapt kar sake. P.S. Academy Semra Khandoli, Agra mein hum bachchon ko theory aur practical dono mein maharat hasil karne ka avsar pradan karte hain. Humari jimmedari hai ki har bachche ko aise sthal pradan karein jo unki shiksha aur sahavidyarthi vikas mein sahayak ho. Principal ke roop mein mera prayaas hai ki har pidhi ko avsar, samman aur safalta ka marg dikhaya jaye.",
  managerName: "P.S. Academy Prabandhan Samiti",
  managerFull:
    "P.S. Academy Semra Khandoli, Agra ka prabandhan samiti hamesha se ek aisi shikshan sanstha pradan karne ke liye pratibaddh raha hai jo sabke liye sulabh, sasta aur uttam koti ki ho. Humne aadhunik classes, yogya teachers aur ek aisa mahaul banaya hai jo jigyasa aur vikas ko badhava de. Hamare vidyarthi hi hamari sabse badi uplabdhi hain.",
  contactAddress: "P.S. Academy, Semra Khandoli, Agra, Uttar Pradesh",
  contactPhone: "+91 99271 70258",
  contactPhoneAdmission: "+91 99271 70258",
  contactEmail: "psacademysemra@gmail.com",
  contactHours: "Mon – Sat: 8:00 AM – 3:00 PM",
  notices: [
    {
      day: "01",
      mon: "Apr",
      title: "Naye Shiksha Sesh 2025–26 ke liye Admission Khule",
      desc: "Class 1 se 11 tak admission khule hain. School office se sampark karein 9 AM se 2 PM ke beech. Aavashyak dastawej: Birth certificate, marksheet, Aadhar card.",
      tag: "event",
    },
    {
      day: "15",
      mon: "Aug",
      title: "Swatantrata Diwas Samaroh – 15 August",
      desc: "Sabhi vidyarthi aur staff 15 August ko 7:00 AM par upasthit rahein. Jhanda fahran aur sanskritik karyakram honge. White uniform anivarya hai.",
      tag: "event",
    },
    {
      day: "10",
      mon: "Jun",
      title: "Parent-Teacher Meeting – Class 6 se 10",
      desc: "Classes 6 se 10 ki PTM 22 June (Shanivar) 9 AM – 1 PM ke beech hogi. Abhibhavak apne bachche ki progress report lena na bhoolen.",
      tag: "meeting",
    },
    {
      day: "05",
      mon: "Jun",
      title: "Garmi ki Chhuttiyan",
      desc: "Vidyalay 20 June se 30 June tak garmi ki chhuttiyon ke liye band rahega. Classes 1 July se punah suru hongi.",
      tag: "holiday",
    },
  ],
  whyCards: [
    {
      icon: "🏆",
      title: "Academic Excellence",
      desc: "UP Board exams mein lagatar behtarin parinam — 96%+ pass rate har saal.",
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
      desc: "Varshik khel samaroh, sanskritik karyakram, drawing competition — pratibha ki pehchan.",
    },
  ],
};

const CAMPUS_CARDS = [
  {
    img: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=900&auto=format&fit=crop",
    title: "Primary Section",
    desc: "Classes I – V",
    color: "var(--burgundy)",
  },
  {
    img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=900&auto=format&fit=crop",
    title: "Middle & High School",
    desc: "Classes VI – X",
    color: "var(--orange)",
  },
  {
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=900&auto=format&fit=crop",
    title: "Senior Secondary",
    desc: "Classes XI – XII (Science, Commerce, Arts)",
    color: "var(--deep-blue)",
  },
];

const TAG_STYLES = {
  exam: "n-tag-exam",
  event: "n-tag-event",
  holiday: "n-tag-holiday",
  meeting: "n-tag-meeting",
};
const TAG_LABELS = {
  exam: "Exam",
  event: "Event",
  holiday: "Holiday",
  meeting: "PTM",
};
const ICON_BG = [
  "#fff0f2",
  "#f0f4ff",
  "#fff8e8",
  "#f0fff4",
  "#f5f0ff",
  "#fff0f8",
];

const STORAGE_KEY = "school_erp_landing_content_v2";

// ─── Component ────────────────────────────────────────────────────────────────
export const LandingPage = () => {
  const [c, setC] = useState(DEFAULT_CONTENT); // c = content
  const [slideIdx, setSlideIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const { userRole } = useAuth();
  const slideTimer = useRef(null);
  const lastRawRef = useRef(null); // tracks last-seen raw JSON string from localStorage

  // ── Inject CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Load content from localStorage (WebAdmin saves here)
  // Combines: custom in-tab event, native cross-tab "storage" event,
  // window focus, and a short poll — so the page updates no matter
  // which of those signals actually fires in this environment.
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== lastRawRef.current) {
          lastRawRef.current = saved;
          setC({ ...DEFAULT_CONTENT, ...JSON.parse(saved) });
        }
      } catch {
        // ignore malformed JSON in storage
      }
    };

    load(); // initial load

    window.addEventListener("storage", load);
    window.addEventListener("school-erp-content-updated", load);
    window.addEventListener("focus", load);

    // Safety-net poll: catches updates even if an event listener
    // got detached due to a remount, or if the save happened in a
    // way that didn't fire the custom event.
    const pollId = setInterval(load, 1500);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("school-erp-content-updated", load);
      window.removeEventListener("focus", load);
      clearInterval(pollId);
    };
  }, []);

  // ── Hero auto-slide
  useEffect(() => {
    const slides = c.slides || [];
    if (slides.length < 2) return;
    slideTimer.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideTimer.current);
  }, [c.slides]);

  // Reset slide index if slides change
  useEffect(() => {
    setSlideIdx(0);
  }, [c.slides?.length]);

  // ── Navbar scroll
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const goToSlide = useCallback(
    (i) => {
      setSlideIdx(i);
      clearInterval(slideTimer.current);
      const slides = c.slides || [];
      if (slides.length > 1) {
        slideTimer.current = setInterval(() => {
          setSlideIdx((s) => (s + 1) % slides.length);
        }, 5000);
      }
    },
    [c.slides],
  );

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "webadmin") return "/webadmin";
    if (userRole === "teacher") return "/teacher";
    if (userRole === "parent") return "/parent";
    return "/login";
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
    e.target.reset();
  };

  const slides = c.slides || [];
  const gallery = c.gallery || [];
  const notices = c.notices || [];
  const whyCards = c.whyCards || [];

  const principalInitials = (c.principalName || "PS")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className={`n-navbar${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="n-navbar-logo">
          <div className="n-logo-emblem">
            <span style={{ fontSize: 14 }}>PS</span>
          </div>
          <div className="n-logo-text">
            <span className="t1">P.S. Academy</span>
            <span className="t2">Semra Khandoli, Agra · UP Board</span>
          </div>
        </a>
        <div className="n-navlinks">
          <button className="n-navlink" onClick={() => scrollTo("n-about")}>
            About Us
          </button>
          <button className="n-navlink" onClick={() => scrollTo("n-features")}>
            Academics
          </button>
          <button className="n-navlink" onClick={() => scrollTo("n-gallery")}>
            Gallery
          </button>
          <button className="n-navlink" onClick={() => scrollTo("n-notices")}>
            Notices
          </button>
          <button className="n-navlink" onClick={() => scrollTo("n-contact")}>
            Contact
          </button>
          <Link to={getDashboardPath()} className="n-inquire-btn">
            {userRole ? "My Dashboard ↗" : "Portal Login ↗"}
          </Link>
          <button className="n-menu-btn" onClick={() => setMenuOpen(true)}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`n-mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="n-mobile-overlay" onClick={() => setMenuOpen(false)} />
        <div className="n-mobile-menu-panel">
          <button
            className="n-mobile-menu-close"
            onClick={() => setMenuOpen(false)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
          {["n-about", "n-features", "n-gallery", "n-notices", "n-contact"].map(
            (id, i) => (
              <button
                key={id}
                className="n-mobile-link"
                onClick={() => scrollTo(id)}
              >
                {["About Us", "Academics", "Gallery", "Notices", "Contact"][i]}
              </button>
            ),
          )}
          <Link
            to={getDashboardPath()}
            className="n-mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            {userRole ? "My Dashboard" : "Portal Login"}
          </Link>
        </div>
      </div>

      {/* ── Hero Slider ── */}
      <div style={{ marginTop: "80px" }}>
        <div className="n-hero-wrapper">
          {slides.length > 0 ? (
            slides.map((slide, i) => (
              <div
                key={i}
                className={`n-hero-slide${slideIdx === i ? " active" : ""}`}
              >
                <img src={slide.src} alt={slide.caption || `Slide ${i + 1}`} />
              </div>
            ))
          ) : (
            <div className="n-hero-slide active">
              <img src={DEFAULT_CONTENT.slides[0].src} alt="Hero" />
            </div>
          )}
          <div className="n-hero-overlay" />
          <div className="n-hero-content">
            <h1>{c.heroTitle || DEFAULT_CONTENT.heroTitle}</h1>
            <p>{c.heroSubtitle || DEFAULT_CONTENT.heroSubtitle}</p>
          </div>
          {slides.length > 1 && (
            <div className="n-hero-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`n-hero-dot${slideIdx === i ? " active" : ""}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
              <span className="n-hero-dot-num">{slideIdx + 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky portal side tab */}
      <Link
        to={getDashboardPath()}
        className="n-portal-side-btn"
        onMouseEnter={(e) => {
          e.currentTarget.style.right = "0px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.right = "-62px";
        }}
      >
        <span>⌃</span> Portal Login
      </Link>

      {/* ── Stats Bar ── */}
      <div className="n-stats-bar">
        <div className="n-stat-item">
          <div className="n-stat-num">{c.statsStudents || 4050}+</div>
          <div className="n-stat-label">Students</div>
        </div>
        <div className="n-stat-item">
          <div className="n-stat-num">{c.statsFaculty || 330}+</div>
          <div className="n-stat-label">Staff</div>
        </div>
        <div className="n-stat-item">
          <div className="n-stat-num">{c.statsPassRate || 96}%</div>
          <div className="n-stat-label">Pass Rate</div>
        </div>
        <div className="n-stat-item">
          <div className="n-stat-num">{c.statsLabs || 12}</div>
          <div className="n-stat-label">Modern Labs</div>
        </div>
        <div className="n-stat-item">
          <div className="n-stat-num">{c.statsYears || 20}+</div>
          <div className="n-stat-label">Years of Service</div>
        </div>
      </div>

      {/* ── Leader / Vision Split Section ── */}
      <div id="n-about" className="n-leaders">
        <div className="n-leader-left">
          <div className="n-leader-bg-pattern" />
          <div className="n-leader-quote-mark">"</div>
          <div className="n-leader-heading">Shiksha mein Uttamta ka Vision</div>
          <div className="n-leader-quote">
            {c.principalFull || DEFAULT_CONTENT.principalFull}
          </div>
          <div className="n-leader-divider" />
          <div className="n-leader-name">
            {c.principalName || DEFAULT_CONTENT.principalName}
          </div>
          <div className="n-leader-title">Principal</div>
          <img
            className="n-leader-photo"
            src="https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?q=80&w=600&auto=format&fit=crop"
            alt="Principal"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="n-leader-right">
          <div className="n-leader-bg-pattern" />
          <div className="n-leader-quote-mark">"</div>
          <div style={{ height: "60px" }} />
          <div className="n-leader-quote">
            {c.managerFull || DEFAULT_CONTENT.managerFull}
          </div>
          <div className="n-leader-divider" />
          <div className="n-leader-name">
            {c.managerName || DEFAULT_CONTENT.managerName}
          </div>
          <div className="n-leader-title">Prabandhan Samiti</div>
          <img
            className="n-leader-photo"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
            alt="Management"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* ── Campuses ── */}
      <div className="n-section alt-bg">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">Hamara Campus</h2>
            <p className="n-section-sub">
              Ek chhat ke neeche prathmik, madhyamik aur senior madhyamik
              shiksha — teeno star par uttamta.
            </p>
          </div>
          <div className="n-campuses-grid">
            {CAMPUS_CARDS.map((card, i) => (
              <div className="n-campus-card" key={i}>
                <img
                  className="n-campus-card-img"
                  src={card.img}
                  alt={card.title}
                />
                <div
                  className="n-campus-card-overlay"
                  style={{
                    background: `linear-gradient(0deg, ${card.color}ee 0%, ${card.color}88 40%, transparent 100%)`,
                  }}
                >
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Admissions CTA ── */}
      <div className="n-admissions">
        <div className="n-admissions-content">
          <h2>Admissions</h2>
          <p>{c.ctaText || DEFAULT_CONTENT.ctaText}</p>
          <button
            className="n-admissions-btn"
            onClick={() => scrollTo("n-contact")}
          >
            Abhi Inquiry Karein ↗
          </button>
        </div>
        <img
          className="n-admissions-img"
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=900&auto=format&fit=crop"
          alt="Students"
        />
      </div>

      {/* ── Notices ── */}
      <div id="n-notices" className="n-section">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">Notices aur Announcements</h2>
            <p className="n-section-sub">
              School ke naye updates, events aur important notices se update
              rahein.
            </p>
          </div>
          {notices.length > 0 ? (
            <div className="n-notices-grid">
              {notices.map((n, i) => (
                <div className="n-notice-card" key={i}>
                  <div className="n-notice-date">
                    <div className="day">{n.day}</div>
                    <div className="mon">{n.mon}</div>
                  </div>
                  <div>
                    <div className="n-notice-title">{n.title}</div>
                    <div className="n-notice-desc">{n.desc}</div>
                    <span
                      className={`n-notice-tag ${TAG_STYLES[n.tag] || "n-tag-event"}`}
                    >
                      {TAG_LABELS[n.tag] || n.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-mid)",
                padding: "40px",
                background: "var(--off-white)",
                borderRadius: "16px",
              }}
            >
              Koi notices nahi hain filhaal. WebAdmin se notices add karo.
            </div>
          )}
        </div>
      </div>

      {/* ── Features / Why Us ── */}
      <div id="n-features" className="n-section alt-bg">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">Kyun P.S. Academy?</h2>
            <p className="n-section-sub">
              Aadhunik infrastructure, samarpit faculty aur student-first
              approach ke saath shiksha mein uttamta.
            </p>
          </div>
          <div className="n-features-grid">
            {whyCards.map((f, i) => (
              <div className="n-feature-card" key={i}>
                <div
                  className="n-feature-icon"
                  style={{ background: ICON_BG[i % ICON_BG.length] }}
                >
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Principal's Message ── */}
      <div className="n-section">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">Principal ka Sandesh</h2>
          </div>
          <div className="n-principal-card">
            <div className="n-principal-avatar">{principalInitials}</div>
            <div>
              <div className="n-principal-quote-mark">"</div>
              <div className="n-principal-quote">
                {c.principalQuoteShort || DEFAULT_CONTENT.principalQuoteShort}
              </div>
              <div className="n-principal-divider" />
              <div className="n-principal-name">
                {c.principalName || DEFAULT_CONTENT.principalName}
              </div>
              <div className="n-principal-role">
                Principal · P.S. Academy Semra Khandoli
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div id="n-gallery" className="n-section alt-bg">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">P.S. Academy ki Jhalak</h2>
            <p className="n-section-sub">
              Hamare vibrant campus life, events aur achievements ki ek jhalak.
            </p>
          </div>
          {gallery.length > 0 ? (
            <div className="n-gallery-grid">
              {gallery.map((g, i) => (
                <div className="n-gallery-item" key={i}>
                  <img
                    className="n-gallery-img"
                    src={g.src}
                    alt={g.caption || `Gallery ${i + 1}`}
                  />
                  {g.caption && (
                    <div className="n-gallery-caption">{g.caption}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-mid)",
                padding: "40px",
                background: "#fff",
                borderRadius: "16px",
              }}
            >
              Gallery mein koi photos nahi hain. WebAdmin se photos add karo.
            </div>
          )}
        </div>
      </div>

      {/* ── Contact ── */}
      <div id="n-contact" className="n-section">
        <div className="n-section-inner">
          <div className="n-section-header">
            <h2 className="n-section-title">Humse Sampark Karein</h2>
            <p className="n-section-sub">
              Admission, query ya campus visit ke liye Agra mein humse sampark
              karein.
            </p>
          </div>
          <div className="n-contact-grid">
            <div className="n-contact-info">
              <div className="n-contact-card">
                <div className="n-contact-icon">📍</div>
                <div>
                  <div className="n-contact-label">Pata</div>
                  <div className="n-contact-value">
                    {c.contactAddress || DEFAULT_CONTENT.contactAddress}
                  </div>
                </div>
              </div>
              <div className="n-contact-card">
                <div className="n-contact-icon">📞</div>
                <div>
                  <div className="n-contact-label">Phone</div>
                  <div className="n-contact-value">
                    {c.contactPhone || DEFAULT_CONTENT.contactPhone}
                  </div>
                  {c.contactPhoneAdmission && (
                    <div
                      className="n-contact-value"
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: "var(--text-mid)",
                      }}
                    >
                      Admission: {c.contactPhoneAdmission}
                    </div>
                  )}
                </div>
              </div>
              <div className="n-contact-card">
                <div className="n-contact-icon">✉️</div>
                <div>
                  <div className="n-contact-label">Email</div>
                  <div className="n-contact-value">
                    {c.contactEmail || DEFAULT_CONTENT.contactEmail}
                  </div>
                </div>
              </div>
              <div className="n-contact-card">
                <div className="n-contact-icon">🕐</div>
                <div>
                  <div className="n-contact-label">Office Hours</div>
                  <div className="n-contact-value">
                    {c.contactHours || DEFAULT_CONTENT.contactHours}
                  </div>
                </div>
              </div>
            </div>

            <form className="n-contact-form" onSubmit={handleFormSubmit}>
              <div>
                <label className="n-field-label">Poora Naam</label>
                <input
                  type="text"
                  className="n-field-input"
                  placeholder="Apna poora naam"
                  required
                />
              </div>
              <div>
                <label className="n-field-label">Phone Number</label>
                <input
                  type="tel"
                  className="n-field-input"
                  placeholder="+91 00000 00000"
                  required
                />
              </div>
              <div>
                <label className="n-field-label">Enquiry Type</label>
                <select className="n-field-select" required>
                  <option value="">Select karein...</option>
                  <option>Admission Enquiry</option>
                  <option>General Query</option>
                  <option>Fee Information</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="n-field-label">Sandesh</label>
                <textarea
                  className="n-field-textarea"
                  rows={4}
                  placeholder="Apna sandesh likhein..."
                />
              </div>
              <button type="submit" className="n-submit-btn">
                Sandesh Bhejein →
              </button>
              {formSent && (
                <div className="n-form-success">
                  ✅ Aapka sandesh bheja gaya! Hum jald hi sampark karenge.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="n-footer">
        <div className="n-footer-inner">
          <div className="n-footer-grid">
            <div className="n-footer-logo">
              <div className="n-footer-logo-emblem">
                <span style={{ fontSize: 18 }}>PS</span>
              </div>
              <div>
                <div className="n-footer-logo-name">P.S. Academy</div>
                <div className="n-footer-logo-est">
                  Est. · Semra Khandoli, Agra
                </div>
              </div>
              <div className="n-footer-social">
                <a href="#" className="n-social-link" aria-label="Facebook">
                  f
                </a>
                <a href="#" className="n-social-link" aria-label="WhatsApp">
                  W
                </a>
                <a href="#" className="n-social-link" aria-label="YouTube">
                  ▶
                </a>
              </div>
            </div>
            <div className="n-footer-col">
              <h4>Quick Links</h4>
              <button onClick={() => scrollTo("n-about")}>About Us</button>
              <button onClick={() => scrollTo("n-features")}>Academics</button>
              <button onClick={() => scrollTo("n-gallery")}>Gallery</button>
              <button onClick={() => scrollTo("n-notices")}>Notices</button>
              <button onClick={() => scrollTo("n-contact")}>Contact</button>
            </div>
            <div className="n-footer-col">
              <h4>Academics</h4>
              <a href="#">Primary Section (I–V)</a>
              <a href="#">Middle School (VI–VIII)</a>
              <a href="#">High School (IX–X)</a>
              <a href="#">Senior Secondary (XI–XII)</a>
            </div>
            <div className="n-footer-col">
              <h4>Admissions</h4>
              <button onClick={() => scrollTo("n-contact")}>Apply Now</button>
              <a href="#">Fee Structure</a>
              <a href="#">Scholarships</a>
              <a href="#">Documents Required</a>
            </div>
            <div className="n-footer-col">
              <h4>Contact</h4>
              <a href={`tel:${c.contactPhone || DEFAULT_CONTENT.contactPhone}`}>
                {c.contactPhone || DEFAULT_CONTENT.contactPhone}
              </a>
              <a
                href={`mailto:${c.contactEmail || DEFAULT_CONTENT.contactEmail}`}
              >
                {c.contactEmail || DEFAULT_CONTENT.contactEmail}
              </a>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.55)",
                  display: "block",
                  marginTop: 4,
                }}
              >
                {c.contactHours || DEFAULT_CONTENT.contactHours}
              </span>
            </div>
          </div>
          <div className="n-footer-bottom">
            <span>
              © {new Date().getFullYear()} P.S. Academy Semra Khandoli, Agra.
              All rights reserved.
            </span>
            <span>UP Board Affiliated · Designed with ❤️ for Education</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
