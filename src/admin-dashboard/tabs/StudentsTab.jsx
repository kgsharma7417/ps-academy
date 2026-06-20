// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/StudentsTab.jsx
// 📝 स्टूडेंट मैनेजमेंट टैब - नए स्टूडेंट एडमिट करना, प्रमोट करना, TC देना
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Search, PlusCircle } from "lucide-react";
import { ALL_CLASSES, SECTIONS } from "../constants";

const StudentsTab = ({
  studentForm,
  setStudentForm,
  handleAdmitStudent,
  students,
  searchTerm,
  setSearchTerm,
  classFilter,
  setClassFilter,
  filteredStudents,
  handlePromoteClass,
  handleIssueTC,
  setSelectedStudentForModal,
}) => {
  return (
    <div className="space-y-8">
      {/* ── एडमिशन फॉर्म ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-800">
            New Student Admission
          </h3>
        </div>
        <form onSubmit={handleAdmitStudent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm({ ...studentForm, name: e.target.value })
              }
              placeholder="Full Name"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none focus:border-indigo-400"
            />
            <input
              value={studentForm.email}
              onChange={(e) =>
                setStudentForm({ ...studentForm, email: e.target.value })
              }
              placeholder="Email"
              type="email"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none focus:border-indigo-400"
            />
            <input
              value={studentForm.password}
              onChange={(e) =>
                setStudentForm({ ...studentForm, password: e.target.value })
              }
              placeholder="Password (auto)"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none focus:border-indigo-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={studentForm.className}
              onChange={(e) =>
                setStudentForm({ ...studentForm, className: e.target.value })
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
              value={studentForm.section}
              onChange={(e) =>
                setStudentForm({ ...studentForm, section: e.target.value })
              }
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
            <input
              value={studentForm.tuition}
              onChange={(e) =>
                setStudentForm({ ...studentForm, tuition: e.target.value })
              }
              placeholder="Tuition Fee"
              type="number"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={studentForm.fatherName}
              onChange={(e) =>
                setStudentForm({ ...studentForm, fatherName: e.target.value })
              }
              placeholder="Father's Name"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
            <input
              value={studentForm.fatherMobile}
              onChange={(e) =>
                setStudentForm({ ...studentForm, fatherMobile: e.target.value })
              }
              placeholder="Father's Mobile"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
            <input
              value={studentForm.motherMobile}
              onChange={(e) =>
                setStudentForm({ ...studentForm, motherMobile: e.target.value })
              }
              placeholder="Mother's Mobile"
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
          >
            Admit Student
          </button>
        </form>
      </div>

      {/* ── स्टूडेंट लिस्ट ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll, or phone..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs bg-slate-50 outline-none"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
          >
            <option value="All">All Classes</option>
            {ALL_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">
            No students found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Roll</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Class</th>
                  <th className="pb-3">Section</th>
                  <th className="pb-3">Fees</th>
                  <th className="pb-3">Balance</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold font-mono">{s.rollNo}</td>
                    <td className="py-3 font-bold text-slate-800">
                      <button
                        onClick={() => setSelectedStudentForModal(s)}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-3 text-slate-400">{s.class}</td>
                    <td className="py-3">{s.section}</td>
                    <td className="py-3">₹{s.fees?.total?.toLocaleString()}</td>
                    <td className="py-3 font-bold text-rose-500">
                      ₹{s.fees?.balance?.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePromoteClass(s.id)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-lg hover:bg-indigo-100"
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => handleIssueTC(s.id)}
                          className="px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-bold rounded-lg hover:bg-rose-100"
                        >
                          TC
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsTab;
