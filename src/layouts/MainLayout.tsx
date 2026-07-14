"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bw-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Header setSidebarOpen={setSidebarOpen} />
        {/* bg-[#E9F1F7] */}
        {/* bg-[#1b222e] */}
        <main className="flex-1 overflow-y-auto  ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
