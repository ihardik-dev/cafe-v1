import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { ProfilePage } from './ProfilePage';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import type { User } from '@/types/api';

const mockCustomer: User = {
  id: 'cust-123',
  name: 'Maya Sharma',
  email: 'maya@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-02-15T10:30:00.000Z',
  updatedAt: '2026-02-15T10:30:00.000Z',
};

const mockAdmin: User = {
  id: 'admin-123',
  name: 'Cafe Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T08:00:00.000Z',
  updatedAt: '2026-01-01T08:00:00.000Z',
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderProfilePage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('ProfilePage component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('renders customer profile information and member details', async () => {
    vi.spyOn(authApi, 'getOwnProfile').mockResolvedValue(mockCustomer);
    useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Maya Sharma' })).toBeInTheDocument();
      expect(screen.getByText('maya@example.com')).toBeInTheDocument();
      expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
      expect(screen.getByText(/15 February 2026/i)).toBeInTheDocument();
    });
  });

  it('renders admin management shortcut card when user is an administrator', async () => {
    vi.spyOn(authApi, 'getOwnProfile').mockResolvedValue(mockAdmin);
    useAuthStore.getState().setAuth(mockAdmin, 'admin-token');

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cafe Admin' })).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText(/admin control center/i)).toBeInTheDocument();
    });
  });

  it('logs out cleanly and navigates away when Sign out button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'getOwnProfile').mockResolvedValue(mockCustomer);
    const logoutSpy = vi.spyOn(authApi, 'logoutUser').mockResolvedValue();
    useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });
});

