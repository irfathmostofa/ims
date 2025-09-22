import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";

export function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient(
          `${import.meta.env.VITE_SERVER}/auth/profile`,
          {
            method: "GET",
            tokenType: "jwt",
          }
        );
        setAuthenticated(true);
        console.log("Profile:", data);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-t-[#111827] border-gray-300 rounded-full animate-spin"></div>
          {/* Text */}
          <p className="text-gray-600 text-lg font-medium">
            Checking authentication...
          </p>
        </div>
        ;
      </>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/" replace />;
}
