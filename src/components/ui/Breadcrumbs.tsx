"use client";

import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type BreadcrumbsProps = {
  labelOverrides?: Record<string, string>; // for custom labels
};

export function Breadcrumbs({ labelOverrides = {} }: BreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-gray-600 space-x-1">
      <Link to="/" className="hover:underline text-gray-900">
        Home
      </Link>
      {pathnames.map((segment, index) => {
        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
        const isLast = index === pathnames.length - 1;

        return (
          <span key={routeTo} className="flex items-center space-x-1">
            <ChevronRight size={14} className="text-gray-400" />
            {isLast ? (
              <span className="font-semibold text-gray-400">
                {labelOverrides[segment] || segment}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:underline text-gray-900 capitalize"
              >
                {labelOverrides[segment] || segment}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
