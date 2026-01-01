"use client";

import {
  Bell,
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  SquareArrowOutUpLeft,
  ChevronDown,
  Building,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { useClockWithDate } from "@/hook/useClockwithDate";
import { useQuickStore } from "@/store/quickStore";

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (v: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();
  const time = useClockWithDate();

  const [branchOpen, setBranchOpen] = useState(false);
  // 🔹 Get logged-in user from store
  const { user } = useAuthStore();
  const { branches, activeBranch, fetchBranches, switchBranch } =
    useQuickStore();

  // Fetch branches on mount
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches();
    }
  }, []);
  const handleBranchSelect = (branchId: number) => {
    switchBranch(branchId);
    localStorage.setItem("activeBranchId", branchId.toString());
    setBranchOpen(false);

    // Refresh data based on new branch
    // You might want to fetch products or other branch-specific data here
  };
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

        <p className="flex gap-2 text-amber-50 border-l-1 sm:border-l-none p-5 ">
          {time}
        </p>
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-4 relative">
        {/* POS Shortcut */}
        <div className="relative border border-amber-50 rounded">
          <button
            className="flex items-center gap-2 px-3 py-3 rounded-md hover:bg-bw-700 text-white"
            onClick={() => setBranchOpen(!branchOpen)}
          >
            <div className="text-left">
              <div className="text-sm font-medium">
                {activeBranch?.name || "Select Branch"}
                {/* ({activeBranch?.code}) */}
              </div>
            </div>
            <ChevronDown
              size={15}
              className={`transition-transform ${
                branchOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {branchOpen && branches.length > 0 && (
            <div className="absolute left-0 mt-2 w-64 bg-white shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 font-semibold text-gray-700 border-b bg-gray-50">
                Switch Branch
              </div>
              <div className="max-h-64 overflow-y-auto">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 flex justify-between items-center ${
                      activeBranch?.id === branch.id
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    }`}
                    onClick={() => handleBranchSelect(branch.id)}
                  >
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-gray-500">{branch.code}</div>
                      {branch.address && (
                        <div className="text-xs text-gray-400">
                          {branch.address}
                        </div>
                      )}
                    </div>
                    {activeBranch?.id === branch.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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
            {/* Profile image or fallback icon */}
            {user?.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <User size={20} className="text-bw-50" />
            )}
            <span className="text-sm font-medium hidden sm:inline text-bw-50">
              {user?.username || "Guest"}
            </span>
          </div>

          {userOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.address}</p>
                <p className="text-xs text-gray-400">
                  {user?.role?.name} • {user?.branch?.name}
                </p>
                <p className="text-xs text-gray-400">{user?.company?.name}</p>
              </div>

              {/* Links */}
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
                  navigate("/");
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
