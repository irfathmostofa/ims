// components/RoleBasedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface RoleBasedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export function RoleBasedRoute({
  allowedRoles = [],
  children,
}: RoleBasedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // If no user but has token, still loading (let PrivateRoute handle)
  if (!user && token) {
    // Return null or loading state, PrivateRoute will handle the redirect
    return null;
  }

  // If no user at all, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role access
  const hasRoleAccess =
    allowedRoles.length === 0 || allowedRoles.includes(user.role.name);

  if (!hasRoleAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
