import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, orderBy, db } from "../firebase";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES — same design language as LandingPage for consistency
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  color: #1a1a2e;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, .serif { font-family: 'Playfair Display', serif; }

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
  --text: #1a1a2e;
  --text-light: #5a5a6e;
  --border: #e2e1dd;
  --shadow: 0 4px 20px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section { padding: 80px 0; }

/* ── Gallery Nav ── */
.gallery-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.gnav-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 64px;
}
.gnav-logo {
  display: flex; align-items: center; gap: 10px; text-decoration: none;
}
.gnav-logo-icon {
  width: 36px; height: 36px;
  background: var(--navy);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-weight: 700; font-size: 0.9rem; color: var(--gold-light);
}
.gnav-logo-text {
  font-family: 'Playfair Display', serif;
  font-weight: 700; font-size: 1.1rem; color: var(--navy);
}
.gnav-back {
  display: flex; align-items: center; gap: 6px;
  color: var(--text-light);
  text-decoration: none; font-size: 0.9rem; font-weight: 500;
  transition: color 0.2s;
}
.gnav-back:hover { color: var(--navy); }

/* ── Hero ── */
.gallery-hero {
  background: var(--navy);
  padding: 60px 0 40px;
  text-align: center;
}
.gallery-hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 4vw, 48px);
  color: #fff;
  margin-bottom: 8px;
}
.gallery-hero p {
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
}

/* ── Filter Tabs ── */
.filter-bar {
  display: flex; justify-content: center; flex-wrap: wrap;
  gap: 8px;
  margin: 32px 0;
}
.filter-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover { border-color: var(--gold); color: var(--navy); }
.filter-btn.active {
  background: var(--navy);
  color: #fff;
  border-color: var(--navy);
}

/* ── Gallery Grid Masonry-ish ── */
.gal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.gal-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: var(--off-white);
  aspect-ratio: 4/3;
}
.gal-item img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s;
}
.gal-item:hover img { transform: scale(1.08); }
.gal-item-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(8,14,34,0.85), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
}
.gal-item:hover .gal-item-overlay { opacity: 1; }
.gal-event {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold-light);
  margin-bottom: 4px;
}
.gal-date {
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
}

/* ── Lightbox ── */
.lightbox-bg {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.lightbox-bg img {
  max-width: 90vw;
  max-height: 85vh;
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
  max-width: 80%;
}
.lightbox-info .ev { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold-light); margin-bottom: 4px; }
.lightbox-info .dt { font-size: 0.8rem; opacity: 0.6; }
.lightbox-info .ds { font-size: 0.85rem; opacity: 0.7; margin-top: 6px; }

.lightbox-prev, .lightbox-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.1); color: #fff;
  border: none; width: 48px; height: 48px;
  border-radius: 50%; cursor: pointer;
  font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.lightbox-prev:hover, .lightbox-next:hover { background: rgba(255,255,255,0.2); }
.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }

/* ── Stats ── */
.gal-stats {
  display: flex; justify-content: center; gap: 32px;
  margin-top: 24px;
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
}
.gal-stats span { display: flex; align-items: center; gap: 6px; }

/* ── Empty ── */
.empty-state {
  text-align: center; padding: 80px 20px;
  color: var(--gray-400);
}
.empty-state p { font-size: 1rem; margin-top: 12px; }

@media (max-width: 768px) {
  .gal-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .filter-bar { gap: 6px; }
  .filter-btn { padding: 6px 14px; font-size: 0.8rem; }
  .lightbox-prev { left: 8px; }
  .lightbox-next { right: 8px; }
}
@media (max-width: 480px) {
  .gal-grid { grid-template-columns: 1fr; }
}
`;

const EVENT_COLORS = {
  "Annual Day": "#d93025",
  "Sports Day": "#1a73e8",
  "Science Fair": "#1e8e3e",
  Cultural: "#9334e6",
  "Republic Day": "#ff8f00",
  "Independence Day": "#e37400",
  Workshop: "#0d652d",
  "Field Trip": "#185abc",
  Other: "#5f6368",
};

export const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(
          collection(db, "gallery"),
          orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        const items = [];
        snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        setPhotos(items);
      } catch (e) {
        console.error("Error fetching gallery:", e);
      }
    };
    fetchGallery();
  }, []);

  // Extract unique event names for filters
  const eventNames = [
    ...new Set(photos.map((p) => p.eventName).filter(Boolean)),
  ];
  const filters = ["All", ...eventNames.sort()];

  const filtered =
    activeFilter === "All"
      ? photos
      : photos.filter((p) => p.eventName === activeFilter);

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(filtered[idx]);
  };

  const closeLightbox = () => {
    setLightbox(null);
    setLightboxIdx(0);
  };

  const prevPhoto = () => {
    const newIdx = (lightboxIdx - 1 + filtered.length) % filtered.length;
    setLightboxIdx(newIdx);
    setLightbox(filtered[newIdx]);
  };

  const nextPhoto = () => {
    const newIdx = (lightboxIdx + 1) % filtered.length;
    setLightboxIdx(newIdx);
    setLightbox(filtered[newIdx]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, lightboxIdx, filtered.length]);

  return (
    <div>
      {/* ── TOP NAV ── */}
      <nav className="gallery-nav">
        <div className="container gnav-inner">
          <Link to="/" className="gnav-logo">
            <div className="gnav-logo-icon">PS</div>
            <div className="gnav-logo-text">P.S. Academy</div>
          </Link>
          <Link to="/" className="gnav-back">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="gallery-hero">
        <div className="container">
          <h1>School Photo Gallery</h1>
          <p>
            Hamare school ke yaadgar lamhon ki jhalak — events, functions, aur
            daily life ki tasveerein.
          </p>
          <div className="gal-stats">
            <span>📸 {photos.length} Photos</span>
            <span>🏷️ {eventNames.length} Events</span>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      {filters.length > 1 && (
        <div className="container">
          <div className="filter-bar">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-btn${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "All" ? "🖼️ All Photos" : f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GRID ── */}
      <div className="section">
        <div className="container">
          {filtered.length > 0 ? (
            <motion.div layout className="gal-grid">
              {filtered.map((photo, idx) => (
                <motion.div
                  key={photo.id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="gal-item"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={photo.image}
                    alt={photo.eventName || "School Photo"}
                  />
                  <div className="gal-item-overlay">
                    <div className="gal-event">
                      {photo.eventName || "School Event"}
                    </div>
                    {photo.eventDate && (
                      <div className="gal-date">{photo.eventDate}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state">
              <p style={{ fontSize: "3rem" }}>📸</p>
              <p>
                {photos.length === 0
                  ? "Gallery mein koi photo nahi hai. Web Admin se photos add karein."
                  : "Is event ki koi photo nahi mili."}
              </p>
              {photos.length === 0 && (
                <Link
                  to="/"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    color: "var(--navy)",
                    fontWeight: 600,
                  }}
                >
                  ← Back to Home
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-bg" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            ✕
          </button>
          {filtered.length > 1 && (
            <>
              <button
                className="lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
              >
                ‹
              </button>
              <button
                className="lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                ›
              </button>
            </>
          )}
          <img
            src={lightbox.image}
            alt={lightbox.eventName || "Photo"}
            onClick={(e) => e.stopPropagation()}
          />
          {(lightbox.eventName ||
            lightbox.eventDate ||
            lightbox.description) && (
            <div className="lightbox-info">
              {lightbox.eventName && (
                <div className="ev">{lightbox.eventName}</div>
              )}
              {lightbox.eventDate && (
                <div className="dt">{lightbox.eventDate}</div>
              )}
              {lightbox.description && (
                <div className="ds">{lightbox.description}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
