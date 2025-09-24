"use client";

import {
  Bell,
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Globe2,
  SquareArrowOutUpLeft,
  Clock,
  Clock10Icon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useClock } from "@/hook/useClock";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (v: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  let location = useNavigate();
  const time = useClock();
  return (
    <header className="h-16 bg-bw-900 border-b border-bw-200 flex items-center justify-between pr-4 shadow-sm relative">
      {/* Left - Menu */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-md hover:bg-bw-700"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} className="text-bw-50" />
        </button>

        <p
          className="flex
         gap-2 text-amber-50 border-l-1 sm:border-l-none p-5 "
        >
          {time}
        </p>
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-4 relative">
        {/* POS Shortcut */}
        {/* <Link
          to={"https://rasian-mart.netlify.app/"}
          target="_Blank"
          className="flex
         gap-2 text-amber-50 border p-2 rounded"
        >
          <Globe2 /> Visit Website
        </Link> */}
        <Link
          to={"/pos"}
          className="p-2 rounded-md hover:bg-bw-700 flex gap-1 items-center text-amber-50 border border-amber-50"
        >
          <ShoppingCart size={20} className="text-bw-50" />
          POS
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-md hover:bg-bw-700"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            <Bell size={20} className="text-bw-50" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 font-semibold text-gray-700 border-b bg-gray-50">
                Notifications
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm flex justify-between">
                  <span>New order received</span>
                  <span className="text-xs text-gray-400">2m ago</span>
                </li>
                <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm flex justify-between">
                  <span>Low stock: Product X</span>
                  <span className="text-xs text-gray-400">10m ago</span>
                </li>
                <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm flex justify-between">
                  <span>User John logged in</span>
                  <span className="text-xs text-gray-400">1h ago</span>
                </li>
              </ul>
              <div className="px-4 py-2 text-sm text-blue-600 hover:underline cursor-pointer bg-gray-50">
                View all
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-bw-700 px-3 py-1 rounded-md"
            onClick={() => setUserOpen((prev) => !prev)}
          >
            <User size={20} className="text-bw-50" />
            <span className="text-sm font-medium hidden sm:inline text-bw-50">
              Admin
            </span>
          </div>

          {/* User Dropdown */}
          {userOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings size={16} /> Profile
              </Link>
              <Link
                to="/setup-wizard"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <SquareArrowOutUpLeft size={16} /> Setup Wizard
              </Link>
              <button
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  localStorage.removeItem("token");
                  location("/");
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
