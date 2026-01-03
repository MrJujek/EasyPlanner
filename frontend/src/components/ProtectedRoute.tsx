import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextType';

export const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};