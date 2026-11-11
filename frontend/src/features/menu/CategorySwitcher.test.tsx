import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySwitcher } from './CategorySwitcher';
import type { Category } from '@/types/api';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Hot Coffee', createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'Cold Brews', createdAt: '', updatedAt: '' },
  { id: 'cat-3', name: 'Bakery', createdAt: '', updatedAt: '' },
];

describe('CategorySwitcher component', () => {
  it('renders "All Items" chip along with all passed categories', () => {
    const onSelect = vi.fn();
    render(
      <CategorySwitcher
        categories={mockCategories}
        activeCategoryId="all"
        onSelectCategory={onSelect}
      />,
    );

    expect(screen.getByRole('tab', { name: 'All Items' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Hot Coffee' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cold Brews' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bakery' })).toBeInTheDocument();
  });

  it('indicates active tab via aria-selected', () => {
    const onSelect = vi.fn();
    render(
      <CategorySwitcher
        categories={mockCategories}
        activeCategoryId="cat-2"
        onSelectCategory={onSelect}
      />,
    );

    const activeTab = screen.getByRole('tab', { name: 'Cold Brews' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');

    const inactiveTab = screen.getByRole('tab', { name: 'Hot Coffee' });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('triggers onSelectCategory callback when chip is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CategorySwitcher
        categories={mockCategories}
        activeCategoryId="all"
        onSelectCategory={onSelect}
      />,
    );

    const bakeryTab = screen.getByRole('tab', { name: 'Bakery' });
    await user.click(bakeryTab);

    expect(onSelect).toHaveBeenCalledWith('cat-3');
  });
});
