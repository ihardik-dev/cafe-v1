import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { RegisterPage } from './RegisterPage';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import { ApiError } from '@/types/api';

function renderRegisterPage(initialEntries = ['/register']) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div>Login Page Destination</div>} />
          <Route path="/" element={<div>Home Destination</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('RegisterPage component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('renders registration form with required inputs and accessible labels', () => {
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
  });

  it('validates minimum password length on blur', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/^password/i);
    await user.type(passwordInput, 'short');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('maps 409 duplicate email conflict to the email field error', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'registerCustomer').mockRejectedValue(
      new ApiError(409, 'An account with this email already exists'),
    );

    renderRegisterPage();

    await user.type(screen.getByLabelText(/full name/i), 'Maya Sharma');
    await user.type(screen.getByLabelText(/email address/i), 'maya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
    await user.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() => {
      expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('successfully creates account, automatically logs in, and navigates home', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'registerCustomer').mockResolvedValue({
      id: 'u-new',
      name: 'Maya Sharma',
      email: 'maya@example.com',
      role: 'CUSTOMER',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });

    vi.spyOn(authApi, 'loginCustomer').mockResolvedValue({
      token: 'jwt-new-user',
      user: {
        id: 'u-new',
        name: 'Maya Sharma',
        email: 'maya@example.com',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/full name/i), 'Maya Sharma');
    await user.type(screen.getByLabelText(/email address/i), 'maya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
    await user.click(screen.getByRole('button', { name: /^create account$/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(screen.getByText('Home Destination')).toBeInTheDocument();
    });
  });
});
