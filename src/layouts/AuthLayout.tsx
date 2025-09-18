import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-[#111827] via-gray-900 to-black">
      <Outlet />
    </div>
  );
}
