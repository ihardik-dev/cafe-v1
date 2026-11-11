import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Spinner } from '@/components/ui/Spinner';

export function AdminRoute() {
  const { isAuthenticated, isAdmin, isHydrating } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div
        role="status"
        aria-label="Loading admin authorization"
        className="flex min-h-[50vh] items-center justify-center p-8"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
