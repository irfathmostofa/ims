"use client";

import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, X } from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "POS", path: "/pos", icon: ShoppingCart },
  { name: "Customers", path: "/customers", icon: Users },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
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
        <div className="h-16 flex items-center justify-between border-b border-bw-200 px-4">
          <h1 className="text-xl font-bold text-bw-50">InventorySys</h1>
          {/* Close button (mobile only) */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-bw-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-bw-50" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-bw-700 text-bw-50 font-medium"
                      : "text-bw-100 hover:bg-bw-700 hover:text-bw-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)} // closes after navigation
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-bw-200 text-sm text-bw-500">
          © {new Date().getFullYear()} InventorySys
        </div>
      </aside>
    </>
  );
}
