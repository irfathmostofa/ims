"use client";

import { NavLink } from "react-router-dom";
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
  ChevronRight,
  X,
  Globe2,
  ShoppingBag,
  SendToBack,
} from "lucide-react";
import { useState } from "react";

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
      { name: "Unit of mesurment", path: "/inventory/units" },
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
      // { name: "Returns / Refunds", path: "/sales/returns-list" },
      // { name: "Hold & Resume", path: "/sales/hold" },
      { name: "Discounts & Promotions", path: "/sales/discounts" },
    ],
  },
  {
    name: "Online Sales",
    icon: ShoppingBag,
    children: [
      { name: "Order List", path: "/order/list" },
      { name: "Order Payment", path: "/order/payment" },
      { name: "Order Tracking", path: "/order/tracking" },
      { name: "Order Return", path: "/order/return" },
      { name: "Coupon Management", path: "/order/coupon" },
      { name: "Logistics", path: "/order/logistics" },
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
      { name: "Transactions", path: "/accounts/transactions" },
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
    name: "Setup",
    icon: Settings,
    children: [
      { name: "Company Info", path: "/setup/company" },
      { name: "Branches", path: "/setup/branches" },
      { name: "Payment Method", path: "/setup/payment-methods" },
      { name: "Delivary Method", path: "/setup/delivery-methods" },
      { name: "Roles", path: "/setup/roles" },
      { name: "Users", path: "/setup/users" },
    ],
  },
  {
    name: "Website Setup",
    icon: Globe2,
    children: [
      { name: "Config", path: "/config" },
      { name: "Theme", path: "/theme" },
      { name: "Visit Website", path: "https://inventory-mart.netlify.app/" },
    ],
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-bw-900 shadow-md flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-4">
          <h1
            className="text-4xl font-bold text-bw-50  tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            UniStock
            <span className="text-2xl font-semibold text-[#a1c5c5] ml-1">
              Pro
            </span>
          </h1>
          {/* Close button (mobile only) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-bw-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-bw-50" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto pr-0">
          <div className="p-4 space-y-2 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus.includes(item.name);

              return (
                <div key={item.name}>
                  {/* Parent Link */}
                  <button
                    onClick={() =>
                      hasChildren
                        ? toggleMenu(item.name)
                        : setSidebarOpen(false)
                    }
                    className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-lg transition ${
                      isOpen
                        ? "bg-bw-700 text-bw-50 font-medium"
                        : "text-bw-100 hover:bg-bw-700 hover:text-bw-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={20} />}
                      {item.path ? (
                        <NavLink
                          to={item.path}
                          className="flex-1 text-left"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {item.name}
                        </NavLink>
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </div>
                    {hasChildren &&
                      (isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      ))}
                  </button>

                  {/* Child Links */}
                  {hasChildren && isOpen && (
                    <div className="ml-3 mt-1 space-y-1">
                      {item.children!.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path!}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                              isActive
                                ? "bg-bw-700 text-bw-50 font-medium"
                                : "text-bw-100 hover:bg-bw-700 hover:text-bw-50"
                            }`
                          }
                          onClick={() => setSidebarOpen(false)}
                        >
                          <ChevronRight size={14} className="opacity-60" />
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0 p-4 border-t border-bw-200 text-sm text-bw-200"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          © {new Date().getFullYear()} UniStock
          <span className="text-xs font-semibold text-[#a1c5c5] ml-1">Pro</span>
        </div>
      </aside>

      {/* Add these styles to your global CSS or component */}
    </>
  );
}
