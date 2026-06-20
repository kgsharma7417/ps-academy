// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/FeesTab.jsx
// 📝 फीस प्रबंधन टैब — Fee Defaulters तालिका, Direct Cash Payment रिकॉर्डिंग और Student Fee Breakdown एडजस्टमेंट
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Send } from "lucide-react";

const FeesTab = ({
  students,
  selectedStudentForCash,
  setSelectedStudentForCash,
  cashAmount,
  setCashAmount,
  cashMessage,
  setCashMessage,
  handleRecordCashPayment,
  selectedStudentForBreakdown,
  setSelectedStudentForBreakdown,
  breakdownForm,
  setBreakdownForm,
  handleUpdateBreakdown,
  handleSendReminder,
}) => {
  return (
    <div className="space-y-8">
      {/* ── Fee Defaulters Table ─────────────────────────────────────────── */}
      {/* यह तालिका उन छात्रों को दिखाती है जिनकी फीस बकाया है */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-6">
          Fee Defaulters
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Name</th>
                <th className="pb-3">Class</th>
                <th className="pb-3">Total Fees</th>
                <th className="pb-3">Outstanding</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {students
                .filter((s) => (s.fees?.balance || 0) > 0)
                .map((student) => (
                  <tr key={student.id}>
                    <td className="py-3.5 font-bold text-slate-800">
                      {student.name}
                    </td>
                    <td className="py-3.5">
                      {student.class} — {student.section}
                    </td>
                    <td className="py-3.5 font-mono">
                      ₹{student.fees?.total.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 font-mono text-rose-600 font-bold">
                      ₹{student.fees?.balance.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleSendReminder(student.name)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg flex items-center gap-1 text-[10px]"
                      >
                        <Send className="w-3 h-3" /> Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              {students.filter((s) => (s.fees?.balance || 0) > 0).length ===
                0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-400"
                  >
                    All accounts are cleared.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TWO COLUMN GRID: Record Cash Payment & Edit Fee Breakdown ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Record Direct Cash Payment ──────────────────────────── */}
        {/* कैश भुगतान दर्ज करने का फॉर्म — सीधे कार्यालय में प्राप्त नकद राशि अपडेट करता है */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-2">
              Record Cash Payment Collection
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Instantly record cash paid directly to the office. This updates
              the student's balance.
            </p>
            <form onSubmit={handleRecordCashPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudentForCash}
                  onChange={(e) => setSelectedStudentForCash(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 outline-none"
                >
                  <option value="">Choose student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNo} | {s.class}-{s.section} | Bal: ₹
                      {s.fees?.balance?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Cash Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Remarks/Message
                  </label>
                  <input
                    type="text"
                    value={cashMessage}
                    onChange={(e) => setCashMessage(e.target.value)}
                    placeholder="Received at desk"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-slate-50 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Submit Cash Payout
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: Edit Student Fee Breakdown ──────────────────────────── */}
        {/* छात्र की फीस संरचना को अनुकूलित करने का फॉर्म — ट्यूशन, टर्म फीस, अतिरिक्त शुल्क */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 mb-2">
              Adjust Student Fee Breakdowns
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Customize tuition, term fees, or misc charges. Total fee updates
              automatically.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Select Student
                </label>
                <select
                  value={selectedStudentForBreakdown}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedStudentForBreakdown(val);
                    const matched = students.find((s) => s.id === val);
                    if (matched) {
                      setBreakdownForm({
                        monthlyTuition:
                          matched.fees?.breakdown?.monthlyTuition || 3000,
                        yearlyTerm:
                          matched.fees?.breakdown?.yearlyTerm || 10000,
                        extraCharges:
                          matched.fees?.breakdown?.extraCharges || 4000,
                      });
                    }
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 outline-none"
                >
                  <option value="">Choose student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNo} | {s.class})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentForBreakdown && (
                <form
                  onSubmit={handleUpdateBreakdown}
                  className="space-y-4 animate-fade-in"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Monthly Tuition (₹)
                      </span>
                      <input
                        type="number"
                        value={breakdownForm.monthlyTuition}
                        onChange={(e) =>
                          setBreakdownForm({
                            ...breakdownForm,
                            monthlyTuition: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Yearly Term (₹)
                      </span>
                      <input
                        type="number"
                        value={breakdownForm.yearlyTerm}
                        onChange={(e) =>
                          setBreakdownForm({
                            ...breakdownForm,
                            yearlyTerm: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Extra Charges (₹)
                      </span>
                      <input
                        type="number"
                        value={breakdownForm.extraCharges}
                        onChange={(e) =>
                          setBreakdownForm({
                            ...breakdownForm,
                            extraCharges: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700">
                    New Total Fees obligation will be:{" "}
                    <span className="font-bold">
                      ₹
                      {(
                        Number(breakdownForm.monthlyTuition) * 12 +
                        Number(breakdownForm.yearlyTerm) +
                        Number(breakdownForm.extraCharges)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Update Fee Structure
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesTab;