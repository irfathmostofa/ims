"use client";

import { Bell, Menu, Search, User } from "lucide-react";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <header className="h-16 bg-bw-900 border-b border-bw-200 flex items-center justify-between px-4 shadow-sm">
      {/* Left - Menu & Search */}
      <div className="flex items-center gap-3">
        {/* Menu button (mobile) */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-bw-700"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} className="text-bw-50" />
        </button>

        {/* Search bar */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-2 border border-bw-200 rounded-md text-sm w-64 text-bw-900 bg-bw-50 focus:outline-none focus:ring-2 focus:ring-bw-700"
          />
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-bw-500"
          />
        </div>
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-bw-700">
          <Bell size={20} className="text-bw-50" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-bw-700 px-3 py-1 rounded-md">
          <User size={20} className="text-bw-50" />
          <span className="text-sm font-medium hidden sm:inline text-bw-50">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
