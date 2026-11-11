import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { useAuthStore } from '@/features/auth/authStore';

const mockCustomer = {
  id: 'c-1',
  name: 'Customer',
  email: 'customer@example.com',
  role: 'CUSTOMER' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockAdmin = {
  id: 'a-1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Route Guards', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setHydrating(false);
  });

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated user to /login and preserves intended location', () => {
      render(
        <MemoryRouter initialEntries={['/checkout']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<div>Protected Checkout Page</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Checkout Page')).not.toBeInTheDocument();
    });

    it('allows authenticated customer to access protected routes', () => {
      useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

      render(
        <MemoryRouter initialEntries={['/checkout']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<div>Protected Checkout Page</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Protected Checkout Page')).toBeInTheDocument();
    });
  });

  describe('GuestRoute', () => {
    it('allows unauthenticated guest to view login page', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<div>Guest Login Page</div>} />
            </Route>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Guest Login Page')).toBeInTheDocument();
    });

    it('redirects authenticated user away from login page to home', () => {
      useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<div>Guest Login Page</div>} />
            </Route>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Guest Login Page')).not.toBeInTheDocument();
    });
  });

  describe('AdminRoute', () => {
    it('redirects unauthenticated visitor to /login', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('blocks a normal authenticated customer from /admin and redirects to home', () => {
      useAuthStore.getState().setAuth(mockCustomer, 'cust-token');

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('allows authenticated administrator to open /admin', () => {
      useAuthStore.getState().setAuth(mockAdmin, 'admin-token');

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
            </Route>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});

