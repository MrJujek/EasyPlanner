import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextType";

export const ProtectedRoute = () => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
