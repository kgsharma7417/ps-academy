// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/hooks/useAdminDashboard.js
// 📝 मुख्य हुक (Custom Hook) - इसमें सारा State और Business Logic है
// यही पूरे डैशबोर्ड का दिमाग (Brain) है
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  db,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  adminCreateUser,
} from "../../firebase";
import {
  getMockDb,
  saveMockDb,
  generateRollNo,
  generateId,
  generateTxnId,
  computeTotalFees,
  isValidEmail,
} from "../utils";
import { NEXT_CLASS_MAP, PERIOD_SLOTS, DAY_ORDER } from "../constants";
import { getPeriodTime } from "../utils";

// ─── मुख्य हुक ──────────────────────────────────────────────────────────────
export const useAdminDashboard = () => {
  const { userData, logout } = useAuth();

  // ── Tab State (कौन सा टैब चालू है) ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");

  // ── Data States (डेटा स्टोर) ─────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [feePaymentRequests, setFeePaymentRequests] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [examsList, setExamsList] = useState([]);

  // ── Statistics (आँकड़े) ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    attendanceRate: 84,
    teachersOnLeave: "0/0",
    collectedFees: "₹0",
    pendingFees: "₹0",
    alertsCount: 0,
  });

  // ── Search & Filter ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [dirSearchTerm, setDirSearchTerm] = useState("");
  const [dirClassFilter, setDirClassFilter] = useState("All");

  // ── Settings & Alerts ────────────────────────────────────────────────────
  const [settingsAlerts, setSettingsAlerts] = useState({
    sms: true,
    email: true,
    whatsapp: false,
  });
  const [simulatedLogs, setSimulatedLogs] = useState([
    "[System] Notification pipeline initialized.",
  ]);

  // ── Modal States (पॉपअप के लिए) ─────────────────────────────────────────
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] =
    useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsData, setCredentialsData] = useState(null);

  // ── Timetable States (टाइमटेबल) ──────────────────────────────────────────
  const [timetableForm, setTimetableForm] = useState({
    className: "Class 10",
    section: "A",
    day: "Monday",
    period: "1st",
    subject: "Mathematics",
    teacherName: "",
  });
  const [classTimetable, setClassTimetable] = useState([]);
  const [timetableClass, setTimetableClass] = useState("Class 10");
  const [timetableSection, setTimetableSection] = useState("A");
  const [timetableStartHour, setTimetableStartHour] = useState(() => {
    const mockDb = getMockDb();
    return mockDb.timetableStartHour || 8;
  });
  const [timetablePeriodDuration, setTimetablePeriodDuration] = useState(() => {
    const mockDb = getMockDb();
    return mockDb.timetablePeriodDuration || 60;
  });
  const [editingBlock, setEditingBlock] = useState(null);

  // ── School Info ──────────────────────────────────────────────────────────
  const [schoolInfo, setSchoolInfo] = useState({
    name: "P.S ACADEMY",
    address: "100 Education Blvd, Academic Valley, CA 90210",
    email: "admissions@shreehs-college.edu",
  });

  // ── Student Admission Form ───────────────────────────────────────────────
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    className: "Class 1",
    section: "A",
    tuition: 35000,
    transport: 5000,
    hostel: 10000,
    password: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
  });

  // ── Teacher Registration Form ────────────────────────────────────────────
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    designation: "Senior Lecturer",
    subject: "Mathematics",
    salary: 45050,
    bankDetails: "",
    password: "",
    className: "Class 10",
    section: "A",
  });

  // ── Cash Payment & Fee Breakdown ─────────────────────────────────────────
  const [selectedStudentForCash, setSelectedStudentForCash] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashMessage, setCashMessage] = useState("");

  const [selectedStudentForBreakdown, setSelectedStudentForBreakdown] =
    useState("");
  const [breakdownForm, setBreakdownForm] = useState({
    monthlyTuition: "",
    yearlyTerm: "",
    extraCharges: "",
  });

  // ── Teacher Salary Control ───────────────────────────────────────────────
  const [selectedTeacherForSalary, setSelectedTeacherForSalary] = useState("");
  const [salaryControlForm, setSalaryControlForm] = useState({
    base: "",
    allowances: "",
    deductions: "",
  });

  // ── Notice & Exam Forms ──────────────────────────────────────────────────
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    audience: "All",
  });
  const [examForm, setExamForm] = useState({
    examName: "Mid-Term",
    subject: "Mathematics",
    examDate: "2026-07-10",
  });

  // ── Notification Toast (सफलता/त्रुटि संदेश) ──────────────────────────────
  const [notification, setNotification] = useState({ message: "", type: "" });

  // ── Filtered Students (खोज + फ़िल्टर) ───────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const rollMatch = String(s.rollNo || "")
      .toLowerCase()
      .includes(term);
    const phoneMatch =
      String(s.fatherMobile || "")
        .toLowerCase()
        .includes(term) ||
      String(s.motherMobile || "")
        .toLowerCase()
        .includes(term);
    const classMatch = classFilter === "All" || s.class === classFilter;
    return (nameMatch || rollMatch || phoneMatch) && classMatch;
  });

  // ── Directory Filter ─────────────────────────────────────────────────────
  const directoryStudents = students.filter((s) => {
    const term = dirSearchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const rollMatch = String(s.rollNo || "")
      .toLowerCase()
      .includes(term);
    const classMatch = dirClassFilter === "All" || s.class === dirClassFilter;
    return (nameMatch || rollMatch) && classMatch;
  });

  // ═════════════════════════════════════════════════════════════════════════
  //  NOTIFICATION SYSTEM (सूचना प्रणाली)
  // ═════════════════════════════════════════════════════════════════════════
  const triggerNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  DATA FETCHING (डेटा लोड करना)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * applyData - Firebase/mockDb से मिले डेटा को state में सेट करता है
   * और स्टैट्स की गणना करता है
   */
  const applyData = useCallback((studs, tchs, nots, lvs, payments, sals) => {
    const adjustedStudents = studs.map((s) => {
      if (!s.fees) return s;
      const total = computeTotalFees(s.fees.breakdown);
      return {
        ...s,
        fees: {
          ...s.fees,
          breakdown: s.fees.breakdown || {
            monthlyTuition: 3000,
            yearlyTerm: 10000,
            extraCharges: 4000,
          },
          total,
          balance: Math.max(0, total - Number(s.fees.paid || 0)),
        },
      };
    });

    const sortedStudents = [...adjustedStudents].sort((a, b) =>
      String(a.rollNo).localeCompare(String(b.rollNo)),
    );
    setStudents(sortedStudents);
    setTeachers(tchs);
    setNotices(nots);
    setLeaveRequests(lvs);
    setFeePaymentRequests(payments);
    setSalarySlips(sals);

    const collected = adjustedStudents.reduce(
      (s, st) => s + (Number(st.fees?.paid) || 0),
      0,
    );
    const pending = adjustedStudents.reduce(
      (s, st) => s + (Number(st.fees?.balance) || 0),
      0,
    );
    const absent = tchs.filter(
      (t) => t.status === "Absent" || t.status === "Half-Day",
    ).length;

    setStats({
      attendanceRate: 84,
      teachersOnLeave: `${absent}/${tchs.length || 0}`,
      collectedFees: `₹${collected.toLocaleString("en-IN")}`,
      pendingFees: `₹${pending.toLocaleString("en-IN")}`,
      alertsCount: lvs.filter((l) => l.status === "Pending").length + 2,
    });
  }, []);

  /**
   * fetchData - Firebase से डेटा लाता है, फेल होने पर localStorage से लोड करता है
   */
  const fetchData = useCallback(async () => {
    try {
      const [studSnap, tchSnap, notSnap, lvSnap, paySnap, salSnap] =
        await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "teachers")),
          getDocs(collection(db, "notices")),
          getDocs(collection(db, "leaveRequests")),
          getDocs(collection(db, "feePaymentRequests")),
          getDocs(collection(db, "salarySlips")),
        ]);

      applyData(
        studSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        tchSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        notSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        lvSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        paySnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        salSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      );
    } catch (err) {
      // Firebase unavailable → localStorage से लोड करें
      const mockDb = getMockDb();
      applyData(
        mockDb.students,
        mockDb.teachers,
        mockDb.notices,
        mockDb.leaveRequests,
        mockDb.feePaymentRequests || [],
        mockDb.salarySlips,
      );
      const key = `${timetableClass}_${timetableSection}`;
      setClassTimetable(
        mockDb.timetables?.[key] ?? mockDb.timetables?.[timetableClass] ?? [],
      );
      setExamsList(mockDb.exams || []);
      import("../../utils/logger").then(({ error }) =>
        error("Admin fetchData failed", err),
      );
    }
  }, [applyData, timetableClass, timetableSection]);

  // पहली बार डेटा लोड करें
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // टाइमटेबल क्लास/सेक्शन बदलने पर रीलोड
  useEffect(() => {
    const mockDb = getMockDb();
    const key = `${timetableClass}_${timetableSection}`;
    setClassTimetable(
      mockDb.timetables?.[key] ?? mockDb.timetables?.[timetableClass] ?? [],
    );
  }, [timetableClass, timetableSection]);

  // ═════════════════════════════════════════════════════════════════════════
  //  STUDENT MANAGEMENT (स्टूडेंट प्रबंधन)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * handleAdmitStudent - नए स्टूडेंट को एडमिट करता है
   * 1. फॉर्म वैलिडेशन
   * 2. रोल नंबर ऑटो-जनरेट
   * 3. localStorage + Firebase में सेव
   * 4. क्रेडेंशियल मोडल दिखाए
   */
  const handleAdmitStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email) {
      triggerNotification("Name and email are required.", "error");
      return;
    }
    if (!isValidEmail(studentForm.email)) {
      triggerNotification("Enter a valid email address.", "error");
      return;
    }

    const mockDb = getMockDb();
    const rollNo = generateRollNo(
      studentForm.className,
      studentForm.section,
      mockDb.students,
    );
    const totalFees =
      Number(studentForm.tuition) +
      Number(studentForm.transport) +
      Number(studentForm.hostel);
    const sId = generateId("std");
    const password =
      studentForm.password ||
      "Pass@" + rollNo.split("-").join("").substring(0, 4);

    const newStudent = {
      id: sId,
      name: studentForm.name,
      email: studentForm.email,
      class: studentForm.className,
      section: studentForm.section,
      rollNo,
      overallAttendance: 100,
      fees: {
        total: totalFees,
        paid: 0,
        balance: totalFees,
        dueDate: "2026-06-30",
      },
      attendanceHistory: [],
      marks: [],
      fatherName: studentForm.fatherName || "",
      fatherMobile: studentForm.fatherMobile || "",
      motherName: studentForm.motherName || "",
      motherMobile: studentForm.motherMobile || "",
      aadharNo: "",
      address: "",
      bloodGroup: "",
      dob: "",
      gender: "",
    };

    mockDb.students.push(newStudent);
    mockDb.students.sort((a, b) =>
      String(a.rollNo).localeCompare(String(b.rollNo)),
    );
    saveMockDb(mockDb);

    // Firebase Auth यूज़र बनाने की कोशिश
    let userUid = sId;
    try {
      const authResult = await adminCreateUser(studentForm.email, password);
      if (authResult?.user?.uid) {
        userUid = authResult.user.uid;
        await setDoc(doc(db, "students", sId), newStudent);
        await setDoc(doc(db, "users", userUid), {
          uid: userUid,
          name: studentForm.name,
          email: studentForm.email,
          role: "parent",
          studentId: sId,
        });
      }
    } catch {
      try {
        await setDoc(doc(db, "students", sId), newStudent);
        await setDoc(doc(db, "users", sId), {
          uid: sId,
          name: studentForm.name,
          email: studentForm.email,
          role: "parent",
          studentId: sId,
        });
      } catch {
        /* silent fail */
      }
    }

    if (!mockDb.users) mockDb.users = {};
    mockDb.users[userUid] = {
      uid: userUid,
      email: studentForm.email,
      name: studentForm.name,
      role: "parent",
      studentId: sId,
      password,
    };
    saveMockDb(mockDb);

    setCredentialsData({
      type: "student",
      name: studentForm.name,
      email: studentForm.email,
      rollNo,
      password,
      userId: sId,
    });
    setShowCredentialsModal(true);
    triggerNotification(
      `Student ${studentForm.name} admitted! Roll No: ${rollNo}`,
    );
    setStudentForm({
      name: "",
      email: "",
      className: "Class 1",
      section: "A",
      tuition: 35000,
      transport: 5000,
      hostel: 10000,
      password: "",
      fatherName: "",
      fatherMobile: "",
      motherName: "",
      motherMobile: "",
    });
    fetchData();
  };

  /** handlePromoteClass - स्टूडेंट को अगली क्लास में भेजता है */
  const handlePromoteClass = (studentId) => {
    const mockDb = getMockDb();
    const idx = mockDb.students.findIndex((s) => s.id === studentId);
    if (idx === -1) return;
    const currentClass = mockDb.students[idx].class;
    const nextClass = NEXT_CLASS_MAP[currentClass];
    if (!nextClass || nextClass === "Passed Out") {
      triggerNotification(
        nextClass === "Passed Out"
          ? "Student has completed Class 12."
          : "Next class not found.",
        "error",
      );
      return;
    }
    const newRoll = generateRollNo(
      nextClass,
      mockDb.students[idx].section,
      mockDb.students,
    );
    mockDb.students[idx].class = nextClass;
    mockDb.students[idx].rollNo = newRoll;
    mockDb.students.sort((a, b) =>
      String(a.rollNo).localeCompare(String(b.rollNo)),
    );
    saveMockDb(mockDb);
    triggerNotification(`Promoted to ${nextClass}! New Roll No: ${newRoll}`);
    fetchData();
  };

  /** handleIssueTC - Transfer Certificate जारी करता है (स्टूडेंट हटा देता है) */
  const handleIssueTC = (studentId) => {
    const mockDb = getMockDb();
    mockDb.students = mockDb.students.filter((s) => s.id !== studentId);
    saveMockDb(mockDb);
    triggerNotification(
      "Transfer Certificate issued. Student removed from roster.",
    );
    fetchData();
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  TEACHER MANAGEMENT (टीचर प्रबंधन)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * handleAddTeacher - नए टीचर को रजिस्टर करता है
   * स्टूडेंट एडमिशन जैसा ही फ्लो
   */
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) {
      triggerNotification("Teacher name and email required.", "error");
      return;
    }
    if (!isValidEmail(teacherForm.email)) {
      triggerNotification("Enter a valid email address.", "error");
      return;
    }

    const tId = generateId("tch");
    const password =
      teacherForm.password ||
      "Pass@" + teacherForm.name.substring(0, 4).toUpperCase();

    const newTeacher = {
      id: tId,
      name: teacherForm.name,
      email: teacherForm.email,
      designation: teacherForm.designation,
      subject: teacherForm.subject,
      salary: Number(teacherForm.salary),
      bankDetails: teacherForm.bankDetails,
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Present",
      checkIn: "08:30 AM",
      remarks: "Active Duty",
      syllabusCompletion: 0,
      class: teacherForm.className,
      section: teacherForm.section,
    };

    const mockDb = getMockDb();
    mockDb.teachers.push(newTeacher);

    let userUid = tId;
    try {
      const authResult = await adminCreateUser(teacherForm.email, password);
      if (authResult?.user?.uid) {
        userUid = authResult.user.uid;
        await setDoc(doc(db, "teachers", tId), newTeacher);
        await setDoc(doc(db, "users", userUid), {
          uid: userUid,
          name: teacherForm.name,
          email: teacherForm.email,
          role: "teacher",
          teacherId: tId,
        });
      }
    } catch {
      try {
        await setDoc(doc(db, "teachers", tId), newTeacher);
        await setDoc(doc(db, "users", tId), {
          uid: tId,
          name: teacherForm.name,
          email: teacherForm.email,
          role: "teacher",
          teacherId: tId,
        });
      } catch {
        /* silent */
      }
    }

    if (!mockDb.users) mockDb.users = {};
    mockDb.users[userUid] = {
      uid: userUid,
      email: teacherForm.email,
      name: teacherForm.name,
      role: "teacher",
      teacherId: tId,
      password,
    };
    saveMockDb(mockDb);

    setCredentialsData({
      type: "teacher",
      name: teacherForm.name,
      email: teacherForm.email,
      subject: teacherForm.subject,
      password,
      userId: tId,
    });
    setShowCredentialsModal(true);
    triggerNotification(`Teacher ${teacherForm.name} registered successfully!`);
    setTeacherForm({
      name: "",
      email: "",
      designation: "Senior Lecturer",
      subject: "Mathematics",
      salary: 45050,
      bankDetails: "",
      password: "",
      className: "Class 10",
      section: "A",
    });
    fetchData();
  };

  /** टीचर का क्लास/सेक्शन बदलना */
  const handleTeacherClassSectionChange = async (teacherId, field, value) => {
    const mockDb = getMockDb();
    const idx = mockDb.teachers.findIndex((t) => t.id === teacherId);
    if (idx > -1) {
      mockDb.teachers[idx][field] = value;
      saveMockDb(mockDb);
      try {
        await setDoc(doc(db, "teachers", teacherId), mockDb.teachers[idx]);
      } catch {}
      triggerNotification("Teacher assignment updated!");
      fetchData();
    }
  };

  /** टीचर अटेंडेंस बदलना */
  const handleTeacherAttendanceChange = (teacherId, field, value) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== teacherId) return t;
        const updated = { ...t, [field]: value };
        const mockDb = getMockDb();
        const idx = mockDb.teachers.findIndex((item) => item.id === teacherId);
        if (idx > -1) {
          mockDb.teachers[idx][field] = value;
          saveMockDb(mockDb);
        }
        return updated;
      }),
    );
  };

  const handleSyncAttendance = () =>
    triggerNotification(
      "Daily staff attendance synchronized with monthly payroll ledger.",
    );

  // ═════════════════════════════════════════════════════════════════════════
  //  TIMETABLE MANAGEMENT (टाइमटेबल प्रबंधन)
  // ═════════════════════════════════════════════════════════════════════════

  const PERIOD_SLOTS_MAP = {
    "1st": 1,
    "2nd": 2,
    "3rd": 3,
    "4th": 4,
    "5th": 5,
    "6th": 6,
    "7th": 7,
  };
  const DAY_ORDER_MAP = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  /** नया पीरियड जोड़ना / एडिट करना */
  const handleAddTimetablePeriod = (e) => {
    e.preventDefault();
    const conflictFound = classTimetable.find(
      (c) =>
        c.day === timetableForm.day &&
        c.period === timetableForm.period &&
        !(
          editingBlock &&
          editingBlock.day === c.day &&
          editingBlock.period === c.period
        ),
    );
    if (conflictFound) {
      triggerNotification(
        `Conflict! ${timetableForm.day} ${timetableForm.period} already assigned.`,
        "error",
      );
      return;
    }

    // टीचर टकराव की जाँच
    const mockDb = getMockDb();
    const assignedTeacher = timetableForm.teacherName;
    if (assignedTeacher && assignedTeacher !== "Not Assigned") {
      const timetables = mockDb.timetables || {};
      const currentKey = `${timetableForm.className}_${timetableForm.section}`;
      for (const [classKey, schedule] of Object.entries(timetables)) {
        if (classKey === currentKey || classKey === timetableForm.className)
          continue;
        const conflict = schedule.find(
          (c) =>
            c.day === timetableForm.day &&
            c.period === timetableForm.period &&
            c.teacherName === assignedTeacher,
        );
        if (conflict) {
          triggerNotification(
            `Teacher Conflict! ${assignedTeacher} already teaches ${classKey} on ${timetableForm.day} ${timetableForm.period}.`,
            "error",
          );
          return;
        }
      }
    }

    const slotNum = PERIOD_SLOTS_MAP[timetableForm.period] || 1;
    const computedTime = getPeriodTime(
      timetableForm.period,
      timetableStartHour,
      timetablePeriodDuration,
    );
    const newPeriod = {
      day: timetableForm.day,
      period: timetableForm.period,
      slot: slotNum,
      time: computedTime,
      subject: timetableForm.subject,
      teacherName: timetableForm.teacherName || "Not Assigned",
    };

    let baseTimetable = editingBlock
      ? classTimetable.filter(
          (c) =>
            !(c.day === editingBlock.day && c.period === editingBlock.period),
        )
      : classTimetable;

    const updated = [...baseTimetable, newPeriod].sort((a, b) => {
      const dDiff = (DAY_ORDER_MAP[a.day] || 0) - (DAY_ORDER_MAP[b.day] || 0);
      return dDiff !== 0 ? dDiff : a.slot - b.slot;
    });

    setClassTimetable(updated);
    setEditingBlock(null);
    if (!mockDb.timetables) mockDb.timetables = {};
    const key = `${timetableForm.className}_${timetableForm.section}`;
    mockDb.timetables[key] = updated;
    mockDb.timetables[timetableForm.className] = updated;
    saveMockDb(mockDb);
    triggerNotification(
      editingBlock ? "Timetable entry updated!" : "Timetable entry saved!",
    );
  };

  /** Monday का शेड्यूल दूसरे दिनों में कॉपी करना */
  const handleCopyMondaySchedule = () => {
    const mondayPeriods = classTimetable.filter((t) => t.day === "Monday");
    if (mondayPeriods.length === 0) {
      triggerNotification("No periods scheduled for Monday to copy!", "error");
      return;
    }
    const otherDays = [
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const mockDb = getMockDb();
    const timetables = mockDb.timetables || {};
    const currentKey = `${timetableClass}_${timetableSection}`;

    // टीचर टकराव जाँच
    for (const day of otherDays) {
      for (const mp of mondayPeriods) {
        if (mp.teacherName && mp.teacherName !== "Not Assigned") {
          for (const [classKey, schedule] of Object.entries(timetables)) {
            if (classKey === currentKey || classKey === timetableClass)
              continue;
            if (
              schedule.find(
                (c) =>
                  c.day === day &&
                  c.period === mp.period &&
                  c.teacherName === mp.teacherName,
              )
            ) {
              triggerNotification(
                `Teacher Conflict! ${mp.teacherName} already teaches ${classKey} on ${day} ${mp.period}.`,
                "error",
              );
              return;
            }
          }
        }
      }
    }

    let updated = [...mondayPeriods];
    otherDays.forEach((day) => {
      mondayPeriods.forEach((mp) => {
        updated.push({
          ...mp,
          day,
          time: getPeriodTime(
            mp.period,
            timetableStartHour,
            timetablePeriodDuration,
          ),
        });
      });
    });
    updated.sort((a, b) => {
      const dDiff = (DAY_ORDER_MAP[a.day] || 0) - (DAY_ORDER_MAP[b.day] || 0);
      return dDiff !== 0 ? dDiff : a.slot - b.slot;
    });
    setClassTimetable(updated);
    if (!mockDb.timetables) mockDb.timetables = {};
    mockDb.timetables[currentKey] = updated;
    mockDb.timetables[timetableClass] = updated;
    saveMockDb(mockDb);
    triggerNotification("Monday's schedule copied to Tuesday - Saturday!");
  };

  /** पीरियड डिलीट करना */
  const handleDeleteTimetablePeriod = (day, periodSlot) => {
    const updated = classTimetable.filter(
      (c) => !(c.day === day && c.period === periodSlot),
    );
    setClassTimetable(updated);
    const mockDb = getMockDb();
    if (!mockDb.timetables) mockDb.timetables = {};
    const key = `${timetableClass}_${timetableSection}`;
    mockDb.timetables[key] = updated;
    mockDb.timetables[timetableClass] = updated;
    saveMockDb(mockDb);
    triggerNotification(`Deleted ${day} ${periodSlot} period!`);
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  LEAVE & FEE APPROVALS (अनुमति और फीस स्वीकृति)
  // ═════════════════════════════════════════════════════════════════════════

  /** छुट्टी स्वीकृत/अस्वीकृत */
  const handleLeaveDecision = (id, decision) => {
    const mockDb = getMockDb();
    const idx = mockDb.leaveRequests.findIndex((r) => r.id === id);
    if (idx > -1) {
      mockDb.leaveRequests[idx].status = decision;
      saveMockDb(mockDb);
    }
    triggerNotification(`Leave ${decision}.`);
    fetchData();
  };

  /** फीस भुगतान अनुरोध स्वीकृत/अस्वीकृत */
  const handlePaymentRequestDecision = async (
    reqId,
    decision,
    amountPaid,
    studentId,
  ) => {
    const mockDb = getMockDb();
    const pIdx = (mockDb.feePaymentRequests || []).findIndex(
      (p) => p.id === reqId,
    );
    if (pIdx > -1) {
      mockDb.feePaymentRequests[pIdx].status = decision;
      mockDb.feePaymentRequests[pIdx].processedAt = new Date().toISOString();
      mockDb.feePaymentRequests[pIdx].processedBy = userData?.name || "Admin";
    }
    if (decision === "Approved") {
      const sIdx = mockDb.students.findIndex((s) => s.id === studentId);
      if (sIdx > -1) {
        mockDb.students[sIdx].fees.paid =
          (Number(mockDb.students[sIdx].fees.paid) || 0) + Number(amountPaid);
        mockDb.students[sIdx].fees.balance = Math.max(
          0,
          mockDb.students[sIdx].fees.total - mockDb.students[sIdx].fees.paid,
        );
        saveMockDb(mockDb);
        try {
          await updateDoc(doc(db, "students", studentId), {
            fees: mockDb.students[sIdx].fees,
          });
        } catch {}
      }
    } else {
      saveMockDb(mockDb);
    }
    try {
      await updateDoc(doc(db, "feePaymentRequests", reqId), {
        status: decision,
        processedAt: new Date().toISOString(),
        processedBy: userData?.name || "Admin",
      });
    } catch {}
    triggerNotification(`Payment request ${decision}.`);
    fetchData();
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  CASH PAYMENT & FEE BREAKDOWN (नकद भुगतान और फीस संरचना)
  // ═════════════════════════════════════════════════════════════════════════

  /** नकद भुगतान रिकॉर्ड करना */
  const handleRecordCashPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentForCash) {
      triggerNotification("Please select a student.", "error");
      return;
    }
    const amt = Number(cashAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerNotification("Enter a valid cash amount.", "error");
      return;
    }

    const mockDb = getMockDb();
    const student = mockDb.students.find(
      (s) => s.id === selectedStudentForCash,
    );
    if (!student) {
      triggerNotification("Student not found.", "error");
      return;
    }

    const txnId = generateTxnId();
    const newRequest = {
      id: generateId("csh"),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      amountPaid: amt,
      paymentDate: new Date().toISOString().split("T")[0],
      transactionId: txnId,
      paymentMode: "CASH",
      message: cashMessage || "Direct cash payment received by Admin.",
      status: "Approved",
      processedAt: new Date().toISOString(),
      processedBy: userData?.name || "Admin",
    };
    student.fees.paid = (Number(student.fees.paid) || 0) + amt;
    student.fees.balance = Math.max(0, student.fees.total - student.fees.paid);
    mockDb.feePaymentRequests = mockDb.feePaymentRequests || [];
    mockDb.feePaymentRequests.push(newRequest);
    saveMockDb(mockDb);
    try {
      await addDoc(collection(db, "feePaymentRequests"), newRequest);
      await updateDoc(doc(db, "students", student.id), { fees: student.fees });
    } catch {}
    triggerNotification(
      `Cash payment of ₹${amt.toLocaleString()} recorded for ${student.name}!`,
    );
    setCashAmount("");
    setCashMessage("");
    setSelectedStudentForCash("");
    fetchData();
  };

  /** फीस ब्रेकडाउन अपडेट करना */
  const handleUpdateBreakdown = async (e) => {
    e.preventDefault();
    if (!selectedStudentForBreakdown) {
      triggerNotification("Please select a student.", "error");
      return;
    }
    const mTuition = Number(breakdownForm.monthlyTuition) || 0;
    const yTerm = Number(breakdownForm.yearlyTerm) || 0;
    const eCharges = Number(breakdownForm.extraCharges) || 0;
    const mockDb = getMockDb();
    const sIdx = mockDb.students.findIndex(
      (s) => s.id === selectedStudentForBreakdown,
    );
    if (sIdx > -1) {
      const student = mockDb.students[sIdx];
      student.fees.breakdown = {
        monthlyTuition: mTuition,
        yearlyTerm: yTerm,
        extraCharges: eCharges,
      };
      const total = mTuition * 12 + yTerm + eCharges;
      student.fees.total = total;
      student.fees.balance = Math.max(
        0,
        total - Number(student.fees.paid || 0),
      );
      saveMockDb(mockDb);
      try {
        await updateDoc(doc(db, "students", student.id), {
          fees: student.fees,
        });
      } catch {}
      triggerNotification(`Fee breakdown updated for ${student.name}!`);
      setSelectedStudentForBreakdown("");
      setBreakdownForm({
        monthlyTuition: "",
        yearlyTerm: "",
        extraCharges: "",
      });
      fetchData();
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  SALARY MANAGEMENT (वेतन प्रबंधन)
  // ═════════════════════════════════════════════════════════════════════════

  /** सामान्य वेतन भुगतान */
  const handleDisburseSalary = async (teacher) => {
    const basePay = teacher.salary || 45000;
    const deductions =
      teacher.status === "Absent" ? Math.round(basePay / 30) : 0;
    const slip = {
      id: generateId("sal"),
      teacherId: teacher.id,
      month: "June 2026",
      base: basePay,
      deductions,
      net: basePay - deductions,
      status: "Paid",
    };
    const mockDb = getMockDb();
    mockDb.salarySlips.push(slip);
    saveMockDb(mockDb);
    try {
      await addDoc(collection(db, "salarySlips"), slip);
    } catch {}
    triggerNotification(`Salary disbursed to ${teacher.name}!`);
    fetchData();
  };

  /** कस्टम वेतन भुगतान (अलाउंस/डिडक्शन के साथ) */
  const handleDisburseCustomSalary = async (teacher) => {
    const basePay =
      Number(salaryControlForm.base) ||
      teacher.salaryDetails?.base ||
      teacher.salary ||
      40000;
    const allowances =
      Number(salaryControlForm.allowances) ||
      teacher.salaryDetails?.allowances ||
      0;
    const deductions =
      Number(salaryControlForm.deductions) ||
      teacher.salaryDetails?.deductions ||
      0;
    const netPay = basePay + allowances - deductions;
    const slip = {
      id: generateId("sal"),
      teacherId: teacher.id,
      month: "June 2026",
      base: basePay,
      allowances,
      deductions,
      net: netPay,
      status: "Paid",
    };
    const mockDb = getMockDb();
    mockDb.salarySlips.push(slip);
    const tIdx = mockDb.teachers.findIndex((t) => t.id === teacher.id);
    if (tIdx > -1) {
      mockDb.teachers[tIdx].salaryDetails = {
        base: basePay,
        allowances,
        deductions,
        net: netPay,
      };
      mockDb.teachers[tIdx].salary = netPay;
    }
    saveMockDb(mockDb);
    try {
      await addDoc(collection(db, "salarySlips"), slip);
      await updateDoc(doc(db, "teachers", teacher.id), {
        salary: netPay,
        salaryDetails: { base: basePay, allowances, deductions, net: netPay },
      });
    } catch {}
    triggerNotification(
      `Custom Salary disbursed to ${teacher.name}! Net: ₹${netPay}`,
    );
    setSelectedTeacherForSalary("");
    setSalaryControlForm({ base: "", allowances: "", deductions: "" });
    fetchData();
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  NOTICE & EXAM (नोटिस और परीक्षा)
  // ═════════════════════════════════════════════════════════════════════════

  /** नया नोटिस जोड़ना */
  const handleAddNotice = async (e) => {
    e.preventDefault();
    const newNotice = {
      id: generateId("ntc"),
      title: noticeForm.title,
      content: noticeForm.content,
      audience: noticeForm.audience,
      date: new Date().toISOString().split("T")[0],
    };
    const mockDb = getMockDb();
    mockDb.notices.push(newNotice);
    saveMockDb(mockDb);
    try {
      await addDoc(collection(db, "notices"), newNotice);
    } catch {}
    triggerNotification(`Notice sent to: ${noticeForm.audience}`);
    setNoticeForm({ title: "", content: "", audience: "All" });
    fetchData();
  };

  /** नई परीक्षा जोड़ना */
  const handleAddExam = (e) => {
    e.preventDefault();
    const newExam = {
      id: generateId("ex"),
      examName: examForm.examName,
      subject: examForm.subject,
      date: examForm.examDate,
    };
    const mockDb = getMockDb();
    mockDb.exams = [...(mockDb.exams || []), newExam];
    saveMockDb(mockDb);
    setExamsList(mockDb.exams);
    triggerNotification("Exam scheduled and saved!");
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS / ALERTS (सूचनाएँ)
  // ═════════════════════════════════════════════════════════════════════════

  /** अभिभावकों को रिमाइंडर भेजना */
  const handleSendReminder = (name) => {
    const t = new Date().toLocaleTimeString();
    const sms = settingsAlerts.sms ? "SMS Queued" : "SMS Disabled";
    const email = settingsAlerts.email ? "Email Queued" : "Email Disabled";
    setSimulatedLogs((prev) => [
      `[${t}] ALERT → ${name}'s parents. [${sms}] [${email}]`,
      ...prev,
    ]);
    triggerNotification(`Reminder dispatched for ${name}'s parents.`);
  };

  /** टेस्ट नोटिफिकेशन */
  const handleSendTestNotification = () => {
    const t = new Date().toLocaleTimeString();
    setSimulatedLogs((prev) => [
      `[${t}] TEST → SMS:[${settingsAlerts.sms ? "OK" : "OFF"}] Email:[${settingsAlerts.email ? "OK" : "OFF"}] WhatsApp:[${settingsAlerts.whatsapp ? "OK" : "OFF"}]`,
      ...prev,
    ]);
    triggerNotification("Test notification sent through all enabled channels!");
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  RETURN VALUES (हुक से बाहर भेजने वाले सभी मान)
  // ═════════════════════════════════════════════════════════════════════════

  return {
    // Auth
    userData,
    logout,
    // Navigation
    activeTab,
    setActiveTab,
    // Data
    students,
    teachers,
    notices,
    leaveRequests,
    feePaymentRequests,
    salarySlips,
    examsList,
    filteredStudents,
    directoryStudents,
    // Stats
    stats,
    setStats,
    // Search
    searchTerm,
    setSearchTerm,
    classFilter,
    setClassFilter,
    dirSearchTerm,
    setDirSearchTerm,
    dirClassFilter,
    setDirClassFilter,
    // Settings
    settingsAlerts,
    setSettingsAlerts,
    simulatedLogs,
    // Modals
    selectedStudentForAttendance,
    setSelectedStudentForAttendance,
    selectedStudentForModal,
    setSelectedStudentForModal,
    showCredentialsModal,
    setShowCredentialsModal,
    credentialsData,
    // Timetable
    timetableForm,
    setTimetableForm,
    classTimetable,
    setClassTimetable,
    timetableClass,
    setTimetableClass,
    timetableSection,
    setTimetableSection,
    timetableStartHour,
    setTimetableStartHour,
    timetablePeriodDuration,
    setTimetablePeriodDuration,
    editingBlock,
    setEditingBlock,
    // School Info
    schoolInfo,
    // Forms
    studentForm,
    setStudentForm,
    teacherForm,
    setTeacherForm,
    selectedStudentForCash,
    setSelectedStudentForCash,
    cashAmount,
    setCashAmount,
    cashMessage,
    setCashMessage,
    selectedStudentForBreakdown,
    setSelectedStudentForBreakdown,
    breakdownForm,
    setBreakdownForm,
    selectedTeacherForSalary,
    setSelectedTeacherForSalary,
    salaryControlForm,
    setSalaryControlForm,
    noticeForm,
    setNoticeForm,
    examForm,
    setExamForm,
    notification,
    triggerNotification,
    // Handlers
    handleAdmitStudent,
    handlePromoteClass,
    handleIssueTC,
    handleAddTeacher,
    handleTeacherClassSectionChange,
    handleTeacherAttendanceChange,
    handleSyncAttendance,
    handleAddTimetablePeriod,
    handleCopyMondaySchedule,
    handleDeleteTimetablePeriod,
    handleLeaveDecision,
    handlePaymentRequestDecision,
    handleRecordCashPayment,
    handleUpdateBreakdown,
    handleDisburseSalary,
    handleDisburseCustomSalary,
    handleAddNotice,
    handleAddExam,
    handleSendReminder,
    handleSendTestNotification,
    // Fetch
    fetchData,
  };
};
