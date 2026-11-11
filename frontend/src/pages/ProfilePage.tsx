import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getOwnProfile, logoutUser } from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import { useToast } from '@/components/ui/ToastContext';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatInIST } from '@/lib/datetime';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Package,
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { clearAuth, setUser } = useAuthStore();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await getOwnProfile();
      setUser(data);
      return data;
    },
  });

  const handleLogout = async () => {
    await logoutUser();
    clearAuth();
    showToast('You have been logged out.', 'info');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-border-normal bg-surface-primary p-6 sm:p-8 shadow-beautiful-sm space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={64} height={64} />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={16} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subdued">
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl border border-dashed border-border-normal bg-surface-primary/60 p-8 shadow-beautiful-sm">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-base font-bold text-content-primary">Failed to load profile</h2>
          <p className="text-xs text-content-secondary mt-1 mb-6">
            {(error as Error)?.message || 'Unable to retrieve your customer details.'}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border-normal bg-surface-primary p-6 sm:p-8 shadow-beautiful-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-light font-extrabold text-brand-primary text-2xl shadow-beautiful-sm">
              {user.name[0]?.toUpperCase() || <UserIcon className="h-8 w-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-content-primary tracking-tight">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-brand-light text-brand-primary border border-brand-primary/20'
                      : 'bg-surface-secondary text-content-secondary'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="h-3 w-3" /> : null}
                  {user.role}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
                <Mail className="h-3.5 w-3.5 text-content-tertiary" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="h-3.5 w-3.5 text-destructive" />}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              Sign out
            </Button>
          </div>
        </div>

        {/* Member Details */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subdued pt-6">
          <div className="rounded-2xl bg-surface-secondary/50 p-4 border border-border-subdued">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
              Member Since
            </span>
            <p className="text-sm font-semibold text-content-primary mt-1">
              {user.createdAt ? formatInIST(user.createdAt, 'dd MMMM yyyy') : 'Recently joined'}
            </p>
          </div>

          <div className="rounded-2xl bg-surface-secondary/50 p-4 border border-border-subdued">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
              Account Privileges
            </span>
            <p className="text-sm font-semibold text-content-primary mt-1 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand-primary" />
              <span>{isAdmin ? 'Full Roastery Management' : 'Orders & Reservations'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-tertiary px-1">
          Activity & Management
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="group flex items-center justify-between rounded-2xl border border-brand-primary/30 bg-brand-light/30 p-4 shadow-beautiful-sm hover:shadow-beautiful-md hover:bg-brand-light/50 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-content-primary">Admin Control Center</h3>
                  <p className="text-xs text-content-secondary">
                    Manage cafe categories, menu items, and roastery availability
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-primary transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          <Link
            to="/orders"
            className="group flex items-center justify-between rounded-2xl border border-border-normal bg-surface-primary p-4 shadow-beautiful-sm hover:shadow-beautiful-md hover:border-brand-primary/50 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary text-brand-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-content-primary">My Demonstration Orders</h3>
                <p className="text-xs text-content-secondary">
                  Track current drink orders and review past receipt details
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-content-tertiary transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/reservations"
            className="group flex items-center justify-between rounded-2xl border border-border-normal bg-surface-primary p-4 shadow-beautiful-sm hover:shadow-beautiful-md hover:border-brand-primary/50 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary text-brand-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-content-primary">My Table Reservations</h3>
                <p className="text-xs text-content-secondary">
                  Check upcoming bookings and table cancellation rules
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-content-tertiary transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
