// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/SalaryTab.jsx
// 📝 वेतन प्रबंधन टैब — Staff Salary Payslips Ledger तालिका और Configure & Disburse Salary पैनल
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";

const SalaryTab = ({
  teachers,
  salarySlips,
  selectedTeacherForSalary,
  setSelectedTeacherForSalary,
  salaryControlForm,
  setSalaryControlForm,
  handleDisburseCustomSalary,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Column 1: Staff Payslips Ledger ──────────────────────────────── */}
      {/* सभी शिक्षकों के वेतन विवरण की तालिका — Base Pay, Allowances, Deductions, Net Payout */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-6">
          Staff Salary Payslips Ledger{" "}
          <span className="text-sm text-slate-400 font-semibold">
            ({salarySlips.length})
          </span>
        </h3>
        {teachers.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-xs">
            No teachers registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Teacher</th>
                  <th className="pb-3">Base Pay</th>
                  <th className="pb-3">Allowances</th>
                  <th className="pb-3">Deductions</th>
                  <th className="pb-3">Net Payout</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {teachers.map((teacher) => {
                  // प्रत्येक शिक्षक के लिए वेतन गणना — base pay, allowances, deductions, net pay
                  const basePay =
                    teacher.salaryDetails?.base || teacher.salary || 40000;
                  const allowances = teacher.salaryDetails?.allowances || 0;
                  const deductions =
                    teacher.status === "Absent"
                      ? Math.round(basePay / 30)
                      : teacher.salaryDetails?.deductions || 0;
                  const netPay = basePay + allowances - deductions;
                  return (
                    <tr key={teacher.id}>
                      <td className="py-3.5 font-bold text-slate-800">
                        {teacher.name}
                      </td>
                      <td className="py-3.5 font-mono">
                        ₹{basePay.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 font-mono text-emerald-600">
                        +₹{allowances.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 font-mono text-rose-500 font-bold">
                        -₹{deductions.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 font-mono text-indigo-650 font-extrabold">
                        ₹{netPay.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            // Configure payout बटन — शिक्षक चुनकर salary control form भरता है
                            setSelectedTeacherForSalary(teacher.id);
                            setSalaryControlForm({
                              base: basePay,
                              allowances: allowances,
                              deductions: deductions,
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-bold rounded-lg text-[10px] transition-all"
                        >
                          Configure Payout
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Column 2: Configure & Disburse Panel ────────────────────────── */}
      {/* वेतन अनुकूलन और भुगतान पैनल — Base Pay, Allowances, Deductions सेट करें और Disburse करें */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
        <h3 className="text-base font-extrabold text-slate-800 mb-2">
          Configure & Disburse Salary
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Select a teacher from the roster to customize base pay, allowances,
          and deductions before disbursing.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Select Faculty
            </label>
            <select
              value={selectedTeacherForSalary}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTeacherForSalary(val);
                const matched = teachers.find((t) => t.id === val);
                if (matched) {
                  // शिक्षक चुनने पर फॉर्म उसके मौजूदा वेतन विवरण से भर जाता है
                  setSalaryControlForm({
                    base: matched.salaryDetails?.base || matched.salary || 40000,
                    allowances: matched.salaryDetails?.allowances || 0,
                    deductions:
                      matched.status === "Absent"
                        ? Math.round(
                            (matched.salaryDetails?.base ||
                              matched.salary ||
                              40000) / 30,
                          )
                        : matched.salaryDetails?.deductions || 0,
                  });
                }
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 outline-none"
            >
              <option value="">Choose teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation})
                </option>
              ))}
            </select>
          </div>

          {selectedTeacherForSalary &&
            (() => {
              // शिक्षक चयनित होने पर कस्टम सैलरी फॉर्म दिखता है
              const teacher = teachers.find(
                (t) => t.id === selectedTeacherForSalary,
              );
              if (!teacher) return null;
              const calculatedNet =
                Number(salaryControlForm.base || 0) +
                Number(salaryControlForm.allowances || 0) -
                Number(salaryControlForm.deductions || 0);
              return (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Base Pay (₹)
                    </label>
                    <input
                      type="number"
                      value={salaryControlForm.base}
                      onChange={(e) =>
                        setSalaryControlForm({
                          ...salaryControlForm,
                          base: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Allowances (₹)
                    </label>
                    <input
                      type="number"
                      value={salaryControlForm.allowances}
                      onChange={(e) =>
                        setSalaryControlForm({
                          ...salaryControlForm,
                          allowances: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                      Deductions (₹)
                    </label>
                    <input
                      type="number"
                      value={salaryControlForm.deductions}
                      onChange={(e) =>
                        setSalaryControlForm({
                          ...salaryControlForm,
                          deductions: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
                      required
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700">
                    Disbursement Net Payout:{" "}
                    <span className="font-extrabold">
                      ₹{calculatedNet.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDisburseCustomSalary(teacher)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Disburse June Salary
                  </button>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default SalaryTab;