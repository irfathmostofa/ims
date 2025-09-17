"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greeting, setGreeting] = useState("");
  const router = useNavigate();

  // ✅ Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Dummy login logic
    if (email === "admin@example.com" && password === "123456") {
      router("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111827] via-gray-900 to-black">
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
            <div className="relative flex items-center">
              <Lock className="absolute left-3  text-gray-400 w-5 h-5" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-black"
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-[#111827] text-white hover:bg-gray-900 text-lg py-6 rounded-xl"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
