// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/Sidebar.jsx
// 📝 साइडबार - बायीं तरफ का नेविगेशन पैनल जिसमें सारे टैब हैं
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import {
  Users,
  UserPlus,
  CreditCard,
  Megaphone,
  LayoutDashboard,
  LogOut,
  DollarSign,
  BookOpen,
  Shield,
  Clock,
  Sliders,
  Award,
  Contact,
  Calendar,
} from "lucide-react";
import { TAB_ITEMS } from "../constants";

// आइकॉन को नाम से मैप करने वाला ऑब्जेक्ट
const ICON_MAP = {
  LayoutDashboard: LayoutDashboard,
  Shield,
  Users: Users,
  Contact,
  UserPlus,
  Calendar,
  CreditCard,
  DollarSign,
  Megaphone,
  Clock,
  Award,
  Sliders,
};

const Sidebar = ({ activeTab, setActiveTab, schoolInfo, userData, logout }) => {
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-350 flex flex-col justify-between shrink-0 border-r border-slate-850">
      <div>
        {/* ── स्कूल का नाम और लोगो सेक्शन ── */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wider truncate">
              {schoolInfo.name}
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              Principal Portal
            </span>
          </div>
        </div>

        {/* ── एडमिन/यूज़र की प्रोफ़ाइल ── */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
            P
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">
              {userData?.name || "Dr. Sarah Jenkins"}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              College Director
            </span>
          </div>
        </div>

        {/* ── नेविगेशन टैब्स (सारे मेनू आइटम) ── */}
        <nav className="p-4 space-y-1">
          {TAB_ITEMS.map((tab) => {
            const Icon = ICON_MAP[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── साइन आउट बटन ── */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
