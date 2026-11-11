import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { LoginPage } from './LoginPage';
import * as authApi from '@/api/auth';
import { useAuthStore } from '@/features/auth/authStore';
import { ApiError } from '@/types/api';

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home Destination</div>} />
          <Route path="/checkout" element={<div>Checkout Destination</div>} />
          <Route path="/admin" element={<div>Admin Destination</div>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('LoginPage component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    useAuthStore.getState().clearAuth();
  });

  it('renders login form with accessible labels and inputs', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('toggles password visibility with accessible button', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('displays session expired alert when expired flag is present in query parameters', () => {
    renderLoginPage(['/login?expired=1']);

    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
  });

  it('shows inline validation error on blur when invalid email is entered', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('displays form-level alert on 401 invalid credentials error', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'loginCustomer').mockRejectedValue(
      new ApiError(401, 'Invalid email or password'),
    );

    renderLoginPage();

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'WrongPass123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password\. please verify your credentials/i),
      ).toBeInTheDocument();
    });
  });

  it('logs user in successfully and sets authentication in store', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'loginCustomer').mockResolvedValue({
      token: 'valid-jwt',
      user: {
        id: 'u-1',
        name: 'Maya Sharma',
        email: 'maya@example.com',
        role: 'CUSTOMER',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/email address/i), 'maya@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(screen.getByText('Home Destination')).toBeInTheDocument();
    });
  });
});

