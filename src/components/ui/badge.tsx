import * as React from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "destructive"
  | "warning"
  | "outline"
  | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = ({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) => {
  // Variant styles
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-purple-100 text-purple-800 border border-purple-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    destructive: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    outline: "border border-gray-300 text-gray-700 bg-transparent",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  // Combine classes
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const combinedClasses =
    `${baseClasses} ${variantStyles[variant]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
};
