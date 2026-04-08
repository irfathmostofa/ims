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
  Globe2,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { useClockWithDate } from "@/hook/useClockwithDate";
import { useQuickStore } from "@/store/quickStore";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
}

const NOTIF_COLORS: Record<string, { bg: string; icon: string }> = {
  success: { bg: "rgba(34,197,94,0.1)", icon: "#22c55e" },
  warning: { bg: "rgba(234,179,8,0.1)", icon: "#eab308" },
  error: { bg: "rgba(239,68,68,0.1)", icon: "#ef4444" },
  info: { bg: "rgba(59,130,246,0.1)", icon: "#3b82f6" },
};

function NotifIcon({ type }: { type: string }) {
  const color = NOTIF_COLORS[type]?.icon ?? "#3b82f6";
  const Icon =
    type === "success"
      ? CheckCircle
      : type === "warning"
        ? AlertTriangle
        : type === "error"
          ? XCircle
          : Info;
  return <Icon size={15} style={{ color }} />;
}

// ── shared dropdown styles ─────────────────────────────────────────────
const dropdownStyle: React.CSSProperties = {
  background: "#111c2b",
  border: "1px solid rgba(246,136,38,0.15)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
  borderRadius: "14px",
  overflow: "hidden",
};

const dropdownHeaderStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  padding: "12px 16px",
};

// ── sub-components ─────────────────────────────────────────────────────
function QuickActionLink({
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
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all group"
      style={{ color: "#94a3b8" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(246,136,38,0.08)";
        e.currentTarget.style.color = "#f68826";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      <span
        className="flex-shrink-0 transition-colors"
        style={{ color: "inherit" }}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

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
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all"
      style={{ color: "#94a3b8" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(246,136,38,0.08)";
        e.currentTarget.style.color = "#f68826";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      <span style={{ color: "inherit" }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// ── main component ─────────────────────────────────────────────────────
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
  const logout = useAuthStore((s) => s.logout);
  const { user } = useAuthStore();
  const { branches, activeBranch, fetchBranches, switchBranch } =
    useQuickStore();

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
      message: '"10-lights Sputnik Chandelier" is running low',
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

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

  const markAsRead = (id: string) =>
    setNotifications((p) =>
      p.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const markAllAsRead = () => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read");
  };
  const clearAll = () => {
    setNotifications([]);
    toast.success("Notifications cleared");
  };

  useEffect(() => {
    if (branches.length === 0) fetchBranches();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".dd-branch")) setBranchOpen(false);
      if (!t.closest(".dd-notif")) setNotifOpen(false);
      if (!t.closest(".dd-user")) setUserOpen(false);
      if (!t.closest(".dd-quick")) setQuickActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── render ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .drop-anim { animation: dropIn 0.18s cubic-bezier(.22,1,.36,1) forwards; }
        .notif-unread { position: relative; }
        .notif-unread::before {
          content: "";
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #f68826;
          border-radius: 0 2px 2px 0;
        }
      `}</style>

      <header
        className="flex items-center justify-between px-4 flex-shrink-0 relative"
        style={{
          height: "64px",
          background: "linear-gradient(90deg, #0f1923 0%, #1a2535 100%)",
          borderBottom: "1px solid rgba(246,136,38,0.1)",
        }}
      >
        {/* ── LEFT ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Hamburger */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={19} />
          </button>

          {/* Clock */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#fff",
            }}
          >
            {time}
          </div>

          {/* Quick actions */}
          <div className="relative dd-quick">
            <button
              title="Quick Actions"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                color: quickActionsOpen ? "#f68826" : "#94a3b8",
                background: quickActionsOpen
                  ? "rgba(246,136,38,0.1)"
                  : "transparent",
                border: quickActionsOpen
                  ? "1px solid rgba(246,136,38,0.25)"
                  : "1px solid transparent",
              }}
              onClick={() => setQuickActionsOpen((p) => !p)}
              onMouseEnter={(e) => {
                if (!quickActionsOpen)
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!quickActionsOpen)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <Grid size={17} />
            </button>

            {quickActionsOpen && (
              <div
                className="drop-anim absolute left-0 mt-2 w-56 z-50"
                style={dropdownStyle}
              >
                <div
                  style={dropdownHeaderStyle}
                  className="flex items-center gap-2"
                >
                  <Zap size={13} style={{ color: "#f68826" }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#cbd5e1" }}
                  >
                    Quick Actions
                  </span>
                </div>
                <div className="py-1.5">
                  <QuickActionLink
                    icon={<ShoppingCart size={15} />}
                    label="New Sale (POS)"
                    link="/pos"
                    onClick={() => setQuickActionsOpen(false)}
                  />
                  <QuickActionLink
                    icon={<Package size={15} />}
                    label="Add Product"
                    link="/inventory/products/add"
                    onClick={() => setQuickActionsOpen(false)}
                  />
                  <QuickActionLink
                    icon={<Users size={15} />}
                    label="Add Customer"
                    link="/customers/customer-list"
                    onClick={() => setQuickActionsOpen(false)}
                  />
                  <QuickActionLink
                    icon={<Truck size={15} />}
                    label="New Purchase"
                    link="/procurement/purchase-orders"
                    onClick={() => setQuickActionsOpen(false)}
                  />
                  <QuickActionLink
                    icon={<Globe2 size={15} />}
                    label="Website Config"
                    link="/web-setting"
                    onClick={() => setQuickActionsOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Branch selector */}
          <div className="relative dd-branch">
            <button
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: branchOpen
                  ? "rgba(246,136,38,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: branchOpen
                  ? "1px solid rgba(246,136,38,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                minWidth: "148px",
              }}
              onClick={() => setBranchOpen((p) => !p)}
            >
              <Building2
                size={14}
                style={{ color: "#f68826", flexShrink: 0 }}
              />
              <span className="flex-1 text-left truncate text-xs font-medium">
                {activeBranch ? activeBranch.name : "All Branches"}
              </span>
              <ChevronDown
                size={13}
                style={{
                  color: "#94a3b8",
                  flexShrink: 0,
                  transform: branchOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {branchOpen && (
              <div
                className="drop-anim absolute right-0 mt-2 w-80 z-50"
                style={dropdownStyle}
              >
                <div style={dropdownHeaderStyle}>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#cbd5e1" }}
                  >
                    Select Branch
                  </p>
                </div>

                {/* All branches */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                  style={{
                    color: !activeBranch ? "#f68826" : "#94a3b8",
                    background: !activeBranch
                      ? "rgba(246,136,38,0.06)"
                      : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeBranch)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeBranch)
                      e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => handleBranchSelect(null)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(246,136,38,0.1)" }}
                    >
                      <Building2 size={15} style={{ color: "#f68826" }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">All Branches</p>
                      <p className="text-xs" style={{ color: "#8899aa" }}>
                        Consolidated view
                      </p>
                    </div>
                  </div>
                  {!activeBranch && (
                    <CheckCircle size={16} style={{ color: "#f68826" }} />
                  )}
                </button>

                {/* Individual branches */}
                <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {branches.map((branch) => {
                    const isActive = activeBranch?.id === branch.id;
                    return (
                      <button
                        key={branch.id}
                        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all"
                        style={{
                          color: isActive ? "#f68826" : "#94a3b8",
                          background: isActive
                            ? "rgba(246,136,38,0.06)"
                            : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "transparent";
                        }}
                        onClick={() => handleBranchSelect(branch.id)}
                      >
                        <div>
                          <p className="text-sm font-medium">{branch.name}</p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#8899aa" }}
                          >
                            Code: {branch.code}
                          </p>
                          {branch.address && (
                            <div className="flex items-start gap-1 mt-0.5">
                              <MapPin
                                size={10}
                                style={{
                                  color: "#7a8fa6",
                                  marginTop: "2px",
                                  flexShrink: 0,
                                }}
                              />
                              <p
                                className="text-xs truncate max-w-[180px]"
                                style={{ color: "#7a8fa6" }}
                              >
                                {branch.address}
                              </p>
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <CheckCircle
                            size={15}
                            style={{ color: "#f68826", flexShrink: 0 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="px-4 py-2.5"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Link
                    to="/setup/branches"
                    className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                    style={{ color: "#f68826" }}
                    onClick={() => setBranchOpen(false)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#fb923c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#f68826")
                    }
                  >
                    <Building2 size={12} />
                    Manage Branches →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* POS shortcut */}
          <Link
            to="/pos"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#f68826", color: "#0f1923" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fb923c")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f68826")}
          >
            <ShoppingCart size={15} />
            <span>POS</span>
          </Link>

          {/* Notifications */}
          <div className="relative dd-notif">
            <button
              title="Notifications"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                color: notifOpen ? "#f68826" : "#94a3b8",
                background: notifOpen
                  ? "rgba(246,136,38,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: notifOpen
                  ? "1px solid rgba(246,136,38,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
              onClick={() => setNotifOpen((p) => !p)}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center text-white font-bold"
                  style={{
                    top: "-4px",
                    right: "-4px",
                    width: "17px",
                    height: "17px",
                    fontSize: "9px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "2px solid #0f1923",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="drop-anim absolute right-0 mt-2 w-96 z-50"
                style={dropdownStyle}
              >
                <div
                  style={dropdownHeaderStyle}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bell size={13} style={{ color: "#f68826" }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#cbd5e1" }}
                    >
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs transition-colors"
                        style={{ color: "#f68826" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#fb923c")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#f68826")
                        }
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs transition-colors"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#94a3b8")
                        }
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {notifications.length > 0 ? (
                  <ul style={{ maxHeight: "340px", overflowY: "auto" }}>
                    {notifications.map((notif) => {
                      const colors =
                        NOTIF_COLORS[notif.type] ?? NOTIF_COLORS.info;
                      return (
                        <li
                          key={notif.id}
                          className={`px-4 py-3 cursor-pointer transition-all ${!notif.read ? "notif-unread" : ""}`}
                          style={{
                            background: !notif.read ? colors.bg : "transparent",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = !notif.read
                              ? colors.bg
                              : "transparent")
                          }
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) navigate("#");
                            setNotifOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background: colors.bg,
                                border: `1px solid ${colors.icon}22`,
                              }}
                            >
                              <NotifIcon type={notif.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs font-semibold"
                                style={{ color: "#e2e8f0" }}
                              >
                                {notif.title}
                              </p>
                              <p
                                className="text-xs mt-0.5 leading-relaxed"
                                style={{ color: "#94a3b8" }}
                              >
                                {notif.message}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: "#7a8fa6" }}
                              >
                                {notif.time}
                              </p>
                            </div>
                            {!notif.read && (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                style={{ background: "#f68826" }}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-10 text-center">
                    <BellOff
                      size={28}
                      style={{ color: "#4a5f75", margin: "0 auto 8px" }}
                    />
                    <p className="text-xs" style={{ color: "#7a8fa6" }}>
                      You're all caught up
                    </p>
                  </div>
                )}

                <div
                  className="px-4 py-2.5"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Link
                    to="/notifications"
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#f68826" }}
                    onClick={() => setNotifOpen(false)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#fb923c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#f68826")
                    }
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative dd-user">
            <button
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all"
              style={{
                background: userOpen
                  ? "rgba(246,136,38,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: userOpen
                  ? "1px solid rgba(246,136,38,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
              onClick={() => setUserOpen((p) => !p)}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.username}
                  className="w-7 h-7 rounded-lg object-cover"
                  style={{ border: "1px solid rgba(246,136,38,0.3)" }}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(246,136,38,0.2)",
                    color: "#f68826",
                  }}
                >
                  {(user?.username?.[0] ?? "U").toUpperCase()}
                </div>
              )}
              <span
                className="hidden md:inline text-xs font-medium"
                style={{ color: "#cbd5e1" }}
              >
                {user?.username || "Guest"}
              </span>
              <ChevronDown
                size={12}
                style={{
                  color: "#8899aa",
                  transform: userOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {userOpen && (
              <div
                className="drop-anim absolute right-0 mt-2 w-64 z-50"
                style={dropdownStyle}
              >
                {/* User info */}
                <div
                  className="px-4 py-3.5"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.username}
                        className="w-10 h-10 rounded-xl object-cover"
                        style={{ border: "1px solid rgba(246,136,38,0.3)" }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          background: "rgba(246,136,38,0.15)",
                          color: "#f68826",
                          border: "1px solid rgba(246,136,38,0.2)",
                        }}
                      >
                        {(user?.username?.[0] ?? "U").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#e2e8f0" }}
                      >
                        {user?.username || "Guest User"}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "#8899aa" }}
                      >
                        {user?.role?.name || "No Role"} ·{" "}
                        {activeBranch?.name || "All Branches"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5">
                  <UserMenuLink
                    icon={<User size={15} />}
                    label="My Profile"
                    link="/profile"
                    onClick={() => setUserOpen(false)}
                  />
                  <UserMenuLink
                    icon={<Settings size={15} />}
                    label="Settings"
                    link="/settings"
                    onClick={() => setUserOpen(false)}
                  />
                  <UserMenuLink
                    icon={<HelpCircle size={15} />}
                    label="Help & Support"
                    link="/support"
                    onClick={() => setUserOpen(false)}
                  />
                  <UserMenuLink
                    icon={<SquareArrowOutUpLeft size={15} />}
                    label="Setup Wizard"
                    link="/setup-wizard"
                    onClick={() => setUserOpen(false)}
                  />
                </div>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    color: "#ef4444",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
