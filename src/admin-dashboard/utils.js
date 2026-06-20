// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/utils.js
// 📝 हेल्पर फंक्शन्स - localStorage डेटा मैनेजमेंट, समय गणना, रोल नंबर जनरेशन
// ═══════════════════════════════════════════════════════════════════════════════

import { CLASS_ROLL_PREFIX } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// 1. localStorage से डेटा पढ़ना (खाली या corrupt होने पर भी सुरक्षित)
// ─────────────────────────────────────────────────────────────────────────────
export const getEmptyMockDb = () => ({
  students: [],
  teachers: [],
  notices: [],
  leaveRequests: [],
  concessionRequests: [],
  salarySlips: [],
  feePaymentRequests: [],
  timetables: {},
  exams: [],
  timetableStartHour: 8,
  timetablePeriodDuration: 60,
  users: {},
});

/**
 * localStorage से mock DB पढ़ता है
 * अगर डेटा नहीं है या खराब है तो खाली DB return करता है
 */
export const getMockDb = () => {
  try {
    const raw = localStorage.getItem("school_erp_mock_db");
    if (!raw) return getEmptyMockDb();
    const parsed = JSON.parse(raw);
    return { ...getEmptyMockDb(), ...parsed };
  } catch {
    return getEmptyMockDb();
  }
};

/**
 * पूरे DB को localStorage में सेव करता है
 */
export const saveMockDb = (data) => {
  try {
    localStorage.setItem("school_erp_mock_db", JSON.stringify(data));
  } catch (err) {
    import("../utils/logger").then(({ error }) =>
      error("Failed to save mock DB", err),
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ऑटोमैटिक रोल नंबर जनरेटर
// ─────────────────────────────────────────────────────────────────────────────

/**
 * क्लास और सेक्शन के हिसाब से रोल नंबर बनाता है
 * फॉर्मेट: PREFIX-SECTION-SERIAL (जैसे 10-A-001)
 * @param {string} className - क्लास का नाम
 * @param {string} section - सेक्शन (A/B/C/D)
 * @param {Array} existingStudents - मौजूदा स्टूडेंट्स की लिस्ट
 * @returns {string} - जनरेटेड रोल नंबर
 */
export const generateRollNo = (className, section, existingStudents) => {
  const prefix = CLASS_ROLL_PREFIX[className] || "XX";
  const sectionCode = section || "A";
  const classStudents = existingStudents.filter(
    (s) => s.class === className && s.section === sectionCode,
  );
  const maxSerial = classStudents.reduce((max, s) => {
    const parts = String(s.rollNo).split("-");
    const serial = parseInt(parts[parts.length - 1]) || 0;
    return Math.max(max, serial);
  }, 0);
  const nextSerial = String(maxSerial + 1).padStart(3, "0");
  return `${prefix}-${sectionCode}-${nextSerial}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. टाइमटेबल का समय निकालना
// ─────────────────────────────────────────────────────────────────────────────

/**
 * पीरियड नंबर के हिसाब से समय (start - end) निकालता है
 * @param {string} periodStr - पीरियड नंबर (जैसे "1st", "2nd")
 * @param {number} startHour - स्कूल शुरू होने का समय (जैसे 8)
 * @param {number} durationMinutes - हर पीरियड की अवधि (मिनटों में)
 * @returns {string} - फॉर्मेटेड टाइम रेंज (जैसे "08:00 AM - 09:00 AM")
 */
export const getPeriodTime = (periodStr, startHour, durationMinutes) => {
  const PERIOD_SLOTS = {
    "1st": 1,
    "2nd": 2,
    "3rd": 3,
    "4th": 4,
    "5th": 5,
    "6th": 6,
    "7th": 7,
  };
  const slotIndex = PERIOD_SLOTS[periodStr] || 1;
  const start = parseInt(startHour) || 8;
  const dur = parseInt(durationMinutes) || 60;

  const startTotalMinutes = start * 60 + (slotIndex - 1) * dur;
  const endTotalMinutes = startTotalMinutes + dur;

  const formatTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    let displayHour = hours % 12;
    if (displayHour === 0) displayHour = 12;
    const padHour = displayHour < 10 ? `0${displayHour}` : displayHour;
    const padMin = minutes < 10 ? `0${minutes}` : minutes;
    return `${padHour}:${padMin} ${period}`;
  };

  return `${formatTime(startTotalMinutes)} - ${formatTime(endTotalMinutes)}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. आईडी जनरेटर
// ─────────────────────────────────────────────────────────────────────────────

/** यूनिक आईडी बनाता है (जैसे "std_x7k4m2q9") */
export const generateId = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

/** ट्रांजेक्शन आईडी बनाता है (जैसे "CASH-847291") */
export const generateTxnId = () =>
  "CASH-" + Math.floor(100000 + Math.random() * 900000);

// ─────────────────────────────────────────────────────────────────────────────
// 5. फीस गणना
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ब्रेकडाउन के आधार पर कुल फीस की गणना करता है
 * monthlyTuition × 12 + yearlyTerm + extraCharges
 */
export const computeTotalFees = (breakdown) => {
  const bd = breakdown || {
    monthlyTuition: 3000,
    yearlyTerm: 10000,
    extraCharges: 4000,
  };
  const monthlyTotal = (Number(bd.monthlyTuition) || 3000) * 12;
  const yearlyTotal = Number(bd.yearlyTerm) || 10000;
  const extraTotal = Number(bd.extraCharges) || 4000;
  return monthlyTotal + yearlyTotal + extraTotal;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ईमेल वैलिडेशन
// ─────────────────────────────────────────────────────────────────────────────

export const isValidEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
