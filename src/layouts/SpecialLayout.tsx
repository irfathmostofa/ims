import { Outlet } from "react-router-dom";

export default function SpecialLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="max-w-lg text-center">
        <Outlet />
      </div>
    </div>
  );
}
