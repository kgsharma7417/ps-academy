// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/StudentInfoTab.jsx
// 📝 स्टूडेंट डायरेक्टरी - सारे स्टूडेंट्स की पूरी जानकारी टेबल में दिखाता है
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Search } from "lucide-react";
import { ALL_CLASSES } from "../constants";

/**
 * StudentInfoTab - स्टूडेंट डायरेक्टरी टैब
 * इसमें रोल नंबर, नाम, क्लास, DOB, आधार, पिता/माता जानकारी, ब्लड ग्रुप, पता
 * सब कुछ एक टेबल में दिखता है। सर्च और फिल्टर भी है।
 */
const StudentInfoTab = ({
  students,
  dirSearchTerm,
  setDirSearchTerm,
  dirClassFilter,
  setDirClassFilter,
  setSelectedStudentForModal,
}) => {
  // ── डायरेक्टरी फिल्टर (क्लास + सर्च टर्म से छानना) ──
  const filtered = students.filter((s) => {
    const term = dirSearchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const rollMatch = String(s.rollNo || "")
      .toLowerCase()
      .includes(term);
    const classMatch = dirClassFilter === "All" || s.class === dirClassFilter;
    return (nameMatch || rollMatch) && classMatch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* ── हेडर: टाइटल + सर्च + फिल्टर ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">
            Student Personal Profiles Directory
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            सभी रजिस्टर्ड स्टूडेंट्स की पर्सनल जानकारी देखें और मैनेज करें।
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {/* क्लास फिल्टर ड्रॉपडाउन */}
          <select
            value={dirClassFilter}
            onChange={(e) => setDirClassFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none font-semibold text-slate-600"
          >
            <option value="All">All Classes</option>
            {ALL_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {/* सर्च इनपुट */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="नाम, रोल या आधार से खोजें..."
              value={dirSearchTerm}
              onChange={(e) => setDirSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── खाली स्टेट: जब कोई स्टूडेंट नहीं मिला ── */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-xs">
          कोई स्टूडेंट प्रोफाइल नहीं मिला।
        </p>
      ) : (
        /* ── स्टूडेंट टेबल ── */
        <div className="overflow-x-auto rounded-2xl border border-slate-150 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class/Sec</th>
                <th className="p-3">DOB / Gender</th>
                <th className="p-3">Aadhar Card</th>
                <th className="p-3">Father's Info</th>
                <th className="p-3">Mother's Info</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-600 font-medium">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedStudentForModal(s)}
                  title="पूरी जानकारी देखने के लिए क्लिक करें"
                >
                  <td className="p-3 font-mono font-bold text-slate-800">
                    {s.rollNo || "-"}
                  </td>
                  <td className="p-3">
                    <span className="font-extrabold text-slate-800 block text-sm">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {s.email}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold text-[10px]">
                      {s.class} - {s.section}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block">{s.dob || "-"}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {s.gender || "-"}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{s.aadharNo || "-"}</td>
                  <td className="p-3">
                    <span className="block font-bold text-slate-700">
                      {s.fatherName || "-"}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {s.fatherMobile || "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block font-bold text-slate-700">
                      {s.motherName || "-"}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {s.motherMobile || "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        s.bloodGroup
                          ? "bg-rose-50 text-rose-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {s.bloodGroup || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 max-w-[150px] truncate" title={s.address}>
                    {s.address || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentInfoTab;
