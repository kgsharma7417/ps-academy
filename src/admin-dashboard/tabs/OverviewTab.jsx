// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/tabs/OverviewTab.jsx
// 📝 ओवरव्यू टैब - मुख्य डैशबोर्ड होम पेज
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { TrendingUp, Users, DollarSign, BookOpen } from "lucide-react";

const OverviewTab = ({ stats, schoolInfo }) => {
  return (
    <div className="space-y-8">
      {/* ── वेलकम बैनर ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-1">
          Welcome Back, Director
        </h3>
        <p className="text-xs text-slate-400">
          {schoolInfo.name} —{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ── क्विक एक्शन कार्ड ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Total Students",
            value: "0",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: BookOpen,
            label: "Total Teachers",
            value: "0",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            icon: DollarSign,
            label: "Revenue Collected",
            value: stats.collectedFees,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            icon: TrendingUp,
            label: "Pending Dues",
            value: stats.pendingFees,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`${card.bg} border border-slate-200 rounded-2xl p-5`}
          >
            <div className="flex items-center gap-3">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <h4 className="text-lg font-black text-slate-800">
                  {card.value}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewTab;
