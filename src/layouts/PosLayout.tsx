"use client";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useClockWithDate } from "@/hook/useClockwithDate";

export default function PosLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const time = useClockWithDate();
  // Update running time every second

  // Check if current path is for returns
  const isReturnPage = location.pathname.includes("return");

  return (
    <div className="h-screen w-screen bg-bw-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-bw-900 text-bw-50 px-4 py-3 shadow-md">
        {/* Back Button */}
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-bw-700 transition"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* POS Title */}
        <h1 className="text-xl font-bold">
          {isReturnPage ? "Return Management" : "Point of Sale"}
        </h1>

        {/* Running Time and Navigation Toggle */}
        <div className="flex items-center gap-4">
          <button
            className="px-3 py-1 bg-bw-800 rounded-md hover:bg-bw-700 transition border border-amber-50 cursor-pointer"
            onClick={() => navigate(isReturnPage ? "/pos" : "/return")}
          >
            {isReturnPage ? "Switch to POS" : "Switch to Returns"}
          </button>

          <div className="text-bw-100 text-right">
            <div>{time}</div>
          </div>
        </div>
      </div>

      {/* Main POS Content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4 ">
        <Outlet />
      </div>
    </div>
  );
}
