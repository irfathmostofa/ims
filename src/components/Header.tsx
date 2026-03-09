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
  HelpCircle,
  Grid,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  BellOff,
  Building2,
  Package,
  Users,
  Truck,
  BarChart3,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { useClockWithDate } from "@/hook/useClockwithDate";
import { useQuickStore } from "@/store/quickStore";
import { toast } from "sonner";

// Types for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
}

export default function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (v: boolean) => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const navigate = useNavigate();
  const time = useClockWithDate();
  const logout = useAuthStore((state) => state.logout);

  // Get logged-in user from store
  const { user } = useAuthStore();
  const { branches, activeBranch, fetchBranches, switchBranch } =
    useQuickStore();

  // Mock notifications - in real app, fetch from API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Order Received",
      message: "Order #INV-2024-001 has been placed",
      time: "2m ago",
      type: "success",
      read: false,
      link: "/orders/12",
    },
    {
      id: "2",
      title: "Low Stock Alert",
      message: 'Product "10-lights Sputnik Chandelier" is running low',
      time: "10m ago",
      type: "warning",
      read: false,
      link: "/products/3",
    },
    {
      id: "3",
      title: "Payment Received",
      message: "Payment of $5,000 from Customer A",
      time: "1h ago",
      type: "success",
      read: true,
      link: "/payments/45",
    },
    {
      id: "4",
      title: "New User Registered",
      message: "John Doe created an account",
      time: "2h ago",
      type: "info",
      read: true,
      link: "/users/78",
    },
  ]);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Handle branch selection
  const handleBranchSelect = (branchId: number | null) => {
    if (branchId === null) {
      switchBranch(null);
      localStorage.removeItem("activeBranchId");
      toast.success("Viewing all branches");
    } else {
      switchBranch(branchId);
      localStorage.setItem("activeBranchId", branchId.toString());
      toast.success(
        `Switched to ${branches.find((b) => b.id === branchId)?.name}`,
      );
    }
    setBranchOpen(false);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Fetch branches on mount
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches();
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".branch-dropdown")) setBranchOpen(false);
      if (!target.closest(".notif-dropdown")) setNotifOpen(false);
      if (!target.closest(".user-dropdown")) setUserOpen(false);
      if (!target.closest(".quick-actions-dropdown"))
        setQuickActionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-bw-900 border-b border-bw-700 flex items-center justify-between px-4 shadow-sm relative">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-bw-800 text-bw-200 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Date & Time Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-bw-200 bg-bw-800 px-3 py-1.5 rounded-lg">
          <span>{time}</span>
        </div>

        {/* Quick Actions Button */}
        <div className="relative quick-actions-dropdown">
          <button
            className="p-2 rounded-md hover:bg-bw-800 text-bw-200 transition-colors"
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            title="Quick Actions"
          >
            <Grid size={20} />
          </button>

          {quickActionsOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-bw-900 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-bw-700">
              <div className="px-4 py-3 font-semibold text-bw-100 border-b border-bw-700 bg-bw-800">
                Quick Actions
              </div>
              <div className="py-2 bg-bw-900">
                <QuickActionLink
                  icon={<ShoppingCart />}
                  label="New Sale (POS)"
                  link="/pos"
                />
                <QuickActionLink
                  icon={<Package />}
                  label="Add Product"
                  link="/products/new"
                />
                <QuickActionLink
                  icon={<Users />}
                  label="Add Customer"
                  link="/customers/new"
                />
                <QuickActionLink
                  icon={<FileText />}
                  label="Create Invoice"
                  link="/invoices/new"
                />
                <QuickActionLink
                  icon={<Truck />}
                  label="New Purchase"
                  link="/purchases/new"
                />
                <QuickActionLink
                  icon={<BarChart3 />}
                  label="View Reports"
                  link="/reports"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Branch Selector */}
        <div className="relative branch-dropdown">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bw-800 text-bw-100 border border-bw-700 min-w-[160px] transition-colors bg-bw-900"
            onClick={() => setBranchOpen(!branchOpen)}
          >
            <div className="text-left flex-1">
              <div className="text-sm font-medium truncate">
                {activeBranch ? activeBranch.name : "All Branches"}
              </div>
            </div>
            <ChevronDown
              size={15}
              className={`text-bw-400 transition-transform flex-shrink-0 ${
                branchOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {branchOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-bw-900 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-bw-700">
              <div className="px-4 py-3 font-semibold text-bw-100 border-b border-bw-700 bg-bw-800">
                Select Branch
              </div>

              {/* All Branches Option */}
              <button
                className={`w-full text-left px-4 py-3 hover:bg-bw-800 flex items-center justify-between border-b border-bw-700 transition-colors bg-bw-900 ${
                  !activeBranch ? "text-orange-500" : "text-bw-200"
                }`}
                onClick={() => handleBranchSelect(null)}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-bw-400" />
                  <div>
                    <div className="font-medium">All Branches</div>
                    <div className="text-xs text-bw-400 mt-0.5">
                      View consolidated data
                    </div>
                  </div>
                </div>
                {!activeBranch && (
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                )}
              </button>

              {/* Individual Branches */}
              <div className="max-h-80 overflow-y-auto bg-bw-900">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    className={`w-full text-left px-4 py-3 hover:bg-bw-800 flex justify-between items-center border-b border-bw-700 last:border-0 transition-colors bg-bw-900 ${
                      activeBranch?.id === branch.id
                        ? "text-orange-500"
                        : "text-bw-200"
                    }`}
                    onClick={() => handleBranchSelect(branch.id)}
                  >
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-bw-400 mt-0.5">
                        Code: {branch.code}
                      </div>
                      {branch.address && (
                        <div className="text-xs text-bw-500 mt-0.5 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{branch.address}</span>
                        </div>
                      )}
                    </div>
                    {activeBranch?.id === branch.id && (
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Branch Management Link */}
              <div className="px-4 py-2 text-sm border-t border-bw-700 bg-bw-800">
                <Link
                  to="/branches"
                  className="text-orange-500 hover:text-orange-400 hover:underline flex items-center gap-1 transition-colors"
                  onClick={() => setBranchOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  Manage Branches →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* POS Shortcut */}
        <Link
          to="/pos"
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
        >
          <ShoppingCart size={18} />
          <span className="text-sm font-medium">POS</span>
        </Link>

        {/* Notifications */}
        <div className="relative notif-dropdown">
          <button
            className="relative p-2 rounded-lg hover:bg-bw-800 text-bw-200 transition-colors bg-bw-900"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-bw-900 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-bw-700">
              <div className="px-4 py-3 font-semibold text-bw-100 border-b border-bw-700 bg-bw-800 flex justify-between items-center">
                <span>Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-orange-500 hover:text-orange-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {notifications.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto divide-y divide-bw-700 bg-bw-900">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-bw-800 cursor-pointer transition-colors bg-bw-900 ${
                        !notif.read ? "bg-orange-500/10" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link) navigate(notif.link);
                        setNotifOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-bw-100">
                            {notif.title}
                          </p>
                          <p className="text-xs text-bw-400 mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-xs text-bw-500 mt-1">
                            {notif.time}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-bw-400 bg-bw-900">
                  <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              )}

              <div className="px-4 py-2 text-sm border-t border-bw-700 bg-bw-800">
                <Link
                  to="/notifications"
                  className="text-orange-500 hover:text-orange-400 hover:underline"
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative user-dropdown">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-bw-800 px-3 py-2 rounded-lg transition-colors bg-bw-900"
            onClick={() => setUserOpen((prev) => !prev)}
          >
            {/* Profile image or fallback icon */}
            {user?.image ? (
              <img
                src={user.image}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border-2 border-bw-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <User size={18} className="text-orange-500" />
              </div>
            )}
            <span className="text-sm font-medium hidden md:inline text-bw-100">
              {user?.username || "Guest"}
            </span>
            <ChevronDown
              size={15}
              className={`hidden md:block text-bw-400 transition-transform ${
                userOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-bw-900 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-bw-700">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-bw-700 bg-bw-800">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <User size={20} className="text-orange-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-bw-100">
                      {user?.username || "Guest User"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.role?.name || "No Role"} •{" "}
                      {activeBranch?.name || "All Branches"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-2 bg-bw-900">
                <UserMenuLink
                  icon={<User />}
                  label="My Profile"
                  link="/profile"
                  onClick={() => setUserOpen(false)}
                />
                <UserMenuLink
                  icon={<Settings />}
                  label="Settings"
                  link="/settings"
                  onClick={() => setUserOpen(false)}
                />
                <UserMenuLink
                  icon={<HelpCircle />}
                  label="Help & Support"
                  link="/support"
                  onClick={() => setUserOpen(false)}
                />
                <UserMenuLink
                  icon={<SquareArrowOutUpLeft />}
                  label="Setup Wizard"
                  link="/setup-wizard"
                  onClick={() => setUserOpen(false)}
                />
              </div>

              {/* Logout */}
              <button
                className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 border-t border-bw-700 transition-colors bg-bw-800"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Quick Action Link Component
function QuickActionLink({
  icon,
  label,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="flex items-center gap-3 px-4 py-2 text-sm text-bw-200 hover:bg-orange-500/20 hover:text-orange-500 transition-colors bg-bw-900"
    >
      <span className="text-bw-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

// User Menu Link Component
function UserMenuLink({
  icon,
  label,
  link,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  link: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={link}
      className="flex items-center gap-3 px-4 py-2 text-sm text-bw-200 hover:bg-orange-500/20 hover:text-orange-500 transition-colors bg-bw-900"
      onClick={onClick}
    >
      <span className="text-bw-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
