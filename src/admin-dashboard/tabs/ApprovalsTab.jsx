// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/ApprovalsTab.jsx
// 📝 अप्रूवल हब - Leave और Fee Payment अनुरोधों को स्वीकृत/अस्वीकृत करना
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Shield, AlertCircle } from "lucide-react";

const ApprovalsTab = ({
  leaveRequests,
  feePaymentRequests,
  handleLeaveDecision,
  handlePaymentRequestDecision,
}) => {
  return (
    <div className="space-y-8">
      {/* ── Leave Requests ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-slate-800">
            Leave Requests (Pending)
          </h3>
        </div>
        {leaveRequests.filter((l) => l.status === "Pending").length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-xs">
            No pending leave requests.
          </p>
        ) : (
          <div className="space-y-3">
            {leaveRequests
              .filter((l) => l.status === "Pending")
              .map((lv) => (
                <div
                  key={lv.id}
                  className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center text-xs"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-800">
                      {lv.teacherName || lv.studentName || "Unknown"}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      {lv.reason || "No reason"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lv.fromDate} → {lv.toDate}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLeaveDecision(lv.id, "Approved")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(lv.id, "Rejected")}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Fee Payment Requests ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-extrabold text-slate-800">
            Fee Payment Approvals
          </h3>
        </div>
        {feePaymentRequests.filter((p) => p.status === "Pending").length ===
        0 ? (
          <p className="text-center py-6 text-slate-400 text-xs">
            No pending fee payments.
          </p>
        ) : (
          <div className="space-y-3">
            {feePaymentRequests
              .filter((p) => p.status === "Pending")
              .map((pay) => (
                <div
                  key={pay.id}
                  className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center text-xs"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-800">
                      {pay.studentName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      ₹{pay.amountPaid?.toLocaleString()} | {pay.class}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handlePaymentRequestDecision(
                          pay.id,
                          "Approved",
                          pay.amountPaid,
                          pay.studentId,
                        )
                      }
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handlePaymentRequestDecision(
                          pay.id,
                          "Rejected",
                          0,
                          pay.studentId,
                        )
                      }
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsTab;
