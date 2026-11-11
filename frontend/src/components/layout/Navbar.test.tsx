import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from './Navbar';
import { siteConfig } from '@/config/site';
import { useCartStore } from '@/features/cart/cartStore';
import { useAuthStore } from '@/features/auth/authStore';
import * as authApi from '@/api/auth';
import type { User } from '@/types/api';

const mockCustomer: User = {
  id: 'u-cust',
  name: 'Maya Sharma',
  email: 'maya@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockAdmin: User = {
  id: 'u-admin',
  name: 'Cafe Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderNavbar() {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </ToastProvider>,
  );
}

describe('Navbar component (Apple HIG & Section 3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clear();
  });

  it('renders brand link pointing to home with accessible label', () => {
    renderNavbar();
    const brandLink = screen.getByLabelText(`${siteConfig.brandName} home`);
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('renders skip-to-content accessible link', () => {
    renderNavbar();
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('displays cart item badge when items are in cart', () => {
    useCartStore.setState({ itemCount: 3 });
    renderNavbar();
    const cartLink = screen.getByRole('link', { name: /shopping cart with 3 items/i });
    expect(cartLink).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders "Log in" button when not authenticated', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('opens account dropdown menu when account button is clicked and shows customer links', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

    renderNavbar();

    const accountBtn = screen.getByRole('button', { name: /maya/i });
    expect(accountBtn).toBeInTheDocument();

    await user.click(accountBtn);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('maya@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /my orders/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /my reservations/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /admin dashboard/i })).not.toBeInTheDocument();
  });

  it('renders Admin Dashboard link in account menu when signed in as administrator', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setAuth(mockAdmin, 'admin-token');

    renderNavbar();

    const accountBtn = screen.getByRole('button', { name: /cafe/i });
    await user.click(accountBtn);

    expect(screen.getByRole('menuitem', { name: /admin dashboard/i })).toBeInTheDocument();
  });

  it('logs out and clears authentication when Log out menu item is clicked', async () => {
    const user = userEvent.setup();
    const logoutSpy = vi.spyOn(authApi, 'logoutUser').mockResolvedValue();
    useAuthStore.getState().setAuth(mockCustomer, 'valid-token');

    renderNavbar();

    const accountBtn = screen.getByRole('button', { name: /maya/i });
    await user.click(accountBtn);

    const logoutBtn = screen.getByRole('menuitem', { name: /log out/i });
    await user.click(logoutBtn);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('opens mobile sheet when hamburger is clicked and dismisses with Escape', async () => {
    renderNavbar();
    const menuBtn = screen.getByRole('button', { name: /open mobile navigation menu/i });
    expect(menuBtn).toBeInTheDocument();

    await userEvent.click(menuBtn);
    expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
  });
});
