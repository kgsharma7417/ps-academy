// ══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/StatsHero.jsx
// 📝 स्टैट्स हीरो सेक्शन - 5 कार्ड में मुख्य आँकड़े दिखाता है
// ══════════════════════════════════════════════════════════════════════════════

import React from "react";
import {
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color, bar, barColor }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
    <div className="flex items-start justify-between mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <Icon className={`w-4 h-4 ${color || "text-indigo-500"}`} />
    </div>
    <div className="mt-1">
      <span className={`text-2xl font-black ${color || "text-slate-800"}`}>
        {value}
      </span>
      <span className="text-[10px] text-slate-400 font-semibold ml-2">
        {sub}
      </span>
    </div>
    {bar && (
      <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${barColor || "bg-indigo-500"}`}
          style={{ width: "84%" }}
        />
      </div>
    )}
  </div>
);

const StatsHero = ({ stats }) => {
  const cards = [
    {
      label: "Today's Attendance",
      value: `${stats.attendanceRate}%`,
      sub: "Students Active",
      color: "text-slate-800",
      bar: true,
      barColor: "bg-indigo-500",
      icon: Users,
    },
    {
      label: "Teacher Absent",
      value: stats.teachersOnLeave,
      sub: "Staff on Leave",
      color: "text-amber-600",
      icon: Clock,
    },
    {
      label: "Collected Fees",
      value: stats.collectedFees,
      sub: "Revenue Collected",
      color: "text-emerald-600",
      icon: DollarSign,
    },
    {
      label: "Pending Dues",
      value: stats.pendingFees,
      sub: "Outstanding",
      color: "text-rose-500",
      icon: AlertCircle,
    },
    {
      label: "Pending Approvals",
      value: stats.alertsCount,
      sub: "Awaiting Review",
      color: "text-indigo-600",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </section>
  );
};

export default StatsHero;
