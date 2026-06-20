// ═══════════════════════════════════════════════════════════════════════════════
// 📁 admin-dashboard/components/Notification.jsx
// 📝 नोटिफिकेशन टोस्ट - सफलता/त्रुटि संदेश दिखाने के लिए
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";
import { CheckCircle } from "lucide-react";

const Notification = ({ notification }) => {
  if (!notification.message) return null;

  return (
    <div
      className={`mx-8 mt-6 p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
        notification.type === "error"
          ? "bg-rose-50 border-rose-100 text-rose-600"
          : "bg-emerald-50 border-emerald-100 text-emerald-600"
      }`}
    >
      <CheckCircle className="w-4 h-4" />
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;
