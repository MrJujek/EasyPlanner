import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContextType';

export const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};