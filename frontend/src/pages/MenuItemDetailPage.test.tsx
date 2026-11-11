import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { MenuItemDetailPage } from './MenuItemDetailPage';
import * as menuApi from '@/api/menu';
import { useCartStore } from '@/features/cart/cartStore';
import type { MenuItem } from '@/types/api';

const mockDetailItem: MenuItem = {
  id: 'item-espresso',
  name: 'Single Origin Espresso',
  description: 'Notes of dark cherry, raw honey, and rich cocoa with a clean velvety finish.',
  price: '210.00',
  image: '/products/espresso.jpg',
  availability: 'AVAILABLE',
  categoryId: 'cat-coffee',
  category: { id: 'cat-coffee', name: 'Coffee', createdAt: '', updatedAt: '' },
  createdAt: '',
  updatedAt: '',
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

function renderDetailPage(itemId = 'item-espresso') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={[`/menu/${itemId}`]}>
          <Routes>
            <Route path="/menu/:id" element={<MenuItemDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('MenuItemDetailPage component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.getState().clear();
  });

  it('renders item title, full description, category badge, and formatted price', async () => {
    vi.spyOn(menuApi, 'getMenuItem').mockResolvedValue(mockDetailItem);
    renderDetailPage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Single Origin Espresso', level: 1 }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Notes of dark cherry, raw honey/i)).toBeInTheDocument();
      expect(screen.getByText('₹210.00')).toBeInTheDocument();
      expect(screen.getAllByText('Coffee')).toHaveLength(2);
    });
  });

  it('allows increasing quantity and adding to cart', async () => {
    const user = userEvent.setup();
    vi.spyOn(menuApi, 'getMenuItem').mockResolvedValue(mockDetailItem);
    renderDetailPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart \(1\)/i })).toBeInTheDocument();
    });

    // Increase quantity using Stepper '+' button
    const incBtn = screen.getByRole('button', { name: /increase quantity/i });
    await user.click(incBtn);

    const addBtn = screen.getByRole('button', { name: /add to cart \(2\)/i });
    expect(addBtn).toBeInTheDocument();

    await user.click(addBtn);

    const cart = useCartStore.getState();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(2);
    expect(cart.totalQuantity).toBe(2);
  });

  it('renders a friendly not found empty state when API returns an error', async () => {
    vi.spyOn(menuApi, 'getMenuItem').mockRejectedValue(new Error('Available menu item not found'));
    renderDetailPage('item-non-existent');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /item not found/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to menu/i })).toHaveAttribute('href', '/menu');
    });
  });
});
