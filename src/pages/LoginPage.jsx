import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { error as logError } from "../utils/logger";
import { onSnapshot, doc, db } from "../firebase";
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// ─── CSS — P.S. Academy Navy + Gold ─────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');

  .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* ── Left Panel: Navy Dark ── */
  .lp-left {
    position: relative;
    background: linear-gradient(160deg, #0f1b3d 0%, #1a2d5e 45%, #080e22 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
    overflow: hidden;
    min-height: 100vh;
  }

  .lp-left-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(201,168,76,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  /* Gold glow blobs */
  .lp-blob-1 {
    position: absolute;
    top: -120px; right: -80px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.15), transparent 70%);
    pointer-events: none;
  }
  .lp-blob-2 {
    position: absolute;
    bottom: -80px; left: -80px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,212,139,0.1), transparent 70%);
    pointer-events: none;
  }

  /* ── Gold accent line ── */
  .lp-left::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c);
  }

  /* Top logo bar */
  .lp-left-header {
    position: relative; z-index: 2;
    display: flex; align-items: center; gap: 14px;
  }
  .lp-left-emblem {
    width: 54px; height: 54px; border-radius: 12px;
    background: rgba(201,168,76,0.15);
    border: 2px solid rgba(201,168,76,0.4);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; overflow: hidden;
    font-family: 'Playfair Display', serif;
    font-weight: 800; font-size: 1.2rem; color: #e8d48b;
  }
  .lp-left-school-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700; color: #fff;
    line-height: 1.3;
  }
  .lp-left-school-sub {
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-top: 2px;
  }

  /* Main left content */
  .lp-left-body {
    position: relative; z-index: 2;
    flex: 1;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 48px 0;
  }
  .lp-left-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(201,168,76,0.12);
    border: 1px solid rgba(201,168,76,0.3);
    color: #e8d48b;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 6px 16px; border-radius: 100px;
    margin-bottom: 28px; width: fit-content;
  }
  .lp-left-badge .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #c9a84c;
    animation: lpPulse 2s ease-in-out infinite;
  }
  @keyframes lpPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

  .lp-left-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 2.8vw, 42px);
    font-weight: 700; color: #fff;
    line-height: 1.2; margin-bottom: 20px;
    letter-spacing: -0.3px;
  }
  .lp-left-title em { color: #e8d48b; font-style: normal; }
  .lp-left-desc {
    font-size: 15px; color: rgba(255,255,255,0.6);
    line-height: 1.8; margin-bottom: 24px;
    max-width: 380px;
  }

  /* ── Child Photo Section ── */
  .lp-child-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
    padding: 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    max-width: 420px;
  }
  .lp-child-photo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(201,168,76,0.4);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    flex-shrink: 0;
  }
  .lp-child-quote {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
  }
  .lp-child-quote em {
    color: #e8d48b;
    font-style: normal;
  }

  /* Feature chips */
  .lp-features { display: flex; flex-direction: column; gap: 14px; }
  .lp-feature {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 16px 18px;
    transition: background 0.2s;
  }
  .lp-feature:hover { background: rgba(255,255,255,0.08); }
  .lp-feature-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .lp-feature-text .t1 { font-size: 14px; font-weight: 700; color: #fff; }
  .lp-feature-text .t2 { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 3px; line-height: 1.5; }

  /* Bottom footer on left */
  .lp-left-footer {
    position: relative; z-index: 2;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 16px 20px;
    font-size: 12.5px; color: rgba(255,255,255,0.5);
    line-height: 1.7;
  }
  .lp-left-footer strong { color: rgba(255,255,255,0.85); }

  /* ── Right Panel: Gold Accent ── */
  .lp-right {
    background: #f8f7f4;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 52px 60px;
    position: relative;
    min-height: 100vh;
  }

  /* Gold accent bar on right */
  .lp-right-accent {
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: linear-gradient(to bottom, #c9a84c, #e8d48b, #a8862e);
  }

  /* Back button */
  .lp-back {
    position: absolute; top: 28px; left: 32px;
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 600;
    color: #62615e; text-decoration: none;
    background: #fff; border: 1px solid #e2e1dd;
    border-radius: 10px; padding: 8px 14px;
    transition: all 0.2s;
  }
  .lp-back:hover { color: #0f1b3d; border-color: #c9a84c; background: #f8f7f4; }

  .lp-form-wrap { width: 100%; max-width: 400px; }

  /* Form header */
  .lp-form-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(15,27,61,0.06);
    border: 1px solid rgba(15,27,61,0.15);
    color: #0f1b3d;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 6px 16px; border-radius: 100px;
    margin-bottom: 22px;
  }
  .lp-form-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 2.5vw, 34px);
    font-weight: 700; color: #0f1b3d;
    line-height: 1.2; margin-bottom: 10px;
  }
  .lp-form-sub {
    font-size: 14px; color: #62615e;
    line-height: 1.7; margin-bottom: 36px;
  }

  /* Error alert */
  .lp-error {
    display: flex; align-items: flex-start; gap: 12px;
    background: #fff5f5;
    border: 1px solid #f5c6cb;
    border-radius: 12px; padding: 14px 16px;
    margin-bottom: 24px;
  }
  .lp-error-icon {
    width: 34px; height: 34px; border-radius: 8px;
    background: #dc2626; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
    color: #fff;
  }
  .lp-error-title { font-size: 13px; font-weight: 700; color: #991b1b; }
  .lp-error-msg { font-size: 12.5px; color: #b91c1c; margin-top: 3px; line-height: 1.5; }

  /* Input fields */
  .lp-field { margin-bottom: 20px; }
  .lp-label {
    display: block; font-size: 12px; font-weight: 700;
    color: #484744; text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 8px;
  }
  .lp-input-wrap { position: relative; }
  .lp-input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #8a8986; display: flex; align-items: center;
    pointer-events: none;
  }
  .lp-input {
    width: 100%;
    background: #fff;
    border: 1.5px solid #e2e1dd;
    border-radius: 12px;
    padding: 13px 14px 13px 44px;
    font-size: 14px; color: #1a1a2e;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-input::placeholder { color: #b0afaa; }
  .lp-input:focus {
    border-color: #c9a84c;
    box-shadow: 0 0 0 4px rgba(201,168,76,0.12);
  }
  .lp-input.is-error {
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220,38,38,0.1);
  }
  .lp-input.is-error:focus { border-color: #dc2626; }

  /* Submit button — Navy + Gold */
  .lp-submit {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: none; cursor: pointer;
    background: linear-gradient(135deg, #0f1b3d 0%, #1a2d5e 100%);
    color: #fff;
    font-size: 15px; font-weight: 700;
    font-family: 'Inter', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.25s;
    box-shadow: 0 6px 20px rgba(15,27,61,0.25);
    margin-top: 8px;
    position: relative; overflow: hidden;
  }
  .lp-submit::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 100%);
    opacity: 0; transition: opacity 0.25s;
  }
  .lp-submit:hover::before { opacity: 1; }
  .lp-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,27,61,0.35); }
  .lp-submit:active { transform: translateY(0); }
  .lp-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  /* Spinner */
  .lp-spinner {
    width: 20px; height: 20px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: lpSpin 0.8s linear infinite;
  }
  @keyframes lpSpin { to { transform: rotate(360deg); } }

  /* Divider */
  .lp-divider {
    display: flex; align-items: center; gap: 14px;
    margin: 28px 0;
  }
  .lp-divider-line { flex: 1; height: 1px; background: #e2e1dd; }
  .lp-divider-text { font-size: 12px; font-weight: 600; color: #8a8986; white-space: nowrap; }

  /* Register link */
  .lp-register {
    display: flex; flex-direction: column; gap: 14px; text-align: center;
  }
  .lp-register-note {
    font-size: 13px; color: #62615e; line-height: 1.65;
  }
  .lp-register-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 28px;
    border-radius: 12px;
    background: #fff;
    border: 1.5px solid #e2e1dd;
    color: #0f1b3d;
    font-size: 14px; font-weight: 700;
    text-decoration: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.22s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .lp-register-btn:hover {
    border-color: #c9a84c;
    color: #0f1b3d;
    background: #f8f7f4;
    box-shadow: 0 4px 16px rgba(201,168,76,0.2);
    transform: translateY(-2px);
  }

  /* Demo login cards */
  .lp-demo-section {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid #e2e1dd;
  }
  .lp-demo-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8a8986;
    margin-bottom: 12px;
    text-align: center;
  }
  .lp-demo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .lp-demo-btn {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e2e1dd;
    background: #fff;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #484744;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .lp-demo-btn:hover {
    border-color: #c9a84c;
    background: rgba(201,168,76,0.06);
    color: #0f1b3d;
  }
  .lp-demo-role {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a8862e;
    display: block;
  }
  .lp-demo-email {
    font-size: 10px;
    color: #8a8986;
  }

  /* Role indicator dots at bottom */
  .lp-roles {
    display: flex; gap: 8px; align-items: center;
    justify-content: center; margin-top: 24px;
    flex-wrap: wrap;
  }
  .lp-role-chip {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; color: #62615e;
    background: #fff; border: 1px solid #e2e1dd;
    border-radius: 100px; padding: 4px 12px;
  }
  .lp-role-chip .dot {
    width: 6px; height: 6px; border-radius: 50%;
  }

  /* ── Responsive ── */
  @media (max-width: 800px) {
    .lp-root { grid-template-columns: 1fr; }
    .lp-left { display: none; }
    .lp-right {
      padding: 80px 28px 48px;
      background: linear-gradient(160deg, #0f1b3d 0%, #1a2d5e 25%, #f8f7f4 25%);
    }
    .lp-right-accent { display: none; }
    .lp-form-wrap { max-width: 420px; }
    .lp-form-title { color: #0f1b3d; }
    .lp-demo-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 420px) {
    .lp-right { padding: 70px 20px 40px; }
  }
`;

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPagePhoto, setLoginPagePhoto] = useState(
    "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400&auto=format&fit=crop",
  );
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  // Inject CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Load login page photo from Firestore settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "landingPage"), (snap) => {
      if (snap.exists() && snap.data().loginPagePhoto) {
        setLoginPagePhoto(snap.data().loginPagePhoto);
      }
    });
    return () => unsub();
  }, []);

  const invalidInput = Boolean(error);

  const redirectByRole = useCallback(
    (role) => {
      if (role === "admin") navigate("/admin");
      else if (role === "webadmin") navigate("/webadmin");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "parent") navigate("/parent");
      else navigate("/");
    },
    [navigate],
  );

  useEffect(() => {
    if (userRole) {
      redirectByRole(userRole);
    }
  }, [userRole, redirectByRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      const result = await login(email, password);

      const roleFromApi = result?.user?.role;
      if (roleFromApi) {
        redirectByRole(roleFromApi);
        return;
      }

      const emailLower = email.trim().toLowerCase();
      if (emailLower === "admin@school.com") {
        redirectByRole("admin");
        return;
      }
      if (emailLower === "webadmin@school.com") {
        redirectByRole("webadmin");
        return;
      }
      if (emailLower === "teacher@school.com") {
        redirectByRole("teacher");
        return;
      }
      if (emailLower === "parent@school.com") {
        redirectByRole("parent");
        return;
      }

      setTimeout(() => {
        if (userRole) redirectByRole(userRole);
        else navigate("/");
      }, 600);
    } catch (err) {
      logError(err);
      const msg = err.message || "";
      if (
        msg.includes("Invalid") ||
        msg.includes("auth/invalid-credential") ||
        msg.includes("401")
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("500")
      ) {
        setError(
          "Server unreachable. Please make sure the backend is running on port 5000.",
        );
      } else {
        setError(
          "Login failed: " + (msg || "Unknown error. Please try again."),
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Quick demo login fillers ──
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="lp-root">
      {/* ── Left Panel: School Branding + Child Photo ── */}
      <div className="lp-left">
        <div className="lp-left-pattern" />
        <div className="lp-blob-1" />
        <div className="lp-blob-2" />

        {/* School logo */}
        <div className="lp-left-header">
          <div className="lp-left-emblem">PS</div>
          <div>
            <div className="lp-left-school-name">P.S. Academy</div>
            <div className="lp-left-school-sub">
              Semra Khandoli, Agra · CBSE Affiliated
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lp-left-body">
          <div className="lp-left-badge">
            <span className="dot" />
            School Management Portal
          </div>

          <h1 className="lp-left-title">
            P.S. Academy <em>ERP Dashboard</em>
          </h1>

          <p className="lp-left-desc">
            Secure, role-based access for teachers, parents, and administrators.
            Attendance, timetables, fees, and notices — all in one place.
          </p>

          {/* ── Child Photo Section ── */}
          <div className="lp-child-section">
            <img
              src={loginPagePhoto}
              alt="Student"
              className="lp-child-photo"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400&auto=format&fit=crop";
              }}
            />
            <div className="lp-child-quote">
              "<em>Learning</em> is a treasure that will follow its owner
              everywhere."
            </div>
          </div>

          <div className="lp-features">
            <div className="lp-feature">
              <div className="lp-feature-icon">📋</div>
              <div className="lp-feature-text">
                <div className="t1">Attendance Tracker</div>
                <div className="t2">
                  Monitor student attendance and daily class roll calls in real
                  time.
                </div>
              </div>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon">🗓️</div>
              <div className="lp-feature-text">
                <div className="t1">Weekly Timetable</div>
                <div className="t2">
                  View full-week schedules for every class, section, and
                  subject.
                </div>
              </div>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon">📢</div>
              <div className="lp-feature-text">
                <div className="t1">Fees & Notices</div>
                <div className="t2">
                  Stay informed with fee status, school announcements, and
                  reports.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="lp-left-footer">
          <strong>One login for every campus role:</strong> admin, web admin,
          teacher, and parent — designed for trusted, secure school use only.
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="lp-right">
        {/* Gold accent bar */}
        <div className="lp-right-accent" />

        {/* Back button */}
        <Link to="/" className="lp-back">
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <div className="lp-form-wrap">
          {/* Header */}
          <div className="lp-form-eyebrow">
            <GraduationCap size={13} />
            P.S. Academy Portal
          </div>
          <h2 className="lp-form-title">Sign In to Your Account</h2>
          <p className="lp-form-sub">
            Enter your school-issued credentials to access your dashboard,
            timetables, attendance, and academic reports.
          </p>

          {/* Error */}
          {error && (
            <div className="lp-error">
              <div className="lp-error-icon">
                <AlertCircle size={16} />
              </div>
              <div>
                <div className="lp-error-title">Login Failed</div>
                <div className="lp-error-msg">{error}</div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="lp-field">
              <label className="lp-label">Email Address</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  required
                  className={`lp-input${invalidInput ? " is-error" : ""}`}
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`lp-input${invalidInput ? " is-error" : ""}`}
                />
              </div>
            </div>

            <button type="submit" disabled={loginLoading} className="lp-submit">
              {loginLoading ? (
                <div className="lp-spinner" />
              ) : (
                <>
                  Enter Portal <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="lp-demo-section">
            <div className="lp-demo-label">Quick Demo Login</div>
            <div className="lp-demo-grid">
              <button
                className="lp-demo-btn"
                onClick={() => fillDemo("admin@school.com", "admin123")}
              >
                <span>👨‍🏫</span>
                <div>
                  <span className="lp-demo-role">Admin</span>
                  <span className="lp-demo-email">admin@school.com</span>
                </div>
              </button>
              <button
                className="lp-demo-btn"
                onClick={() => fillDemo("webadmin@school.com", "webadmin123")}
              >
                <span>🌐</span>
                <div>
                  <span className="lp-demo-role">Web Admin</span>
                  <span className="lp-demo-email">webadmin@school.com</span>
                </div>
              </button>
              <button
                className="lp-demo-btn"
                onClick={() => fillDemo("teacher@school.com", "teacher123")}
              >
                <span>📚</span>
                <div>
                  <span className="lp-demo-role">Teacher</span>
                  <span className="lp-demo-email">teacher@school.com</span>
                </div>
              </button>
              <button
                className="lp-demo-btn"
                onClick={() => fillDemo("parent@school.com", "parent123")}
              >
                <span>👨‍👩‍👧</span>
                <div>
                  <span className="lp-demo-role">Parent</span>
                  <span className="lp-demo-email">parent@school.com</span>
                </div>
              </button>
            </div>
          </div>

          {/* Divider + register */}
          <div className="lp-divider">
            <div className="lp-divider-line" />
            <span className="lp-divider-text">New admin or web admin?</span>
            <div className="lp-divider-line" />
          </div>

          <div className="lp-register">
            <p className="lp-register-note">
              Admin and Web Admin accounts must be registered through the school
              signup flow. Teacher and parent credentials are issued by
              administration.
            </p>
            <Link to="/signup" className="lp-register-btn">
              Register Admin / Web Admin →
            </Link>
          </div>

          {/* Role chips */}
          <div className="lp-roles">
            <div className="lp-role-chip">
              <span className="dot" style={{ background: "#0f1b3d" }} />
              Admin
            </div>
            <div className="lp-role-chip">
              <span className="dot" style={{ background: "#a8862e" }} />
              Web Admin
            </div>
            <div className="lp-role-chip">
              <span className="dot" style={{ background: "#c9a84c" }} />
              Teacher
            </div>
            <div className="lp-role-chip">
              <span className="dot" style={{ background: "#e8d48b" }} />
              Parent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
