"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Package,
  Warehouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/hook/apiClient";
import { GreetingComp } from "@/hook/greeting";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const token = useAuthStore((state) => state.token);

  const checkCompany = async () => {
    try {
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-companies`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );

      if (data.data && data.data.length > 0) {
        router("/");
      } else {
        router("/setup-wizard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) {
      checkCompany();
    }
  }, []);

  useEffect(() => {
    if (token) {
      router("/dashboard");
    }
  }, [router]);

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = useCallback(
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    [],
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);

      try {
        const loginData = await apiClient(
          `${import.meta.env.VITE_SERVER}/auth/login`,
          {
            method: "POST",
            data: { phone: form.phone, password: form.password },
          },
        );

        setToken(loginData.token);
        setUser(loginData.user);
        toast.success("Login Successful!");
        router("/dashboard");
      } catch (err: any) {
        console.error("Login error:", err);
        toast.error(err.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [form.phone, form.password, loading, setToken, setUser, router],
  );

  const formFields = useMemo(
    () => (
      <div className="space-y-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Smartphone className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange("phone")}
            className="pl-10 h-12 text-gray-900 bg-gray-50/80 border-gray-300 focus:border-[#111827] focus:ring-[#111827] rounded-lg"
            required
            disabled={loading}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
            className="pl-10 pr-10 h-12 text-gray-900 bg-gray-50/80 border-gray-300 focus:border-[#111827] focus:ring-[#111827] rounded-lg"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        </div>
      </div>
    ),
    [form, showPassword, loading, handleChange],
  );

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden">
        <Card className="w-full shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            {/* Software Logo and Name - Option 1: Modern */}
            <div className="flex flex-col items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-[#111827] to-[#003333] rounded-xl mb-3">
                <Warehouse className="h-8 w-8 text-white" />
              </div>
              <h1
                className="text-4xl font-bold text-[#111827] tracking-tight"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                UniStock
                <span className="text-2xl font-semibold text-[#003333] ml-1">
                  Pro
                </span>
              </h1>
              <p
                className="text-gray-500 text-sm mt-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Inventory Management
              </p>
            </div>

            {/* Greeting */}
            <div className="text-center space-y-1">
              <p className="text-gray-500 text-sm">
                <GreetingComp />
              </p>
              <h3
                className="text-lg font-medium text-gray-700"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Access your inventory dashboard
              </h3>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {formFields}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#111827] to-[#003333] hover:from-[#003333] hover:to-[#111827] text-white text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-sm transform transition-all duration-300 hover:shadow-3xl">
          {/* Card Header with Software Name */}
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-gradient-to-br from-[#111827] to-[#003333] rounded-2xl shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <h1
                  className="text-5xl font-bold text-[#111827] tracking-tight"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  UniStock
                  <span className="text-3xl font-semibold text-[#003333] ml-2">
                    Pro
                  </span>
                </h1>
                <p
                  className="text-gray-500 text-lg mt-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Enterprise Inventory Solution
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Greeting Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <p
                  className="text-gray-500 text-sm"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <GreetingComp />
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <h2
                className="text-2xl font-semibold text-gray-800 text-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Sign in to your account
              </h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {formFields}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#111827] to-[#003333] hover:from-[#003333] hover:to-[#111827] text-white text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Securing Access...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Secure Login
                  </span>
                )}
              </Button>
            </form>

            {/* Footer Note */}
            <div className="pt-6 border-t border-gray-200">
              <p
                className="text-center text-xs text-gray-500"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                © {new Date().getFullYear()} UniStock Pro • Professional
                Inventory Management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
