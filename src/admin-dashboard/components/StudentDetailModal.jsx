// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/StudentDetailModal.jsx
// 📝 स्टूडेंट डिटेल मोडल - किसी स्टूडेंट की पूरी जानकारी दिखाता है
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { X } from "lucide-react";

const StudentDetailModal = ({ student, onClose, onPromote, onIssueTC }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* ── हेडर ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">
              {student.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Roll No: {student.rollNo} | {student.class} - {student.section}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── पर्सनल डिटेल्स ── */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b pb-2">
              Personal Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
              <Detail label="Father's Name" value={student.fatherName} />
              <Detail label="Father's Mobile" value={student.fatherMobile} />
              <Detail label="Mother's Name" value={student.motherName} />
              <Detail label="Mother's Mobile" value={student.motherMobile} />
              <Detail label="Aadhar No" value={student.aadharNo} />
              <Detail label="DOB" value={student.dob} />
              <Detail label="Gender" value={student.gender} />
              <Detail label="Blood Group" value={student.bloodGroup} />
              <div className="col-span-2">
                <Detail label="Address" value={student.address} />
              </div>
            </div>
          </div>

          {/* ── अटेंडेंस ── */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                Attendance Roster
              </h4>
              <span className="text-xs font-black text-indigo-600">
                Overall: {student.overallAttendance || 100}%
              </span>
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {!student.attendanceHistory ||
              student.attendanceHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No attendance marked yet.
                </p>
              ) : (
                student.attendanceHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs bg-white p-2 rounded-xl border border-slate-100"
                  >
                    <span className="font-semibold text-slate-650">
                      {h.date}
                    </span>
                    <span
                      className={`font-bold uppercase ${h.status === "Present" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {h.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── एकेडमिक्स और फीस ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b pb-2">
              Academic Reports
            </h4>
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
              {!student.marks || student.marks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No exams recorded yet.
                </p>
              ) : (
                student.marks.map((m, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-white rounded-xl border border-slate-150 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800">
                        {m.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase">
                        {m.exam}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-800">
                        {m.marksObtained}/{m.maxMarks}
                      </span>
                      <span className="text-[10px] text-indigo-500 font-bold block">
                        {Math.round((m.marksObtained / m.maxMarks) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b pb-2">
              Accounts Ledgers
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Fees
                </span>
                <span className="font-black text-slate-800 text-sm">
                  ₹{student.fees?.total?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Paid Amount
                </span>
                <span className="font-black text-emerald-600 text-sm">
                  ₹{student.fees?.paid?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Pending Balance
                </span>
                <span
                  className={`font-black text-sm ${student.fees?.balance > 0 ? "text-rose-500" : "text-emerald-600"}`}
                >
                  ₹{student.fees?.balance?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Due Date
                </span>
                <span className="font-semibold text-slate-800">
                  {student.fees?.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── एक्शन बटन ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            onClick={() => onPromote(student.id)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
          >
            Promote Class
          </button>
          <button
            onClick={() => {
              onIssueTC(student.id);
              onClose();
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all"
          >
            Issue Transfer Certificate (TC)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Close Card
          </button>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <span className="text-[10px] text-slate-400 font-bold uppercase block">
      {label}
    </span>
    <span className="font-semibold text-slate-800">{value || "N/A"}</span>
  </div>
);

export default StudentDetailModal;
