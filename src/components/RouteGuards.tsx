import { Navigate, Outlet } from "react-router-dom";

export function PrivateRoute() {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
