"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/hook/apiClient";
import { GreetingComp } from "@/hook/greeting";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  const router = useNavigate();

  // ✅ Optimized form handler
  const handleChange = useCallback(
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  // ✅ Combined login and profile fetch
  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);

      try {
        // Single API call for login with profile included
        const loginData = await apiClient(
          `${import.meta.env.VITE_SERVER}/auth/login`,
          {
            method: "POST",
            data: { phone: form.phone, password: form.password },
          }
        );

        // Store both token and user data
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
    [form.phone, form.password, loading, setToken, setUser, router]
  );

  // Memoized form JSX
  const formFields = useMemo(
    () => (
      <div className="space-y-4">
        {/* Phone */}
        <div className="relative flex items-center">
          <User className="absolute left-3 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange("phone")}
            className="pl-10 text-black"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="relative flex items-center">
          <Lock className="absolute left-3 text-gray-400 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
            className="pl-10 pr-10 text-black"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    ),
    [form, showPassword, loading, handleChange]
  );

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur">
      <CardContent className="p-8 space-y-6">
        {/* Greeting */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-500">
            <GreetingComp />
          </h2>
          <h1 className="text-3xl font-bold text-[#111827]">Welcome Back</h1>
          <p className="text-gray-500">Login to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {formFields}

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#111827] text-white hover:bg-gray-900 text-lg py-6 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">Logging in</span>
                <span className="animate-pulse">...</span>
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
