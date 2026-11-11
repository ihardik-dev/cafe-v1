import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MenuItemCard } from './MenuItemCard';
import { useCartStore } from '@/features/cart/cartStore';
import type { MenuItem } from '@/types/api';

const mockItem: MenuItem = {
  id: 'item-123',
  name: 'Caramel Macchiato',
  description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso.',
  price: '280.00',
  image: '/products/cappuccino.jpg',
  availability: 'AVAILABLE',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Hot Coffee', createdAt: '', updatedAt: '' },
  createdAt: '',
  updatedAt: '',
};

function renderCard(item: MenuItem = mockItem) {
  return render(
    <BrowserRouter>
      <MenuItemCard item={item} />
    </BrowserRouter>,
  );
}

describe('MenuItemCard component', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('renders item details, description, and formatted INR price', () => {
    renderCard();
    expect(screen.getByText('Caramel Macchiato')).toBeInTheDocument();
    expect(screen.getByText(/Freshly steamed milk with vanilla/i)).toBeInTheDocument();
    expect(screen.getByText('₹280.00')).toBeInTheDocument();
  });

  it('adds item to cart store when "Add" button is clicked', async () => {
    const user = userEvent.setup();
    renderCard();

    const addBtn = screen.getByRole('button', { name: /add caramel macchiato to cart/i });
    expect(addBtn).toBeInTheDocument();

    await user.click(addBtn);

    const cart = useCartStore.getState();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.menuItemId).toBe('item-123');
    expect(cart.items[0]?.quantity).toBe(1);
  });

  it('renders a Stepper when the item is already present in cart', async () => {
    useCartStore.getState().add({
      menuItemId: 'item-123',
      name: 'Caramel Macchiato',
      price: '280.00',
    });

    renderCard();

    expect(
      screen.getByRole('group', { name: /quantity of caramel macchiato/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveTextContent('1');
    expect(screen.getByText(/1 in cart/i)).toBeInTheDocument();
  });

  it('renders Sold Out and disables button when item is UNAVAILABLE', () => {
    const unavailableItem: MenuItem = {
      ...mockItem,
      availability: 'UNAVAILABLE',
    };

    renderCard(unavailableItem);

    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /unavailable/i });
    expect(btn).toBeDisabled();
  });
});
