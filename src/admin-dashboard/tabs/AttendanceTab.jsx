// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/AttendanceTab.jsx
// 📝 अटेंडेंस रिपोर्ट्स - टीचर अटेंडेंस मार्क करना और स्टूडेंट अटेंडेंस हिस्ट्री
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * AttendanceTab - अटेंडेंस टैब
 * दो सेक्शन:
 * 1. टीचर अटेंडेंस मार्क करना (Present/Absent/Half-Day)
 * 2. कम अटेंडेंस वाले स्टूडेंट्स और हिस्ट्री देखना
 */
const AttendanceTab = ({
  teachers,
  students,
  handleTeacherAttendanceChange,
  handleSyncAttendance,
  selectedStudentForAttendance,
  setSelectedStudentForAttendance,
}) => {
  return (
    <div className="space-y-8">
      {/* ── टीचर अटेंडेंस पैनल ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              Teacher Attendance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              प्रिंसिपल का डायरेक्ट स्टाफ अटेंडेंस पैनल
            </p>
          </div>
          <button
            onClick={handleSyncAttendance}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
          >
            Payroll से Sync करें
          </button>
        </div>

        {/* ── खाली स्टेट: जब कोई टीचर नहीं ── */}
        {teachers.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">
            कोई टीचर रजिस्टर्ड नहीं है। पहले Teacher Management में ऐड करें।
          </p>
        ) : (
          /* ── टीचर अटेंडेंस टेबल ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Teacher</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Check-in</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="py-3 font-bold">{teacher.name}</td>
                    <td className="py-3 text-slate-400">{teacher.subject}</td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={teacher.checkIn}
                        onChange={(e) =>
                          handleTeacherAttendanceChange(
                            teacher.id,
                            "checkIn",
                            e.target.value,
                          )
                        }
                        className="border border-slate-200 bg-slate-50 rounded px-2 py-1 font-mono w-24 text-[11px]"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {["Present", "Absent", "Half-Day"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() =>
                              handleTeacherAttendanceChange(
                                teacher.id,
                                "status",
                                opt,
                              )
                            }
                            className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                              teacher.status === opt
                                ? opt === "Present"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : opt === "Absent"
                                    ? "bg-rose-50 border-rose-200 text-rose-600"
                                    : "bg-amber-50 border-amber-200 text-amber-600"
                                : "border-slate-200 text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        value={teacher.remarks}
                        onChange={(e) =>
                          handleTeacherAttendanceChange(
                            teacher.id,
                            "remarks",
                            e.target.value,
                          )
                        }
                        placeholder="Remarks"
                        className="border border-slate-200 bg-slate-50 rounded px-2 py-1 w-36 text-[11px]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── लो अटेंडेंस और हिस्ट्री ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* लो अटेंडेंस वाले स्टूडेंट्स */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-rose-600 mb-4 flex items-center gap-1.5">
            <AlertCircle className="w-5 h-5" /> Low Attendance ({"<"}75%)
          </h3>
          <div className="space-y-3">
            {students
              .filter((s) => (s.overallAttendance || 90) < 75)
              .map((student) => (
                <div
                  key={student.id}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center text-xs"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-800">
                      {student.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {student.class} | Roll: {student.rollNo}
                    </span>
                  </div>
                  <span className="text-sm font-black text-rose-600">
                    {student.overallAttendance}%
                  </span>
                </div>
              ))}
            {students.filter((s) => (s.overallAttendance || 90) < 75).length ===
              0 && (
              <p className="text-center py-8 text-slate-400 text-xs">
                कोई क्रिटिकल लो अटेंडेंस नहीं है।
              </p>
            )}
          </div>
        </div>

        {/* स्टूडेंट अटेंडेंस हिस्ट्री */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-800 mb-4">
            Student Attendance History
          </h3>
          <select
            onChange={(e) =>
              setSelectedStudentForAttendance(
                students.find((s) => s.id === e.target.value) || null,
              )
            }
            value={selectedStudentForAttendance?.id || ""}
            className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs bg-slate-50 outline-none w-full mb-4"
          >
            <option value="">स्टूडेंट चुनें...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Roll: {s.rollNo})
              </option>
            ))}
          </select>
          {selectedStudentForAttendance ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                Overall Attendance:{" "}
                {selectedStudentForAttendance.overallAttendance}%
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto">
                {(selectedStudentForAttendance.attendanceHistory || []).map(
                  (day, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-center text-[10px] font-bold border ${
                        day.status === "Present"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}
                    >
                      <div>{day.date}</div>
                      <div className="text-[8px] uppercase mt-0.5">
                        {day.status}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-slate-400 text-xs">
              हिस्ट्री देखने के लिए स्टूडेंट चुनें।
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;
