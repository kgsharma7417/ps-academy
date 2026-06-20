// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/Header.jsx
// 📝 हेडर - ऊपर का बार जिसमें तारीख, नोटिफिकेशन बेल और प्रोफाइल है
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { Calendar, Bell } from "lucide-react";

const Header = ({ stats }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between shrink-0">
      {/* ── बाईं तरफ: आज की तारीख ── */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* ── दाईं तरफ: बेल आइकन + प्रोफाइल ── */}
      <div className="flex items-center gap-6">
        {/* नोटिफिकेशन बेल */}
        <div className="relative p-1.5 hover:bg-slate-100 rounded-full cursor-pointer">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
            {stats.alertsCount}
          </span>
        </div>

        {/* एडमिन प्रोफाइल */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-xs">
            P
          </div>
          <span className="text-xs font-bold text-slate-700 hidden sm:block">
            Director Jenkins
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
