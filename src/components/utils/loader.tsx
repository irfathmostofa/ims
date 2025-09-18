"use client";

import { Loader2 } from "lucide-react";

type LoaderProps = {
  variant?: "fullscreen" | "inline";
  message?: string;
  color?: string; // optional color
  size?: number; // optional icon size
};

export default function Loader({
  variant = "inline",
  message,
  color = "text-indigo-600",
  size = 40,
}: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`animate-spin ${color}`} size={size} />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex justify-center py-6">{content}</div>;
}
