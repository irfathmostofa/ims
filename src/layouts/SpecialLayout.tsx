import { Outlet } from "react-router-dom";

export default function SpecialLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#111827] ">
      <div className="max-w-lg text-center text-amber-50">
        <Outlet />
      </div>
    </div>
  );
}
