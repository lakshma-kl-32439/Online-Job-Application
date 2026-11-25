import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Forbidden from '../pages/Forbidden';

/**
 * Guards a group of routes.
 *  - Not logged in            -> redirect to /login (remembers where they were going)
 *  - Logged in, wrong role    -> 403 screen
 *  - Otherwise                -> render the nested routes
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Forbidden allowed={roles} />;
  }
  return <Outlet />;
}

/** Login / sign up pages: send signed-in people straight to their dashboard. */
export function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
