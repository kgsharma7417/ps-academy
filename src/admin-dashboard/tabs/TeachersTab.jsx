// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/TeachersTab.jsx
// 📝 टीचर मैनेजमेंट टैब - नए टीचर जोड़ना, उनका क्लास/सेक्शन असाइन करना
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { UserPlus } from "lucide-react";
import { ALL_CLASSES, SECTIONS } from "../constants";

const TeachersTab = ({
  teacherForm,
  setTeacherForm,
  handleAddTeacher,
  teachers,
  handleTeacherClassSectionChange,
}) => {
  return (
    <div className="space-y-8">
      {/* ── टीचर रजिस्ट्रेशन फॉर्म ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-800">
            Register New Teacher
          </h3>
        </div>
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={teacherForm.name}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, name: e.target.value })
              }
              placeholder="Full Name"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none focus:border-indigo-400"
            />
            <input
              value={teacherForm.email}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, email: e.target.value })
              }
              placeholder="Email"
              type="email"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
            <input
              value={teacherForm.password}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, password: e.target.value })
              }
              placeholder="Password (auto)"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={teacherForm.designation}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, designation: e.target.value })
              }
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            >
              <option>Senior Lecturer</option>
              <option>Junior Lecturer</option>
              <option>Assistant Teacher</option>
              <option>Lab Assistant</option>
            </select>
            <select
              value={teacherForm.subject}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, subject: e.target.value })
              }
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            >
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Computer Science</option>
              <option>History</option>
            </select>
            <input
              value={teacherForm.salary}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, salary: e.target.value })
              }
              placeholder="Salary"
              type="number"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={teacherForm.className}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, className: e.target.value })
              }
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={teacherForm.section}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, section: e.target.value })
              }
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
          >
            Register Teacher
          </button>
        </form>
      </div>

      {/* ── टीचर लिस्ट ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-4">
          Faculty Roster
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="p-4 border border-slate-100 rounded-2xl text-xs space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {t.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    {t.designation}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-bold rounded-full">
                  {t.subject}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between text-slate-500">
                  <span>Joined: {t.joiningDate}</span>
                  <span className="font-bold text-slate-800">
                    ₹{t.salary?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-slate-400 font-bold">
                    Class:
                  </span>
                  <select
                    value={t.class || ""}
                    onChange={(e) =>
                      handleTeacherClassSectionChange(
                        t.id,
                        "class",
                        e.target.value,
                      )
                    }
                    className="border border-slate-200 rounded px-2 py-0.5 bg-slate-50 text-[10px]"
                  >
                    <option value="">None</option>
                    {ALL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Sec:
                  </span>
                  <select
                    value={t.section || ""}
                    onChange={(e) =>
                      handleTeacherClassSectionChange(
                        t.id,
                        "section",
                        e.target.value,
                      )
                    }
                    className="border border-slate-200 rounded px-2 py-0.5 bg-slate-50 text-[10px]"
                  >
                    <option value="">None</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="text-center py-8 text-slate-400 text-xs col-span-2">
              No teachers registered yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersTab;
