import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Create ProtectedRoute component.
// If user not logged in (no user in AuthContext), navigate to /login.
// Otherwise render children.

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
