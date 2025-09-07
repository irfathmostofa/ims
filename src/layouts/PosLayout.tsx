"use client";

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PosLayout() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  // Update running time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="h-screen w-screen bg-bw-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-bw-900 text-bw-50 px-4 py-3 shadow-md">
        {/* Back Button */}
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-bw-700 transition"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* POS Title */}
        <h1 className="text-xl font-bold">Point of Sale</h1>

        {/* Running Time */}
        <div className="text-bw-100 text-right">
          <div>
            {formattedDate} {formattedTime}
          </div>
        </div>
      </div>

      {/* Main POS Content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4">
        <Outlet />
      </div>
    </div>
  );
}
