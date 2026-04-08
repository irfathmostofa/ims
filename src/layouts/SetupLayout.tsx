import { Outlet } from "react-router-dom";

export default function SetupLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003333] via-[#002222] to-[#001a1a]">
      {/* Animated background dots */}

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Right Side - Login Form */}
        <div className="w-full flex items-center justify-center px-8">
          <div className="w-full max-w-5xl animate-slideLeft">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Only login form */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center px-4">
        {/* Mobile Brand Header - Minimal */}

        {/* Login Form Only */}
        <div className="w-full max-w-md animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
