import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { ScrollToTop } from './ScrollToTop';

// Route-level code splitting via React.lazy
const HomePage = lazy(() => import('@/pages/HomePage'));
const MenuPage = lazy(() => import('@/pages/MenuPage'));
const MenuItemDetailPage = lazy(() => import('@/pages/MenuItemDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const ReservationsPage = lazy(() => import('@/pages/ReservationsPage'));
const NewReservationPage = lazy(() => import('@/pages/NewReservationPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/AdminCategoriesPage'));
const AdminMenuItemsPage = lazy(() => import('@/pages/AdminMenuItemsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[50vh] items-center justify-center p-8"
    >
      <Spinner size="lg" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public / Customer Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<MenuItemDetailPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Customer Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/reservations/new" element={<NewReservationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Guest Auth Layout */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          {/* Admin Protected Layout */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/menu-items" element={<AdminMenuItemsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default AppRoutes;
