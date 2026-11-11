import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Spinner } from '@/components/ui/Spinner';

export function GuestRoute() {
  const { isAuthenticated, isHydrating } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div
        role="status"
        aria-label="Loading authentication"
        className="flex min-h-[50vh] items-center justify-center p-8"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  const from =
    (location.state as { from?: { pathname: string; search?: string } })?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
