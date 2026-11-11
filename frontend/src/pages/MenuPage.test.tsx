import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenuPage } from './MenuPage';
import * as menuApi from '@/api/menu';
import type { Category, MenuItem } from '@/types/api';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Espresso Bar', createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'Fresh Bakery', createdAt: '', updatedAt: '' },
];

const mockItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Cortado',
    description: 'Equal parts espresso and warm silky milk.',
    price: '180.00',
    image: '',
    availability: 'AVAILABLE',
    categoryId: 'cat-1',
    category: mockCategories[0],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'item-2',
    name: 'Almond Croissant',
    description: 'Flaky pastry filled with rich almond cream.',
    price: '240.00',
    image: '',
    availability: 'AVAILABLE',
    categoryId: 'cat-2',
    category: mockCategories[1],
    createdAt: '',
    updatedAt: '',
  },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

describe('MenuPage component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders categories and menu items grouped into sections', async () => {
    vi.spyOn(menuApi, 'getCategories').mockResolvedValue(mockCategories);
    vi.spyOn(menuApi, 'getMenuItems').mockResolvedValue(mockItems);

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <BrowserRouter>
          <MenuPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Menu Offerings', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Espresso Bar', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Fresh Bakery', level: 2 })).toBeInTheDocument();
      expect(screen.getByText('Cortado')).toBeInTheDocument();
      expect(screen.getByText('Almond Croissant')).toBeInTheDocument();
    });
  });

  it('renders an empty state when a category has no items', async () => {
    vi.spyOn(menuApi, 'getCategories').mockResolvedValue([
      { id: 'cat-empty', name: 'Seasonal Brews', createdAt: '', updatedAt: '' },
    ]);
    vi.spyOn(menuApi, 'getMenuItems').mockResolvedValue([]);

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <BrowserRouter>
          <MenuPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/no items in this category yet/i)).toBeInTheDocument();
    });
  });
});
