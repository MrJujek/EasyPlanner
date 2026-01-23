import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextType";
import { BottomNavbar } from "./BottomNavbar";
import { Header } from "./Header";

export const ProtectedRoute = () => {
  const { token, user, logout } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <Header username={user?.username || "User"} logout={logout} />
      <Outlet />
      <BottomNavbar />
    </div>
  );
};
