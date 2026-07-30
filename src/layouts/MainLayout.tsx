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
      {/* FIX: min-w-0 lets this flex child actually shrink below its content's
          natural width. Without it, a wide child (like the Stock Ledger page's
          table) forces this whole column wider than the viewport instead of
          scrolling internally — which is exactly what was cutting off the
          filter panel and DataTable search box on the right edge. */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header setSidebarOpen={setSidebarOpen} />
        {/* bg-[#E9F1F7] */}
        {/* bg-[#1b222e] */}
        {/* FIX: min-w-0 again (same reason), plus overflow-x-hidden so any
            horizontal overflow is contained here rather than escaping the
            page. DataTable's own overflow-x-auto wrapper is what should
            actually produce the horizontal scrollbar for wide tables — this
            just stops the page itself from stretching to match it. */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
