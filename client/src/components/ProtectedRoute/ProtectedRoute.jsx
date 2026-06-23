import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}
