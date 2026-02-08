// hook/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";
import { useAuthStore } from "@/store/authStore";

export function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      // If we already have user data, no need to fetch again
      if (user) {
        setAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient(
          `${import.meta.env.VITE_SERVER}/auth/profile`,
          {
            method: "GET",
            tokenType: "jwt",
          },
        );
        console.log(data);
        setUser(data.data);
        setAuthenticated(true);
      } catch (err) {
        useAuthStore.getState().logout();
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token, setUser, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-12 h-12 border-4 border-t-[#111827] border-gray-300 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg font-medium">
          Checking authentication...
        </p>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/" replace />;
}
