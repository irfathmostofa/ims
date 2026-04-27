"use client";

import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart,
  Truck,
  DollarSign,
  ChevronDown,
  X,
  Globe2,
  ShoppingBag,
  SendToBack,
  LineChart,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logo from "../../src/assets/logo.png";

type NavItem = {
  name: string;
  path?: string;
  icon?: any;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    name: "Inventory",
    icon: Package,
    children: [
      { name: "All Products", path: "/inventory/products" },
      { name: "Product Category", path: "/inventory/categories" },
      { name: "Brand", path: "/inventory/brand" },
      { name: "Unit of Measurement", path: "/inventory/units" },
      { name: "Stock Ledger", path: "/inventory/stock-ledger" },
      { name: "Adjustments", path: "/inventory/adjustments" },
    ],
  },
  {
    name: "Procurement",
    icon: SendToBack,
    children: [
      { name: "Purchase Orders", path: "/procurement/purchase-orders" },
      { name: "Goods Received Notes", path: "/procurement/grn" },
      { name: "Requisition", path: "/procurement/requisition" },
      { name: "Stock Transfer", path: "/procurement/stock-transfer" },
      { name: "Stock Record", path: "/procurement/stock-record" },
    ],
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    children: [
      { name: "Sale List", path: "/sales/sale-list" },
      // { name: "Discounts & Promotions", path: "/sales/discounts" },
    ],
  },
  {
    name: "Online Sales",
    icon: ShoppingBag,
    children: [
      { name: "Order List", path: "/order" },
      { name: "Order Payment", path: "/order/payment" },
      // { name: "Order Tracking", path: "/order/tracking" },
      // { name: "Order Return", path: "/order/return" },
      { name: "Coupon Management", path: "/order/coupon" },
      { name: "Logistics", path: "/order/logistics" },
      { name: "Enquiries", path: "/order/enquiries" },
    ],
  },
  {
    name: "Customers",
    icon: Users,
    children: [
      { name: "Customer List", path: "/customers/customer-list" },
      { name: "Receivables", path: "/customers/receivables" },
    ],
  },
  {
    name: "Suppliers",
    icon: Truck,
    children: [
      { name: "Supplier List", path: "/suppliers/list" },
      { name: "Payables", path: "/suppliers/payables" },
    ],
  },
  {
    name: "Accounts",
    icon: DollarSign,
    children: [
      { name: "Accounts Head", path: "/accounts/account-head" },
      { name: "Accounts", path: "/accounts/accounts" },
      { name: "Accounting Period", path: "/accounts/accounting-period" },
      { name: "Journal Entries", path: "/accounts/journals" },
      // { name: "Transactions", path: "/accounts/transactions" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart,
    children: [
      { name: "Sales Reports", path: "/reports/sales" },
      { name: "Stock Reports", path: "/reports/stock" },
      { name: "Purchase Reports", path: "/reports/purchase" },
      { name: "Profitability Reports", path: "/reports/profitability" },
    ],
  },
  {
    name: "Marketing",
    icon: LineChart,
    children: [
      { name: "SEO", path: "/seo" },
      { name: "Campaign", path: "/campaign" },
      { name: "Send WhatsApp Message", path: "/send-whatsapp-sms" },
      { name: "Send Mobile Message", path: "/send-mobile-sms" },
    ],
  },
  {
    name: "Website Setup",
    icon: Globe2,
    children: [
      { name: "Settings", path: "/web-setting" },
      { name: "Theme", path: "/theme" },
      { name: "Visit Website", path: "https://inventory-mart.netlify.app/" },
    ],
  },
  {
    name: "Setup",
    icon: Settings,
    children: [
      { name: "Company Info", path: "/setup/company" },
      { name: "Branches", path: "/setup/branches" },
      { name: "Payment Method", path: "/setup/payment-methods" },
      { name: "Delivery Method", path: "/setup/delivery-methods" },
      { name: "Roles", path: "/setup/roles" },
      { name: "Users", path: "/setup/users" },
    ],
  },
];

// Check if a section contains the active route
function sectionHasActiveChild(item: NavItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => child.path && pathname.startsWith(child.path),
  );
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-open sections that contain the active route
  const [openMenus, setOpenMenus] = useState<string[]>(() =>
    navItems
      .filter((item) => sectionHasActiveChild(item, location.pathname))
      .map((item) => item.name),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Update open menus when route changes
  useEffect(() => {
    const activeSection = navItems.find((item) =>
      sectionHasActiveChild(item, location.pathname),
    );
    if (activeSection && !openMenus.includes(activeSection.name)) {
      setOpenMenus((prev) => [...prev, activeSection.name]);
    }
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  // Flatten all nav items for search
  const allSearchItems = navItems.flatMap((item: any) => {
    if (item.children) {
      return item.children.map((child: any) => ({
        ...child,
        section: item.name,
        sectionIcon: item.icon,
      }));
    }
    return [{ ...item, section: null, sectionIcon: null }];
  });

  const searchResults =
    searchQuery.trim().length > 0
      ? allSearchItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.section &&
              item.section.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      : [];

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          md:static md:translate-x-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          width: "260px",
          background:
            "linear-gradient(180deg, #0f1923 0%, #1a2535 60%, #0f1923 100%)",
          borderRight: "1px solid rgba(246,136,38,0.12)",
        }}
      >
        {/* ── Brand ──────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{
            height: "64px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            className="flex items-center gap-2.5 group"
            onClick={() => {
              navigate("/dashboard");
              setSidebarOpen(false);
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(246,136,38,0.15)",
                border: "1px solid rgba(246,136,38,0.3)",
              }}
            >
              <img src={logo} className="h-5 w-5 object-contain" alt="logo" />
            </div>
            <div className="leading-tight">
              <span
                className="text-base font-bold tracking-wide"
                style={{
                  color: "#f5f5f5",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                UniStock
              </span>
              <span
                className="text-base font-bold ml-1"
                style={{
                  color: "#f68826",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Pro
              </span>
            </div>
          </button>

          <button
            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        {/* ── Search ─────────────────────────────────── */}
        <div className="px-3 py-3 flex-shrink-0 relative">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{
              background: searchFocused
                ? "rgba(246,136,38,0.08)"
                : "rgba(255,255,255,0.05)",
              border: searchFocused
                ? "1px solid rgba(246,136,38,0.4)"
                : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              className="flex-1 bg-transparent text-xs outline-none placeholder-gray-200"
              style={{ color: "#fff" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={12} className="text-gray-500 hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && searchFocused && (
            <div
              className="absolute left-3 right-3 top-full mt-1 rounded-xl overflow-hidden z-50 py-1"
              style={{
                background: "#1e2d3d",
                border: "1px solid rgba(246,136,38,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {searchResults.slice(0, 8).map((item) => {
                const SectionIcon = item.sectionIcon;
                return (
                  <button
                    key={item.path}
                    onMouseDown={() => handleSearchSelect(item.path!)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                    style={{ color: "#c8d6e5" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(246,136,38,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {SectionIcon && (
                      <SectionIcon
                        size={13}
                        className="text-gray-500 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.name}
                      </p>
                      {item.section && (
                        <p className="text-[10px] text-gray-600 truncate">
                          {item.section}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && searchFocused && (
            <div
              className="absolute left-3 right-3 top-full mt-1 rounded-xl z-50 px-3 py-3 text-center"
              style={{
                background: "#1e2d3d",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-xs text-gray-600">
                No results for "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto px-3 pb-3"
          style={{ scrollbarWidth: "none" }}
        >
          <style>{`
            nav::-webkit-scrollbar { display: none; }
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .submenu-enter { animation: slideDown 0.18s ease-out forwards; }
          `}</style>

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;
              const isOpen = openMenus.includes(item.name);
              const hasActive = sectionHasActiveChild(item, location.pathname);
              // const isDashboard = item.path === "/dashboard";

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    // ── Parent button ──
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-all group"
                      style={{
                        background:
                          isOpen || hasActive
                            ? "rgba(246,136,38,0.12)"
                            : "transparent",
                        color: isOpen || hasActive ? "#f68826" : "#fff",
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen && !hasActive)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen && !hasActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background:
                                isOpen || hasActive
                                  ? "rgba(246,136,38,0.2)"
                                  : "rgba(255,255,255,0.06)",
                            }}
                          >
                            <Icon size={14} />
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasActive && !isOpen && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#f68826" }}
                          />
                        )}
                        <ChevronDown
                          size={13}
                          className="transition-transform duration-200"
                          style={{
                            transform: isOpen
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </button>
                  ) : (
                    // ── Direct NavLink ──
                    <NavLink
                      to={item.path!}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                      style={({ isActive }) => ({
                        background: isActive
                          ? "rgba(246,136,38,0.15)"
                          : "transparent",
                        color: isActive ? "#f68826" : "#fff",
                      })}
                      onMouseEnter={(e) => {
                        const isActive = location.pathname === item.path;
                        if (!isActive)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        const isActive = location.pathname === item.path;
                        if (!isActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {Icon && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              location.pathname === item.path
                                ? "rgba(246,136,38,0.2)"
                                : "rgba(255,255,255,0.06)",
                          }}
                        >
                          <Icon size={14} />
                        </div>
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                    </NavLink>
                  )}

                  {/* ── Children ── */}
                  {hasChildren && isOpen && (
                    <div className="submenu-enter mt-0.5 mb-1 ml-3 space-y-0.5">
                      {/* Vertical guide line */}
                      <div
                        className="relative pl-4"
                        style={{
                          borderLeft: "1px solid rgba(246,136,38,0.15)",
                        }}
                      >
                        {item.children!.map((child) => {
                          const isChildActive =
                            location.pathname === child.path ||
                            (child.path !== "/" &&
                              location.pathname.startsWith(child.path!));
                          const isExternal = child.path?.startsWith("http");

                          if (isExternal) {
                            return (
                              <a
                                key={child.path}
                                href={child.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                                style={{ color: "#64748b" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#f68826";
                                  e.currentTarget.style.background =
                                    "rgba(246,136,38,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#64748b";
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full flex-shrink-0"
                                  style={{ background: "currentColor" }}
                                />
                                {child.name}
                                <span className="ml-auto text-[9px] opacity-50">
                                  ↗
                                </span>
                              </a>
                            );
                          }

                          return (
                            <NavLink
                              key={child.path}
                              to={child.path!}
                              onClick={() => setSidebarOpen(false)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                              style={{
                                color: isChildActive ? "#f68826" : "#fff",
                                background: isChildActive
                                  ? "rgba(246,136,38,0.08)"
                                  : "transparent",
                                fontWeight: isChildActive ? 600 : 400,
                              }}
                              // onMouseEnter={(e) => {
                              //   if (!isChildActive) {
                              //     e.currentTarget.style.color = "#cbd5e1";
                              //     e.currentTarget.style.background =
                              //       "rgba(255,255,255,0.07)";
                              //   }
                              // }}
                              // onMouseLeave={(e) => {
                              //   if (!isChildActive) {
                              //     e.currentTarget.style.color = "#64748b";
                              //     e.currentTarget.style.background =
                              //       "transparent";
                              //   }
                              // }}
                            >
                              <span
                                className="w-1 h-1 rounded-full flex-shrink-0 transition-all"
                                style={{
                                  background: isChildActive
                                    ? "#f68826"
                                    : "currentColor",
                                  transform: isChildActive
                                    ? "scale(1.5)"
                                    : "scale(1)",
                                }}
                              />
                              {child.name}
                              {isChildActive && (
                                <span
                                  className="ml-auto w-1 h-4 rounded-full"
                                  style={{
                                    background: "#f68826",
                                    opacity: 0.6,
                                  }}
                                />
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── Footer ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-3 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* User profile stub */}
          {/* <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-2 cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
            }
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(246,136,38,0.2)", color: "#f68826" }}
            >
              U
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "#e2e8f0" }}
              >
                Admin User
              </p>
              <p className="text-[10px] truncate" style={{ color: "#475569" }}>
                Super Admin
              </p>
            </div>
            <LogOut size={13} className="text-gray-600 flex-shrink-0" />
          </div> */}

          <p
            className="text-center text-[10px]"
            style={{ color: "#fff", fontFamily: "'Montserrat', sans-serif" }}
          >
            © {new Date().getFullYear()} UniStock
            <span className="ml-1 font-semibold" style={{ color: "#fff" }}>
              Pro
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}
