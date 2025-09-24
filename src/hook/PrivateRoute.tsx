import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";
import { useAuthStore } from "@/store/authStore";

export function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // ✅ Get token from Zustand store
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile using token from Zustand
        const data = await apiClient(
          `${import.meta.env.VITE_SERVER}/auth/profile`,
          {
            method: "GET",
            tokenType: "jwt", // apiClient will pick token from Zustand if configured
          }
        );

        setUser(data.data); // store user info in Zustand
        setAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        useAuthStore.getState().logout(); // clear token & user
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token, setUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-t-[#111827] border-gray-300 rounded-full animate-spin"></div>
        {/* Text */}
        <p className="text-gray-600 text-lg font-medium">
          Checking authentication...
        </p>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/" replace />;
}
