import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth-store";

export function PrivateRoute() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
