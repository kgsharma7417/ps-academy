import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  db,
  setDoc,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
} from "../firebase";
import { uploadImageToCloudinary } from "../utils/cloudinary";

const Icon = ({ d, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  globe:
    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0c-2.5 2.5-4 5.9-4 10s1.5 7.5 4 10m0-20c2.5 2.5 4 5.9 4 10s-1.5 7.5-4 10M2 12h20",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8",
  image:
    "M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21",
  stats: "M18 20V10 M12 20V4 M6 20v-6",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
  plus: "M12 5v14 M5 12h14",
  trash:
    "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  layout: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  x: "M18 6 6 18 M6 6l12 12",
  move: "M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l-3 3-3-3 M19 9l3 3-3 3 M2 12h20 M12 2v20",
  speaker:
    "M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 16v-4 M12 8h.01",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFAULT CONTENT — matches new LandingPage.jsx structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_CONTENT = {
  schoolName: "P.S. Academy",
  schoolTagline: "Dare to Dream... Learn to Excel",
  affiliationText: "CBSE Affiliation No: 2132163",
  topPhone: "+91 99271 70258",
  topEmail: "psacademysemra@gmail.com",

  heroSlides: [
    {
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop",
      title: "Welcome to P.S. Academy",
      subtitle: "Semra Khandoli, Agra mein ek pratishthit shikshan sanstha.",
      badge: "Admissions Open 2025–26",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop",
      title: "Aadhunik Shiksha ka Kendra",
      subtitle: "Vigyan labs, computer labs, library aur khel maidan.",
      badge: "CBSE Affiliated School",
    },
    {
      image:
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1920&auto=format&fit=crop",
      title: "Sarvangin Vikas ki Ore",
      subtitle: "Khel, kala aur naitik shiksha ke saath har bachche ka vikas.",
      badge: "Est. 2005",
    },
  ],

  statsStudents: 1250,
  statsFaculty: 85,
  statsPassRate: 96,
  statsYears: 20,

  aboutTitle: "Hamara Vishwas",
  aboutDesc:
    "P.S. Academy Semra Khandoli, Agra mein hum maante hain ki shiksha sirf kitaabi gyan nahi...",
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

  principalName: "Mrs. Savita Sharma",
  principalQuote:
    "Shiksha ka uddeshya sirf marks nahi hai — yeh har bachche mein jigyasa, anushasan aur manavta ki lau jalane ka madhyam hai.",
  principalRole: "Principal",
  principalPhoto:
    "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?q=80&w=800&auto=format&fit=crop",
  managerName: "Shri Gopal Sharma",
  managerQuote:
    "P.S. Academy Semra Khandoli, Agra ka prabandhan samiti hamesha se ek aisi shikshan sanstha pradan karne ke liye pratibaddh raha hai.",
  managerRole: "Chairman, Board of Management",
  managerPhoto:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",

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

  classes: [
    {
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
      tag: "Primary",
      title: "Classes I – V",
      desc: "Buniyadi shiksha, khel-khel mein gyan.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
      tag: "Middle",
      title: "Classes VI – VIII",
      desc: "Science, Maths, Social Studies mein gahrai.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
      tag: "Senior",
      title: "Classes IX – XII",
      desc: "Board exam ki taiyari aur career nirman.",
    },
  ],

  announcements: [
    "🎓 Admissions Open for Session 2025-26 — Class I to XI Apply Now!",
    "🏆 P.S. Academy achieved 96% pass rate in CBSE Board Exams 2025",
    "📢 Parent-Teacher Meeting on 22 June — All Parents are requested to attend",
    "🎭 Annual Day Celebration will be held in December",
    "📚 New Library inaugurated — Over 1000 books now available",
  ],

  notices: [
    {
      day: "01",
      mon: "Apr",
      title: "Naye Shiksha Sesh 2025–26 ke liye Admission Khule",
      desc: "Class 1 se 11 tak admission khule hain.",
      tag: "event",
    },
    {
      day: "15",
      mon: "Aug",
      title: "Swatantrata Diwas Samaroh – 15 August",
      desc: "Sabhi vidyarthi aur staff 7:00 AM par upasthit rahein.",
      tag: "event",
    },
    {
      day: "10",
      mon: "Jun",
      title: "Parent-Teacher Meeting – Class 6 se 10",
      desc: "PTM 22 June (Shanivar) 9 AM – 1 PM ke beech.",
      tag: "meeting",
    },
    {
      day: "05",
      mon: "Jun",
      title: "Garmi ki Chhuttiyan",
      desc: "Vidyalay 20 June se 30 June tak band rahega.",
      tag: "holiday",
    },
  ],

  contactAddress: "P.S. Academy, Semra Khandoli, Agra, Uttar Pradesh",
  contactPhone: "+91 99271 70258",
  contactEmail: "psacademysemra@gmail.com",
  contactHours: "Mon – Sat: 8:00 AM – 3:00 PM",

  socialLinks: { facebook: "#", instagram: "#", youtube: "#" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --ink: #0f1117; --ink2: #3d4151; --ink3: #6b7280; --line: #e5e7eb;
    --surface: #f8f9fb; --white: #ffffff; --blue: #2563eb; --blue-l: #eff4ff;
    --blue-d: #1d4ed8; --green: #16a34a; --green-l: #f0fdf4; --red: #dc2626;
    --red-l: #fef2f2; --amber: #d97706; --amber-l: #fffbeb; --purple: #7c3aed;
    --purple-l: #f5f3ff; --radius: 10px;
    --shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
    --shadow-md: 0 4px 12px rgba(0,0,0,.1);
  }
  .wad-wrap { display: flex; min-height: 100vh; background: var(--surface); font-family: 'Inter', system-ui, sans-serif; color: var(--ink); }
  .wad-sidebar { width: 230px; flex-shrink: 0; background: var(--white); border-right: 1px solid var(--line); position: sticky; top: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
  .wad-logo { padding: 20px 18px 16px; border-bottom: 1px solid var(--line); }
  .wad-logo-top { display: flex; align-items: center; gap: 10px; }
  .wad-logo-icon { width: 34px; height: 34px; background: var(--blue); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
  .wad-logo-name { font-size: 13px; font-weight: 700; color: var(--ink); }
  .wad-logo-sub { font-size: 10.5px; color: var(--ink3); margin-top: 1px; }
  .wad-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
  .wad-nav-section { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); padding: 10px 8px 4px; }
  .wad-nav-btn { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--ink2); text-align: left; width: 100%; transition: all .15s; }
  .wad-nav-btn:hover { background: var(--surface); color: var(--ink); }
  .wad-nav-btn.active { background: var(--blue-l); color: var(--blue); font-weight: 600; }
  .wad-nav-btn .nb-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: var(--surface); flex-shrink: 0; transition: all .15s; }
  .wad-nav-btn.active .nb-icon { background: var(--blue); color: #fff; }
  .wad-nav-footer { padding: 12px 10px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; }
  .wad-nav-footer-btn { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; text-align: left; width: 100%; transition: all .15s; text-decoration: none; }
  .wad-nav-footer-btn.view { color: var(--blue); } .wad-nav-footer-btn.view:hover { background: var(--blue-l); }
  .wad-nav-footer-btn.logout { color: var(--red); } .wad-nav-footer-btn.logout:hover { background: var(--red-l); }
  .wad-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .wad-topbar { background: var(--white); border-bottom: 1px solid var(--line); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 20; }
  .wad-topbar-left { display: flex; align-items: center; gap: 10px; }
  .wad-topbar-title { font-size: 15px; font-weight: 700; color: var(--ink); }
  .wad-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink3); }
  .wad-save-btn { display: flex; align-items: center; gap: 6px; padding: 8px 18px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
  .wad-save-btn:hover { background: var(--blue-d); }
  .wad-content { flex: 1; padding: 24px 28px; overflow-y: auto; }
  .wad-toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: var(--ink); color: #fff; border-radius: var(--radius); font-size: 13px; font-weight: 500; box-shadow: var(--shadow-md); animation: wToastIn .25s ease; }
  @keyframes wToastIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  .wad-toast.success { background: var(--green); } .wad-toast.error { background: var(--red); }
  .wad-card { background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 20px; overflow: hidden; }
  .wad-card-header { padding: 14px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; background: #fafafa; }
  .wad-card-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--ink); }
  .wad-card-title .ct-icon { width: 26px; height: 26px; border-radius: 6px; background: var(--blue-l); color: var(--blue); display: flex; align-items: center; justify-content: center; }
  .wad-card-body { padding: 20px; }
  .wad-field { margin-bottom: 16px; }
  .wad-label { display: block; font-size: 11.5px; font-weight: 600; color: var(--ink2); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .05em; }
  .wad-input, .wad-textarea, .wad-select { width: 100%; padding: 9px 12px; border: 1px solid var(--line); border-radius: 8px; font-family: inherit; font-size: 13px; color: var(--ink); background: var(--white); outline: none; transition: border-color .15s, box-shadow .15s; }
  .wad-input:focus, .wad-textarea:focus, .wad-select:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
  .wad-textarea { resize: vertical; }
  .wad-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .wad-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .wad-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  @media (max-width: 900px) { .wad-grid-4 { grid-template-columns: 1fr 1fr; } .wad-grid-3 { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .wad-grid-2, .wad-grid-3, .wad-grid-4 { grid-template-columns: 1fr; } .wad-sidebar { display: none; } }
  .wad-img-picker { border: 2px dashed var(--line); border-radius: var(--radius); overflow: hidden; background: var(--surface); }
  .wad-img-preview { width: 100%; height: 180px; object-fit: cover; display: block; }
  .wad-img-preview.tall { height: 220px; }
  .wad-img-controls { padding: 12px 14px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; border-top: 1px solid var(--line); background: var(--white); }
  .wad-img-url-row { padding: 12px 14px; border-top: 1px solid var(--line); display: flex; gap: 8px; }
  .wad-img-url-row .wad-input { flex: 1; }
  .wad-img-empty { height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--ink3); font-size: 13px; }
  .wad-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 7px; border: 1px solid var(--line); background: var(--white); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; color: var(--ink2); }
  .wad-btn:hover { background: var(--surface); border-color: #d1d5db; }
  .wad-btn.primary { background: var(--blue); color: #fff; border-color: var(--blue); }
  .wad-btn.primary:hover { background: var(--blue-d); }
  .wad-btn.danger { background: var(--red-l); color: var(--red); border-color: #fecaca; }
  .wad-btn.danger:hover { background: #fee2e2; }
  .wad-btn.success { background: var(--green-l); color: var(--green); border-color: #bbf7d0; }
  .wad-btn.sm { padding: 5px 9px; font-size: 11px; }
  .wad-btn.icon-only { padding: 6px; }
  .wad-list { display: flex; flex-direction: column; gap: 10px; }
  .wad-list-item { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; position: relative; }
  .wad-list-item-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .wad-list-item-title { font-size: 13px; font-weight: 600; color: var(--ink); flex: 1; min-width: 0; }
  .wad-list-actions { display: flex; gap: 5px; flex-shrink: 0; }
  .wad-add-row { padding: 12px; border: 2px dashed var(--line); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--white); cursor: pointer; font-size: 13px; font-weight: 600; color: var(--blue); transition: all .15s; border-style: dashed; }
  .wad-add-row:hover { background: var(--blue-l); border-color: var(--blue); }
  .wad-gal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .wad-gal-item { border-radius: 8px; overflow: hidden; position: relative; border: 1px solid var(--line); aspect-ratio: 4/3; background: var(--surface); }
  .wad-gal-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wad-gal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: none; align-items: center; justify-content: center; gap: 6px; }
  .wad-gal-item:hover .wad-gal-overlay { display: flex; }
  .wad-gal-add { border: 2px dashed var(--line); border-radius: 8px; aspect-ratio: 4/3; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; color: var(--blue); font-size: 12px; font-weight: 600; background: var(--white); transition: all .15s; }
  .wad-gal-add:hover { background: var(--blue-l); border-color: var(--blue); }
  .wad-slide-strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
  .wad-slide-thumb { position: relative; flex-shrink: 0; width: 200px; border-radius: 8px; overflow: hidden; border: 1px solid var(--line); aspect-ratio: 16/9; background: var(--surface); cursor: pointer; }
  .wad-slide-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .wad-slide-thumb .st-caption { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,.65); color: #fff; font-size: 10px; padding: 5px 8px; }
  .wad-slide-thumb .st-del { position: absolute; top: 5px; right: 5px; background: var(--red); color: #fff; border: none; border-radius: 5px; width: 22px; height: 22px; display: none; align-items: center; justify-content: center; cursor: pointer; }
  .wad-slide-thumb:hover .st-del { display: flex; }
  .wad-slide-add { flex-shrink: 0; width: 200px; aspect-ratio: 16/9; border: 2px dashed var(--line); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; cursor: pointer; color: var(--blue); font-size: 12px; font-weight: 600; background: var(--white); transition: all .15s; }
  .wad-slide-add:hover { background: var(--blue-l); border-color: var(--blue); }
  .wad-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .wad-modal { background: var(--white); border-radius: 14px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-md); }
  .wad-modal-header { padding: 18px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
  .wad-modal-title { font-size: 15px; font-weight: 700; }
  .wad-modal-body { padding: 20px; }
  .wad-modal-footer { padding: 14px 20px; border-top: 1px solid var(--line); display: flex; justify-content: flex-end; gap: 8px; }
  .ntag { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 700; }
  .ntag.exam { background: #fbe3dc; color: #8f3f23; }
  .ntag.event { background: #e3e9fb; color: #2d3f8f; }
  .ntag.holiday { background: #e2ecd9; color: #3f5a2a; }
  .ntag.meeting { background: #fffbeb; color: #8a5a06; }
  .wad-why-item { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .wad-why-icon-picker { font-size: 24px; cursor: pointer; padding: 6px; border-radius: 8px; border: 1px solid var(--line); background: var(--white); width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wad-why-fields { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .wad-stat-card { background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; text-align: center; }
  .wad-stat-card .sc-label { font-size: 11px; color: var(--ink3); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
  .wad-stat-card input { text-align: center; font-size: 22px; font-weight: 700; color: var(--blue); }
  .wad-unsaved-dot { width: 7px; height: 7px; background: var(--amber); border-radius: 50%; display: inline-block; margin-left: 6px; }
  .wad-overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .wad-ov-card { background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px 16px; display: flex; align-items: center; gap: 13px; cursor: pointer; transition: all .15s; }
  .wad-ov-card:hover { border-color: var(--blue); box-shadow: var(--shadow-md); }
  .wad-ov-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wad-ov-label { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
  .wad-ov-sub { font-size: 11px; color: var(--ink3); }
  .wad-reset-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--white); font-family: inherit; font-size: 12px; font-weight: 600; color: var(--ink3); cursor: pointer; transition: all .15s; }
  .wad-reset-btn:hover { background: var(--red-l); color: var(--red); border-color: #fecaca; }
  .announce-item { padding: 10px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .announce-item .ai-text { flex: 1; font-size: 13px; }
  .gal-collection-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .gal-col-item { border-radius: 8px; overflow: hidden; border: 1px solid var(--line); position: relative; aspect-ratio: 4/3; background: var(--surface); }
  .gal-col-item img { width: 100%; height: 100%; object-fit: cover; }
  .gal-col-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.6); display: none; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px; }
  .gal-col-item:hover .gal-col-overlay { display: flex; }
  .gal-col-overlay .gco-event { color: var(--gold); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
  .gal-col-overlay .gco-date { color: #fff; font-size: 10px; }
  .tag-pill { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .tag-annual { background: #fce8e6; color: #d93025; }
  .tag-sports { background: #e8f0fe; color: #1a73e8; }
  .tag-science { background: #e6f4ea; color: #1e8e3e; }
  .tag-cultural { background: #f3e8fd; color: #9334e6; }
  .tag-republic { background: #fef7e0; color: #e37400; }
  .tag-other { background: var(--surface); color: var(--ink3); }
  @media (max-width: 768px) { .gal-collection-grid { grid-template-columns: repeat(2, 1fr); } }
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE PICKER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ImagePicker({ value, onChange, label, tall = false }) {
  const [mode, setMode] = useState("url");
  const [urlInput, setUrlInput] = useState(value || "");
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUrlInput(value || "");
    setImgError(false);
  }, [value]);

  const GALLERY_IMAGES = [
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
      label: "School Building 1",
    },
    {
      src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
      label: "School Building 2",
    },
    {
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
      label: "Classroom",
    },
    {
      src: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=800&auto=format&fit=crop",
      label: "Science Lab",
    },
    {
      src: "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?q=80&w=800&auto=format&fit=crop",
      label: "Main Building",
    },
    {
      src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
      label: "Sports Ground",
    },
    {
      src: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?q=80&w=800&auto=format&fit=crop",
      label: "Library",
    },
    {
      src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=800&auto=format&fit=crop",
      label: "Students",
    },
    {
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
      label: "Study",
    },
    {
      src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop",
      label: "Teachers",
    },
    {
      src: "https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=800&auto=format&fit=crop",
      label: "Event 1",
    },
    {
      src: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop",
      label: "Event 2",
    },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size 5MB se zyada hai.");
      return;
    }
    setUploading(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      onChange(secureUrl);
      setUrlInput(secureUrl);
      setImgError(false);
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + error.message);
      setImgError(true);
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setImgError(false);
    }
  };

  return (
    <div>
      {label && <label className="wad-label">{label}</label>}
      <div className="wad-img-picker">
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
          {["url", "gallery", "upload"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                background: mode === m ? "var(--blue-l)" : "var(--white)",
                color: mode === m ? "var(--blue)" : "var(--ink3)",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                borderBottom:
                  mode === m
                    ? "2px solid var(--blue)"
                    : "2px solid transparent",
                textTransform: "capitalize",
              }}
            >
              {m === "url"
                ? "🔗 URL"
                : m === "gallery"
                  ? "🖼️ Gallery"
                  : "📁 Upload"}
            </button>
          ))}
        </div>
        {value && !imgError ? (
          <img
            src={value}
            alt="preview"
            className={`wad-img-preview${tall ? " tall" : ""}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="wad-img-empty">
            <Icon d={ICONS.image} size={32} />
            <span>{imgError ? "Image load nahi hui" : "Koi image nahi"}</span>
          </div>
        )}
        {mode === "url" && (
          <div className="wad-img-url-row">
            <input
              className="wad-input"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            />
            <button className="wad-btn primary" onClick={applyUrl}>
              Apply
            </button>
            {value && (
              <button
                className="wad-btn danger sm icon-only"
                onClick={() => {
                  onChange("");
                  setUrlInput("");
                  setImgError(false);
                }}
              >
                <Icon d={ICONS.x} size={13} />
              </button>
            )}
          </div>
        )}
        {mode === "gallery" && (
          <div style={{ padding: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 7,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {GALLERY_IMAGES.map((g, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onChange(g.src);
                    setUrlInput(g.src);
                    setImgError(false);
                  }}
                  style={{
                    borderRadius: 7,
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      value === g.src
                        ? "2px solid var(--blue)"
                        : "2px solid transparent",
                    aspectRatio: "4/3",
                    position: "relative",
                  }}
                >
                  <img
                    src={g.src}
                    alt={g.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {value === g.src && (
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        right: 3,
                        background: "var(--blue)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(0,0,0,.6)",
                      color: "#fff",
                      fontSize: 9,
                      padding: "3px 5px",
                    }}
                  >
                    {g.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {mode === "upload" && (
          <div style={{ padding: 16, textAlign: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--line)",
                borderRadius: 12,
                padding: "40px 20px",
                cursor: "pointer",
                background: "var(--surface)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--blue)";
                e.currentTarget.style.background = "var(--blue-l)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              <Icon d={ICONS.upload} size={40} />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--ink2)",
                }}
              >
                {uploading ? "Upload ho raha..." : "Click karo ya drag karo"}
              </p>
              <p style={{ marginTop: 4, fontSize: 11, color: "var(--ink3)" }}>
                JPG, PNG, WebP — Max 5MB
              </p>
            </div>
            {uploading && (
              <div
                style={{
                  marginTop: 12,
                  color: "var(--blue)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⏳ Loading...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTICE MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function NoticeModal({ notice, onSave, onClose }) {
  const [form, setForm] = useState(
    notice || { day: "", mon: "Jan", title: "", desc: "", tag: "event" },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return (
    <div
      className="wad-modal-bg"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="wad-modal">
        <div className="wad-modal-header">
          <div className="wad-modal-title">
            📋 {notice ? "Edit Notice" : "Naya Notice"}
          </div>
          <button className="wad-btn sm icon-only" onClick={onClose}>
            <Icon d={ICONS.x} size={14} />
          </button>
        </div>
        <div className="wad-modal-body">
          <div className="wad-grid-2" style={{ marginBottom: 14 }}>
            <div className="wad-field">
              <label className="wad-label">Day</label>
              <input
                className="wad-input"
                type="number"
                min="1"
                max="31"
                value={form.day}
                onChange={(e) => set("day", e.target.value)}
              />
            </div>
            <div className="wad-field">
              <label className="wad-label">Month</label>
              <select
                className="wad-select"
                value={form.mon}
                onChange={(e) => set("mon", e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="wad-field">
            <label className="wad-label">Heading</label>
            <input
              className="wad-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="wad-field">
            <label className="wad-label">Description</label>
            <textarea
              className="wad-textarea"
              rows={3}
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
            />
          </div>
          <div className="wad-field">
            <label className="wad-label">Tag</label>
            <select
              className="wad-select"
              value={form.tag}
              onChange={(e) => set("tag", e.target.value)}
            >
              <option value="exam">📝 Exam</option>
              <option value="event">🎉 Event</option>
              <option value="meeting">👨‍👩‍👧 Meeting</option>
              <option value="holiday">🌿 Holiday</option>
            </select>
          </div>
        </div>
        <div className="wad-modal-footer">
          <button className="wad-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wad-btn primary"
            onClick={() => {
              if (form.title && form.day) onSave(form);
            }}
          >
            <Icon d={ICONS.save} size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERO SLIDE MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HeroSlideModal({ slide, onSave, onClose }) {
  const [form, setForm] = useState(
    slide || { image: "", title: "", subtitle: "", badge: "" },
  );
  return (
    <div
      className="wad-modal-bg"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="wad-modal">
        <div className="wad-modal-header">
          <div className="wad-modal-title">
            🖼️ {slide ? "Edit Slide" : "Naya Slide"}
          </div>
          <button className="wad-btn sm icon-only" onClick={onClose}>
            <Icon d={ICONS.x} size={14} />
          </button>
        </div>
        <div className="wad-modal-body">
          <div className="wad-field">
            <label className="wad-label">Title (Heading)</label>
            <input
              className="wad-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Welcome to P.S. Academy"
            />
          </div>
          <div className="wad-field">
            <label className="wad-label">Subtitle</label>
            <textarea
              className="wad-textarea"
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Description text..."
            />
          </div>
          <div className="wad-field">
            <label className="wad-label">Badge Text</label>
            <input
              className="wad-input"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="Admissions Open 2025–26"
            />
          </div>
          <ImagePicker
            label="Slide Image (1920×1080 recommended)"
            value={form.image}
            onChange={(v) => setForm({ ...form, image: v })}
          />
        </div>
        <div className="wad-modal-footer">
          <button className="wad-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wad-btn primary"
            onClick={() => {
              if (form.image && form.title) onSave(form);
            }}
          >
            <Icon d={ICONS.save} size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GALLERY COLLECTION MODAL (for separate gallery collection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GalleryCollectionModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(
    item || {
      image: "",
      eventName: "Annual Day",
      eventDate: "",
      description: "",
    },
  );
  const PRESET_EVENTS = [
    "Annual Day",
    "Sports Day",
    "Science Fair",
    "Cultural",
    "Republic Day",
    "Independence Day",
    "Workshop",
    "Field Trip",
    "Other",
  ];
  return (
    <div
      className="wad-modal-bg"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="wad-modal">
        <div className="wad-modal-header">
          <div className="wad-modal-title">
            📸 {item ? "Edit Photo" : "Naya Photo"}
          </div>
          <button className="wad-btn sm icon-only" onClick={onClose}>
            <Icon d={ICONS.x} size={14} />
          </button>
        </div>
        <div className="wad-modal-body">
          <ImagePicker
            label="Photo"
            value={form.image}
            onChange={(v) => setForm({ ...form, image: v })}
            tall
          />
          <div style={{ marginTop: 16 }} className="wad-field">
            <label className="wad-label">Event Name</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                className="wad-select"
                style={{ flex: 1 }}
                value={
                  PRESET_EVENTS.includes(form.eventName)
                    ? form.eventName
                    : "Other"
                }
                onChange={(e) =>
                  setForm({ ...form, eventName: e.target.value })
                }
              >
                {PRESET_EVENTS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
            </div>
            {!PRESET_EVENTS.includes(form.eventName) && (
              <input
                className="wad-input"
                style={{ marginTop: 8 }}
                placeholder="Custom event name..."
                value={form.eventName}
                onChange={(e) =>
                  setForm({ ...form, eventName: e.target.value })
                }
              />
            )}
          </div>
          <div className="wad-field">
            <label className="wad-label">Event Date</label>
            <input
              className="wad-input"
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </div>
          <div className="wad-field">
            <label className="wad-label">Description (optional)</label>
            <textarea
              className="wad-textarea"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Photo ke baare mein..."
            />
          </div>
        </div>
        <div className="wad-modal-footer">
          <button className="wad-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="wad-btn primary"
            onClick={() => {
              if (form.image && form.eventName) onSave(form);
            }}
          >
            <Icon d={ICONS.save} size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const WebAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [galleryCollection, setGalleryCollection] = useState([]);
  const [toast, setToast] = useState(null);
  const [unsaved, setUnsaved] = useState(false);
  const [modal, setModal] = useState(null);
  const [galFilter, setGalFilter] = useState("All");

  // ── Load data ──
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "landingPage"));
        if (snap.exists()) setContent({ ...DEFAULT_CONTENT, ...snap.data() });
        else setContent(DEFAULT_CONTENT);
      } catch (e) {
        console.error("Load error:", e);
      }
    };
    load();
    loadGalleryCollection();
  }, []);

  const loadGalleryCollection = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      setGalleryCollection(items);
    } catch (e) {
      console.error("Gallery load error:", e);
    }
  };

  // ── Setters ──
  const set = (key, val) => {
    setContent((c) => ({ ...c, [key]: val }));
    setUnsaved(true);
  };
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Save to settings ──
  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "landingPage"), content);
      setUnsaved(false);
      showToast("✓ Saari changes save ho gayi!");
      window.dispatchEvent(new CustomEvent("school-erp-content-updated"));
    } catch (err) {
      showToast("⚠️ Save failed.", "error");
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Default pe reset? Saari changes chali jayengi.")) {
      try {
        await setDoc(doc(db, "settings", "landingPage"), DEFAULT_CONTENT);
        setContent(DEFAULT_CONTENT);
        setUnsaved(false);
        showToast("Reset complete!");
      } catch (err) {
        showToast("Reset failed.", "error");
      }
    }
  };

  // ── Hero Slides CRUD ──
  const addSlide = (s) => {
    set("heroSlides", [...(content.heroSlides || []), s]);
    setModal(null);
  };
  const updateSlide = (idx, s) => {
    const a = [...content.heroSlides];
    a[idx] = s;
    set("heroSlides", a);
    setModal(null);
  };
  const deleteSlide = (idx) => {
    if (window.confirm("Delete?"))
      set(
        "heroSlides",
        content.heroSlides.filter((_, i) => i !== idx),
      );
  };

  // ── Notices CRUD ──
  const addNotice = (n) => {
    set("notices", [n, ...(content.notices || [])]);
    setModal(null);
  };
  const updateNotice = (idx, n) => {
    const a = [...content.notices];
    a[idx] = n;
    set("notices", a);
    setModal(null);
  };
  const deleteNotice = (idx) => {
    if (window.confirm("Delete?"))
      set(
        "notices",
        content.notices.filter((_, i) => i !== idx),
      );
  };

  // ── Why Cards CRUD ──
  const updateWhyCard = (idx, field, val) => {
    const a = [...content.whyCards];
    a[idx] = { ...a[idx], [field]: val };
    set("whyCards", a);
  };
  const addWhyCard = () =>
    set("whyCards", [
      ...(content.whyCards || []),
      { icon: "⭐", title: "Naya Feature", desc: "Description yahan likhein." },
    ]);

  // ── Announcements CRUD ──
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const addAnnouncement = () => {
    if (newAnnouncement.trim()) {
      set("announcements", [
        ...(content.announcements || []),
        newAnnouncement.trim(),
      ]);
      setNewAnnouncement("");
    }
  };
  const deleteAnnouncement = (idx) => {
    if (window.confirm("Delete?"))
      set(
        "announcements",
        content.announcements.filter((_, i) => i !== idx),
      );
  };

  // ── Classes CRUD ──
  const updateClass = (idx, field, val) => {
    const a = [...content.classes];
    a[idx] = { ...a[idx], [field]: val };
    set("classes", a);
  };

  // ── About features CRUD ──
  const [newFeature, setNewFeature] = useState("");
  const addFeature = () => {
    if (newFeature.trim()) {
      set("aboutFeatures", [
        ...(content.aboutFeatures || []),
        newFeature.trim(),
      ]);
      setNewFeature("");
    }
  };
  const deleteFeature = (idx) => {
    if (window.confirm("Delete?"))
      set(
        "aboutFeatures",
        content.aboutFeatures.filter((_, i) => i !== idx),
      );
  };

  // ── Gallery Collection CRUD (separate Firestore collection) ──
  const addGalleryPhoto = async (item) => {
    try {
      await addDoc(collection(db, "gallery"), {
        ...item,
        createdAt: new Date().toISOString(),
      });
      setModal(null);
      showToast("✓ Photo add ho gayi!");
      loadGalleryCollection();
    } catch (err) {
      showToast("⚠️ Failed: " + err.message, "error");
    }
  };
  const deleteGalleryPhoto = async (id) => {
    if (window.confirm("Delete this photo?")) {
      try {
        await deleteDoc(doc(db, "gallery", id));
        showToast("✓ Photo delete ho gayi!");
        loadGalleryCollection();
      } catch (err) {
        showToast("⚠️ Failed: " + err.message, "error");
      }
    }
  };

  // ── Filter gallery collection ──
  const galEventNames = [
    ...new Set(galleryCollection.map((p) => p.eventName).filter(Boolean)),
  ];
  const galFiltered =
    galFilter === "All"
      ? galleryCollection
      : galleryCollection.filter((p) => p.eventName === galFilter);

  // ── Nav items ──
  const NAV = [
    { id: "overview", label: "Overview", icon: ICONS.layout, color: "#3b82f6" },
    { id: "hero", label: "Hero Slider", icon: ICONS.move, color: "#8b5cf6" },
    {
      id: "announcements",
      label: "Announcements",
      icon: ICONS.speaker,
      color: "#f59e0b",
    },
    { id: "stats", label: "Stats", icon: ICONS.stats, color: "#10b981" },
    { id: "about", label: "About Section", icon: ICONS.info, color: "#6366f1" },
    {
      id: "leadership",
      label: "Leadership",
      icon: ICONS.users,
      color: "#ec4899",
    },
    { id: "why", label: "Why Choose Us", icon: ICONS.check, color: "#14b8a6" },
    { id: "classes", label: "Our Classes", icon: ICONS.book, color: "#f97316" },
    {
      id: "notices",
      label: "Notice Board",
      icon: ICONS.bell,
      color: "#ef4444",
    },
    {
      id: "gallery",
      label: "📸 Gallery Photos",
      icon: ICONS.grid,
      color: "#d93025",
    },
    {
      id: "contact",
      label: "Contact / Footer",
      icon: ICONS.phone,
      color: "#2563eb",
    },
  ];

  const SECTION_LABELS = {
    overview: "Overview",
    hero: "Hero Slider",
    announcements: "Announcements",
    stats: "Stats",
    about: "About Section",
    leadership: "Leadership",
    why: "Why Choose Us",
    classes: "Our Classes",
    notices: "Notice Board",
    gallery: "📸 Gallery Photos",
    contact: "Contact / Footer",
  };

  // ── Theme colors for Live Preview ──
  const themePrimary = content.primaryColor || "#0f1b3d";
  const themeAccent = content.accentColor || "#c9a84c";

  return (
    <>
      <style>{STYLES}</style>
      <div className="wad-wrap">
        {/* ── Sidebar ── */}
        <aside className="wad-sidebar">
          <div className="wad-logo">
            <div className="wad-logo-top">
              <div className="wad-logo-icon">
                <Icon d={ICONS.globe} size={16} />
              </div>
              <div>
                <div className="wad-logo-name">Web Admin</div>
                <div className="wad-logo-sub">Full Control Panel</div>
              </div>
            </div>
          </div>
          <nav className="wad-nav">
            <div className="wad-nav-section">Manage Sections</div>
            {NAV.map((n) => (
              <button
                key={n.id}
                className={`wad-nav-btn${section === n.id ? " active" : ""}`}
                onClick={() => setSection(n.id)}
              >
                <div
                  className="nb-icon"
                  style={section === n.id ? {} : { color: n.color }}
                >
                  <Icon d={n.icon} size={14} />
                </div>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="wad-nav-footer">
            <button
              className="wad-nav-footer-btn view"
              onClick={() => navigate("/")}
            >
              <Icon d={ICONS.eye} size={14} /> Live Site dekho
            </button>
            <button className="wad-nav-footer-btn logout" onClick={logout}>
              <Icon d={ICONS.logout} size={14} /> Logout
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="wad-main">
          <div className="wad-topbar">
            <div className="wad-topbar-left">
              <div>
                <div className="wad-topbar-title">
                  {SECTION_LABELS[section]}
                </div>
                <div className="wad-breadcrumb">
                  <span>P.S. Academy</span>{" "}
                  <span style={{ color: "var(--line)" }}>›</span>
                  <span style={{ color: "var(--blue)" }}>
                    {SECTION_LABELS[section]}
                  </span>
                  {unsaved && (
                    <span style={{ color: "var(--amber)", fontWeight: 600 }}>
                      {" "}
                      • Unsaved
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="wad-reset-btn" onClick={handleReset}>
                ↺ Reset
              </button>
              <button className="wad-save-btn" onClick={handleSave}>
                <Icon d={ICONS.save} size={14} /> Save karo
              </button>
            </div>
          </div>

          <div className="wad-content">
            {/* ═══ OVERVIEW ═══ */}
            {section === "overview" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h2
                    style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}
                  >
                    Landing Page — Full Control 👋
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ink3)",
                      lineHeight: 1.6,
                    }}
                  >
                    PS Academy ke landing page ka har section yahan edit kar
                    sakte ho. Changes real-time site pe dikhte hain.
                  </p>
                </div>
                <div className="wad-overview-grid">
                  {NAV.filter((n) => n.id !== "overview").map((n) => (
                    <div
                      key={n.id}
                      className="wad-ov-card"
                      onClick={() => setSection(n.id)}
                    >
                      <div
                        className="wad-ov-icon"
                        style={{ background: n.color + "20", color: n.color }}
                      >
                        <Icon d={n.icon} size={18} />
                      </div>
                      <div>
                        <div className="wad-ov-label">{n.label}</div>
                        <div className="wad-ov-sub" style={{ color: n.color }}>
                          Edit →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="wad-card">
                  <div className="wad-card-header">
                    <div className="wad-card-title">
                      <div className="ct-icon">
                        <Icon d={ICONS.check} size={13} />
                      </div>
                      Content Summary
                    </div>
                  </div>
                  <div className="wad-card-body">
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        fontSize: 12,
                        color: "var(--ink2)",
                      }}
                    >
                      <span>
                        🖼️ <b>{(content.heroSlides || []).length}</b> hero
                        slides
                      </span>
                      <span>
                        📷 <b>{galleryCollection.length}</b> gallery photos
                      </span>
                      <span>
                        📋 <b>{(content.notices || []).length}</b> notices
                      </span>
                      <span>
                        🏆 Pass Rate: <b>{content.statsPassRate}%</b>
                      </span>
                      <span>
                        👨‍🎓 Students: <b>{content.statsStudents}+</b>
                      </span>
                      <span>
                        📢 <b>{(content.announcements || []).length}</b>{" "}
                        announcements
                      </span>
                      <span>
                        🏫 <b>{(content.classes || []).length}</b> class
                        sections
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ HERO SLIDER ═══ */}
            {section === "hero" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.move} size={13} />
                    </div>
                    Hero Slider Slides
                  </div>
                  <button
                    className="wad-btn primary sm"
                    onClick={() => setModal({ type: "slide" })}
                  >
                    <Icon d={ICONS.plus} size={12} /> Naya Slide
                  </button>
                </div>
                <div className="wad-card-body">
                  <div className="wad-slide-strip">
                    {(content.heroSlides || []).map((slide, idx) => (
                      <div key={idx} className="wad-slide-thumb">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          onError={(e) =>
                            (e.target.src =
                              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop")
                          }
                        />
                        <div className="st-caption">
                          {slide.title || `Slide ${idx + 1}`}
                        </div>
                        <button
                          className="st-del"
                          onClick={() => deleteSlide(idx)}
                        >
                          <Icon d={ICONS.x} size={11} />
                        </button>
                        <div
                          style={{
                            position: "absolute",
                            top: 5,
                            left: 5,
                            background: "rgba(0,0,0,.55)",
                            color: "#fff",
                            borderRadius: 5,
                            padding: "2px 6px",
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setModal({ type: "slide", data: slide, index: idx })
                          }
                        >
                          ✏️
                        </div>
                      </div>
                    ))}
                    <div
                      className="wad-slide-add"
                      onClick={() => setModal({ type: "slide" })}
                    >
                      <Icon d={ICONS.plus} size={20} />
                      <span>Naya Slide</span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "var(--ink3)",
                    }}
                  >
                    💡 Hero slider auto-play karta hai 5 seconds mein. Har slide
                    mein image, title, subtitle aur badge hota hai.
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ANNOUNCEMENTS ═══ */}
            {section === "announcements" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.speaker} size={13} />
                    </div>
                    Announcement Ticker
                  </div>
                </div>
                <div className="wad-card-body">
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--ink3)",
                      marginBottom: 12,
                    }}
                  >
                    Ye announcements home page pe scrolling ticker mein dikhte
                    hain.
                  </p>
                  {(content.announcements || []).map((a, idx) => (
                    <div key={idx} className="announce-item">
                      <span className="ai-text">{a}</span>
                      <button
                        className="wad-btn danger sm icon-only"
                        onClick={() => deleteAnnouncement(idx)}
                      >
                        <Icon d={ICONS.trash} size={12} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      className="wad-input"
                      placeholder="Naya announcement likhein..."
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAnnouncement()}
                    />
                    <button
                      className="wad-btn primary"
                      onClick={addAnnouncement}
                    >
                      <Icon d={ICONS.plus} size={13} /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STATS ═══ */}
            {section === "stats" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.stats} size={13} />
                    </div>
                    Stats Counters
                  </div>
                </div>
                <div className="wad-card-body">
                  <div className="wad-grid-4">
                    {[
                      { key: "statsStudents", label: "Students", suffix: "+" },
                      { key: "statsFaculty", label: "Faculty", suffix: "+" },
                      { key: "statsPassRate", label: "Pass Rate", suffix: "%" },
                      { key: "statsYears", label: "Years Legacy", suffix: "+" },
                    ].map((s) => (
                      <div key={s.key} className="wad-stat-card">
                        <div className="sc-label">{s.label}</div>
                        <input
                          className="wad-input"
                          type="number"
                          value={content[s.key]}
                          onChange={(e) =>
                            set(s.key, parseInt(e.target.value) || 0)
                          }
                          style={{
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "var(--blue)",
                          }}
                        />
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--ink3)",
                            marginTop: 4,
                          }}
                        >
                          Displays:{" "}
                          <b>
                            {content[s.key]}
                            {s.suffix}
                          </b>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ABOUT ═══ */}
            {section === "about" && (
              <div>
                <div className="wad-card">
                  <div className="wad-card-header">
                    <div className="wad-card-title">
                      <div className="ct-icon">
                        <Icon d={ICONS.info} size={13} />
                      </div>
                      About Section
                    </div>
                  </div>
                  <div className="wad-card-body">
                    <div className="wad-field">
                      <label className="wad-label">Title</label>
                      <input
                        className="wad-input"
                        value={content.aboutTitle}
                        onChange={(e) => set("aboutTitle", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Description</label>
                      <textarea
                        className="wad-textarea"
                        rows={4}
                        value={content.aboutDesc}
                        onChange={(e) => set("aboutDesc", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Mission Statement</label>
                      <input
                        className="wad-input"
                        value={content.aboutMission}
                        onChange={(e) => set("aboutMission", e.target.value)}
                      />
                    </div>
                    <ImagePicker
                      label="About Image"
                      value={content.aboutImage}
                      onChange={(v) => set("aboutImage", v)}
                      tall
                    />
                    <div className="wad-field">
                      <label className="wad-label">Features (Checklist)</label>
                      {(content.aboutFeatures || []).map((f, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, marginBottom: 6 }}
                        >
                          <input
                            className="wad-input"
                            value={f}
                            onChange={(e) => {
                              const a = [...content.aboutFeatures];
                              a[idx] = e.target.value;
                              set("aboutFeatures", a);
                            }}
                          />
                          <button
                            className="wad-btn danger sm icon-only"
                            onClick={() => deleteFeature(idx)}
                          >
                            <Icon d={ICONS.trash} size={12} />
                          </button>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          className="wad-input"
                          placeholder="Naya feature..."
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addFeature()}
                        />
                        <button
                          className="wad-btn primary"
                          onClick={addFeature}
                        >
                          <Icon d={ICONS.plus} size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ LEADERSHIP ═══ */}
            {section === "leadership" && (
              <div>
                <div className="wad-card">
                  <div className="wad-card-header">
                    <div className="wad-card-title">
                      <div className="ct-icon">
                        <Icon d={ICONS.users} size={13} />
                      </div>
                      Principal
                    </div>
                  </div>
                  <div className="wad-card-body">
                    <div className="wad-field">
                      <label className="wad-label">Name</label>
                      <input
                        className="wad-input"
                        value={content.principalName}
                        onChange={(e) => set("principalName", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Role</label>
                      <input
                        className="wad-input"
                        value={content.principalRole}
                        onChange={(e) => set("principalRole", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Quote</label>
                      <textarea
                        className="wad-textarea"
                        rows={3}
                        value={content.principalQuote}
                        onChange={(e) => set("principalQuote", e.target.value)}
                      />
                    </div>
                    <ImagePicker
                      label="Photo"
                      value={content.principalPhoto}
                      onChange={(v) => set("principalPhoto", v)}
                    />
                  </div>
                </div>
                <div className="wad-card">
                  <div className="wad-card-header">
                    <div className="wad-card-title">
                      <div className="ct-icon">
                        <Icon d={ICONS.users} size={13} />
                      </div>
                      Manager / Chairman
                    </div>
                  </div>
                  <div className="wad-card-body">
                    <div className="wad-field">
                      <label className="wad-label">Name</label>
                      <input
                        className="wad-input"
                        value={content.managerName}
                        onChange={(e) => set("managerName", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Role</label>
                      <input
                        className="wad-input"
                        value={content.managerRole}
                        onChange={(e) => set("managerRole", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Quote</label>
                      <textarea
                        className="wad-textarea"
                        rows={3}
                        value={content.managerQuote}
                        onChange={(e) => set("managerQuote", e.target.value)}
                      />
                    </div>
                    <ImagePicker
                      label="Photo"
                      value={content.managerPhoto}
                      onChange={(v) => set("managerPhoto", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ WHY CHOOSE US ═══ */}
            {section === "why" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.check} size={13} />
                    </div>
                    Why Choose Us — Cards
                  </div>
                </div>
                <div className="wad-card-body">
                  {(content.whyCards || []).map((card, idx) => (
                    <div key={idx} className="wad-why-item">
                      <div className="wad-why-icon-picker">{card.icon}</div>
                      <div className="wad-why-fields">
                        <div className="wad-grid-2" style={{ marginBottom: 0 }}>
                          <input
                            className="wad-input"
                            placeholder="Icon (emoji)"
                            value={card.icon}
                            onChange={(e) =>
                              updateWhyCard(idx, "icon", e.target.value)
                            }
                          />
                          <input
                            className="wad-input"
                            placeholder="Title"
                            value={card.title}
                            onChange={(e) =>
                              updateWhyCard(idx, "title", e.target.value)
                            }
                          />
                        </div>
                        <textarea
                          className="wad-textarea"
                          rows={2}
                          placeholder="Description..."
                          value={card.desc}
                          onChange={(e) =>
                            updateWhyCard(idx, "desc", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <button className="wad-add-row" onClick={addWhyCard}>
                    <Icon d={ICONS.plus} size={15} /> Naya Card
                  </button>
                </div>
              </div>
            )}

            {/* ═══ CLASSES ═══ */}
            {section === "classes" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.book} size={13} />
                    </div>
                    Academic Sections (3 vertical cards)
                  </div>
                </div>
                <div className="wad-card-body">
                  {(content.classes || []).map((cls, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: 14,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 10,
                        }}
                      >
                        Card {idx + 1}: {cls.tag}
                      </div>
                      <div className="wad-grid-3">
                        <div className="wad-field">
                          <label className="wad-label">Tag</label>
                          <input
                            className="wad-input"
                            value={cls.tag}
                            onChange={(e) =>
                              updateClass(idx, "tag", e.target.value)
                            }
                          />
                        </div>
                        <div className="wad-field">
                          <label className="wad-label">Title</label>
                          <input
                            className="wad-input"
                            value={cls.title}
                            onChange={(e) =>
                              updateClass(idx, "title", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="wad-field">
                        <label className="wad-label">Description</label>
                        <textarea
                          className="wad-textarea"
                          rows={2}
                          value={cls.desc}
                          onChange={(e) =>
                            updateClass(idx, "desc", e.target.value)
                          }
                        />
                      </div>
                      <ImagePicker
                        label="Background Image"
                        value={cls.image}
                        onChange={(v) => updateClass(idx, "image", v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ NOTICES ═══ */}
            {section === "notices" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.bell} size={13} />
                    </div>
                    Notice Board
                  </div>
                  <button
                    className="wad-btn primary sm"
                    onClick={() => setModal({ type: "notice" })}
                  >
                    <Icon d={ICONS.plus} size={12} /> Naya Notice
                  </button>
                </div>
                <div className="wad-card-body">
                  <div className="wad-list">
                    {(content.notices || []).map((n, idx) => (
                      <div key={idx} className="wad-list-item">
                        <div className="wad-list-item-header">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                background: "var(--ink)",
                                color: "#fff",
                                borderRadius: 7,
                                padding: "6px 10px",
                                textAlign: "center",
                                minWidth: 44,
                                flexShrink: 0,
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: 16 }}>
                                {n.day}
                              </div>
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#f59e0b",
                                  textTransform: "uppercase",
                                }}
                              >
                                {n.mon}
                              </div>
                            </div>
                            <div>
                              <div className="wad-list-item-title">
                                {n.title}
                              </div>
                              <span className={`ntag ${n.tag}`}>{n.tag}</span>
                            </div>
                          </div>
                          <div className="wad-list-actions">
                            <button
                              className="wad-btn sm"
                              onClick={() =>
                                setModal({
                                  type: "notice",
                                  data: n,
                                  index: idx,
                                })
                              }
                            >
                              <Icon d={ICONS.edit} size={12} />
                            </button>
                            <button
                              className="wad-btn sm danger icon-only"
                              onClick={() => deleteNotice(idx)}
                            >
                              <Icon d={ICONS.trash} size={13} />
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--ink3)" }}>
                          {n.desc}
                        </div>
                      </div>
                    ))}
                    <div
                      className="wad-add-row"
                      onClick={() => setModal({ type: "notice" })}
                    >
                      <Icon d={ICONS.plus} size={15} /> Naya Notice
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ GALLERY ═══ */}
            {section === "gallery" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.grid} size={13} />
                    </div>
                    Gallery Photos (Firestore Collection)
                  </div>
                  <button
                    className="wad-btn primary sm"
                    onClick={() => setModal({ type: "galleryCollection" })}
                  >
                    <Icon d={ICONS.plus} size={12} /> Naya Photo
                  </button>
                </div>
                <div className="wad-card-body">
                  {/* Filters */}
                  {galEventNames.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className={`filter-btn${galFilter === "All" ? " active" : ""}`}
                        onClick={() => setGalFilter("All")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          background:
                            galFilter === "All" ? "var(--blue)" : "#fff",
                          color: galFilter === "All" ? "#fff" : "var(--ink3)",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        All
                      </button>
                      {galEventNames.map((ev) => (
                        <button
                          key={ev}
                          className={`filter-btn${galFilter === ev ? " active" : ""}`}
                          onClick={() => setGalFilter(ev)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            background:
                              galFilter === ev ? "var(--blue)" : "#fff",
                            color: galFilter === ev ? "#fff" : "var(--ink3)",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  )}
                  {galFiltered.length > 0 ? (
                    <div className="gal-collection-grid">
                      {galFiltered.map((photo) => (
                        <div key={photo.id} className="gal-col-item">
                          <img src={photo.image} alt={photo.eventName} />
                          <div className="gal-col-overlay">
                            <div className="gco-event">{photo.eventName}</div>
                            {photo.eventDate && (
                              <div className="gco-date">{photo.eventDate}</div>
                            )}
                            <button
                              className="wad-btn sm danger"
                              onClick={() => deleteGalleryPhoto(photo.id)}
                            >
                              <Icon d={ICONS.trash} size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "var(--ink3)",
                      }}
                    >
                      <p style={{ fontSize: "2rem", marginBottom: 8 }}>📸</p>
                      <p>
                        Koi photo nahi hai. "Naya Photo" button se add karein.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ CONTACT / FOOTER ═══ */}
            {section === "contact" && (
              <div className="wad-card">
                <div className="wad-card-header">
                  <div className="wad-card-title">
                    <div className="ct-icon">
                      <Icon d={ICONS.phone} size={13} />
                    </div>
                    Contact & Footer
                  </div>
                </div>
                <div className="wad-card-body">
                  <div className="wad-field">
                    <label className="wad-label">School Name</label>
                    <input
                      className="wad-input"
                      value={content.schoolName}
                      onChange={(e) => set("schoolName", e.target.value)}
                    />
                  </div>
                  <div className="wad-field">
                    <label className="wad-label">Tagline</label>
                    <input
                      className="wad-input"
                      value={content.schoolTagline}
                      onChange={(e) => set("schoolTagline", e.target.value)}
                    />
                  </div>
                  <div className="wad-field">
                    <label className="wad-label">Affiliation Text</label>
                    <input
                      className="wad-input"
                      value={content.affiliationText}
                      onChange={(e) => set("affiliationText", e.target.value)}
                    />
                  </div>
                  <div className="wad-grid-2">
                    <div className="wad-field">
                      <label className="wad-label">Phone</label>
                      <input
                        className="wad-input"
                        value={content.topPhone}
                        onChange={(e) => set("topPhone", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Email</label>
                      <input
                        className="wad-input"
                        value={content.topEmail}
                        onChange={(e) => set("topEmail", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Contact Phone</label>
                      <input
                        className="wad-input"
                        value={content.contactPhone}
                        onChange={(e) => set("contactPhone", e.target.value)}
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Contact Email</label>
                      <input
                        className="wad-input"
                        value={content.contactEmail}
                        onChange={(e) => set("contactEmail", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="wad-field">
                    <label className="wad-label">Address</label>
                    <textarea
                      className="wad-textarea"
                      rows={2}
                      value={content.contactAddress}
                      onChange={(e) => set("contactAddress", e.target.value)}
                    />
                  </div>
                  <div className="wad-field">
                    <label className="wad-label">Hours</label>
                    <input
                      className="wad-input"
                      value={content.contactHours}
                      onChange={(e) => set("contactHours", e.target.value)}
                    />
                  </div>
                  <div className="wad-grid-3">
                    <div className="wad-field">
                      <label className="wad-label">Facebook URL</label>
                      <input
                        className="wad-input"
                        value={content.socialLinks?.facebook || ""}
                        onChange={(e) =>
                          set("socialLinks", {
                            ...content.socialLinks,
                            facebook: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">Instagram URL</label>
                      <input
                        className="wad-input"
                        value={content.socialLinks?.instagram || ""}
                        onChange={(e) =>
                          set("socialLinks", {
                            ...content.socialLinks,
                            instagram: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="wad-field">
                      <label className="wad-label">YouTube URL</label>
                      <input
                        className="wad-input"
                        value={content.socialLinks?.youtube || ""}
                        onChange={(e) =>
                          set("socialLinks", {
                            ...content.socialLinks,
                            youtube: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      {modal?.type === "slide" && (
        <HeroSlideModal
          slide={modal.data}
          onSave={(s) =>
            modal.index !== undefined
              ? updateSlide(modal.index, s)
              : addSlide(s)
          }
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "notice" && (
        <NoticeModal
          notice={modal.data}
          onSave={(n) =>
            modal.index !== undefined
              ? updateNotice(modal.index, n)
              : addNotice(n)
          }
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "galleryCollection" && (
        <GalleryCollectionModal
          item={modal.data}
          onSave={addGalleryPhoto}
          onClose={() => setModal(null)}
        />
      )}

      {/* ═══ TOAST ═══ */}
      {toast && <div className={`wad-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
};
