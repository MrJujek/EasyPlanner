import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextType";
import { BottomNavbar } from "./BottomNavbar";

export const ProtectedRoute = () => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Outlet />
      <BottomNavbar />
    </div>
  );
};
