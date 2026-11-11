import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { AUTH_TOKEN_KEY } from '@/api/client';
import * as authApi from '@/api/auth';
import type { User } from '@/types/api';

const mockCustomer: User = {
  id: 'user-cust-1',
  name: 'Maya Sharma',
  email: 'maya@example.com',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockAdmin: User = {
  id: 'user-admin-1',
  name: 'Cafe Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clear();
  });

  it('sets authentication state and updates localStorage token', () => {
    useAuthStore.getState().setAuth(mockCustomer, 'test-jwt-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(state.user).toEqual(mockCustomer);
    expect(state.token).toBe('test-jwt-token');
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-jwt-token');
  });

  it('correctly sets isAdmin to true when user has ADMIN role', () => {
    useAuthStore.getState().setAuth(mockAdmin, 'admin-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(true);
    expect(state.user?.role).toBe('ADMIN');
  });

  it('clears authentication and token while strictly preserving cart items', () => {
    // Add item to cart first
    useCartStore.getState().add({
      menuItemId: 'item-1',
      name: 'Espresso',
      price: '210.00',
    });
    expect(useCartStore.getState().totalQuantity).toBe(1);

    // Set auth then clear
    useAuthStore.getState().setAuth(mockCustomer, 'test-jwt-token');
    useAuthStore.getState().clearAuth();

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();
    expect(authState.token).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();

    // Verify cart was preserved
    const cartState = useCartStore.getState();
    expect(cartState.items).toHaveLength(1);
    expect(cartState.totalQuantity).toBe(1);
  });

  it('initializes and hydrates user profile if valid token exists in storage', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'valid-token');
    vi.spyOn(authApi, 'getOwnProfile').mockResolvedValue(mockCustomer);

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockCustomer);
    expect(state.isHydrating).toBe(false);
  });

  it('clears session when hydration fails due to invalid/expired token', async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'expired-token');
    vi.spyOn(authApi, 'getOwnProfile').mockRejectedValue(new Error('Unauthorized'));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(state.isHydrating).toBe(false);
  });
});

