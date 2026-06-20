// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/CredentialsModal.jsx
// 📝 क्रेडेंशियल मोडल - स्टूडेंट/टीचर के नए अकाउंट की जानकारी दिखाता है
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { CheckCircle } from "lucide-react";

const CredentialsModal = ({ show, data, onClose }) => {
  if (!show || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-emerald-100 p-3 rounded-full mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">
            {data.type === "student"
              ? "Student Admitted!"
              : "Teacher Registered!"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Login credentials generated successfully.
          </p>
        </div>

        {/* ── यूज़र की जानकारी ── */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-sm">
          <Row label="Name" value={data.name} />
          <Row label="Email" value={data.email} />
          <Row label="Password" value={data.password} isHighlight />
          {data.rollNo && <Row label="Roll No" value={data.rollNo} />}
          {data.subject && <Row label="Subject" value={data.subject} />}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-[10px] text-slate-400 text-center">
            📝 Please save these credentials. The user needs them to log in.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, isHighlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <span
      className={`font-bold ${isHighlight ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs" : "text-slate-800"}`}
    >
      {value}
    </span>
  </div>
);

export default CredentialsModal;
