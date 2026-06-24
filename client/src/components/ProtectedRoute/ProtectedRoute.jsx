import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // wait for session resolution before redirecting
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}
