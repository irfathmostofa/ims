"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/hook/apiClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router("/");
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
        router("/dashboard");
        console.log("Profile:", data);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        router("/");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);
  // ✅ Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/auth/login`,
        {
          method: "POST",
          data: { email, password },
        }
      );

      localStorage.setItem("token", data.token);

      toast.success("Login Successful!");
      router("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0 bg-white/95 backdrop-blur">
      <CardContent className="p-8 space-y-6">
        {/* Greeting */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-500">{greeting}</h2>
          <h1 className="text-3xl font-bold text-[#111827]">Welcome Back</h1>
          <p className="text-gray-500">Login to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative flex items-center">
            <User className="absolute left-3 text-gray-400 w-5 h-5" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 text-black"
              required
            />
          </div>

          {/* Password */}
          {/* Password */}
          <div className="relative flex items-center">
            <Lock className="absolute left-3 text-gray-400 w-5 h-5" />
            <Input
              type={showPassword ? "text" : "password"} // 👈 toggle type
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 text-black" // 👈 add right padding
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#111827] text-white hover:bg-gray-900 text-lg py-6 rounded-xl"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
