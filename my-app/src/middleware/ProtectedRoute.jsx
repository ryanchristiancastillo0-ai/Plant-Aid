// ============================================================
// ProtectedRoute.jsx
// Middleware that guards all authenticated routes.
// If the user is not logged in, redirects to /auth/login.
// Usage: wrap any protected route in App.jsx with this.
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../pages/Auth/Service/AuthContext';

export default function ProtectedRoute() {
  const { currentUser, userProfile, loading } = useAuth();

  // Still loading Firebase auth state — show spinner
  if (loading || (currentUser && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <span className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-700 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in — render the child route
  return <Outlet />;
}