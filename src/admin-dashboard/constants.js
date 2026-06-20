// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/constants.js
// 📝 यह फाइल एडमिन डैशबोर्ड में उपयोग होने वाले सभी कॉन्स्टेंट डेटा को रखती है
// ═══════════════════════════════════════════════════════════════════════════════

// 📌 Nursery से Class 12 तक की पूरी क्लास लिस्ट
export const ALL_CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11 (Science)",
  "Class 11 (Commerce)",
  "Class 11 (Arts)",
  "Class 12 (Science)",
  "Class 12 (Commerce)",
  "Class 12 (Arts)",
];

// 📌 हर क्लास के लिए सेक्शन (A, B, C, D)
export const SECTIONS = ["A", "B", "C", "D"];

// 📌 रोल नंबर जनरेट करने के लिए क्लास-वाइज़ प्रीफिक्स मैप
// हर क्लास का अपना एक कोड होता है जो रोल नंबर की शुरुआत में लगता है
export const CLASS_ROLL_PREFIX = {
  Nursery: "N",
  LKG: "LK",
  UKG: "UK",
  "Class 1": "01",
  "Class 2": "02",
  "Class 3": "03",
  "Class 4": "04",
  "Class 5": "05",
  "Class 6": "06",
  "Class 7": "07",
  "Class 8": "08",
  "Class 9": "09",
  "Class 10": "10",
  "Class 11 (Science)": "11S",
  "Class 11 (Commerce)": "11C",
  "Class 11 (Arts)": "11A",
  "Class 12 (Science)": "12S",
  "Class 12 (Commerce)": "12C",
  "Class 12 (Arts)": "12A",
};

// 📌 स्टूडेंट को अगली क्लास में प्रमोट करने का मैप
// जैसे Nursery → LKG, Class 1 → Class 2, आदि
export const NEXT_CLASS_MAP = {
  Nursery: "LKG",
  LKG: "UKG",
  UKG: "Class 1",
  "Class 1": "Class 2",
  "Class 2": "Class 3",
  "Class 3": "Class 4",
  "Class 4": "Class 5",
  "Class 5": "Class 6",
  "Class 6": "Class 7",
  "Class 7": "Class 8",
  "Class 8": "Class 9",
  "Class 9": "Class 10",
  "Class 10": "Class 11 (Science)", // डिफ़ॉल्ट, बदला जा सकता है
  "Class 11 (Science)": "Class 12 (Science)",
  "Class 11 (Commerce)": "Class 12 (Commerce)",
  "Class 11 (Arts)": "Class 12 (Arts)",
  "Class 12 (Science)": "Passed Out",
  "Class 12 (Commerce)": "Passed Out",
  "Class 12 (Arts)": "Passed Out",
};

// 📌 साइडबार में दिखने वाले सभी टैब की लिस्ट
// हर टैब में id, label और icon होता है
export const TAB_ITEMS = [
  { id: "overview", label: "Dashboard Home", icon: "LayoutDashboard" },
  { id: "approvals", label: "Approvals Hub", icon: "Shield" },
  { id: "students", label: "Student Management", icon: "Users" },
  { id: "student_info", label: "Student Directory", icon: "Contact" },
  { id: "teachers", label: "Teacher Management", icon: "UserPlus" },
  { id: "attendance", label: "Attendance Reports", icon: "Calendar" },
  { id: "fees", label: "Fees Management", icon: "CreditCard" },
  { id: "salary", label: "Salary Management", icon: "DollarSign" },
  { id: "notices", label: "Notice & Circular", icon: "Megaphone" },
  { id: "timetable", label: "Timetable Control", icon: "Clock" },
  { id: "exams", label: "Exam & Results", icon: "Award" },
  { id: "settings", label: "Settings & Roles", icon: "Sliders" },
];

// 📌 पीरियड स्लॉट्स (1st से 7th तक)
export const PERIOD_SLOTS = {
  "1st": 1,
  "2nd": 2,
  "3rd": 3,
  "4th": 4,
  "5th": 5,
  "6th": 6,
  "7th": 7,
};

// 📌 दिनों का ऑर्डर (Monday = 1, Tuesday = 2, ...)
export const DAY_ORDER = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
