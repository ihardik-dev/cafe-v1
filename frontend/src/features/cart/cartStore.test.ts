import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cartStore';

describe('useCartStore Zustand store', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('starts with an empty cart and zero totalQuantity', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.totalQuantity).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it('adds a new item and calculates totalQuantity correctly', () => {
    useCartStore.getState().add({
      menuItemId: 'item-1',
      name: 'Artisan Espresso',
      price: '220.00',
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.name).toBe('Artisan Espresso');
    expect(state.items[0]?.quantity).toBe(1);
    expect(state.totalQuantity).toBe(1);
  });

  it('increments quantity when adding the same item, capped at 10', () => {
    const item = {
      menuItemId: 'item-1',
      name: 'Artisan Espresso',
      price: '220.00',
    };

    useCartStore.getState().add(item, 5);
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);

    // Add 8 more - should clamp to 10
    useCartStore.getState().add(item, 8);
    expect(useCartStore.getState().items[0]?.quantity).toBe(10);
    expect(useCartStore.getState().totalQuantity).toBe(10);
  });

  it('clamps setQuantity strictly between 1 and 10, removing on <= 0', () => {
    useCartStore.getState().add({
      menuItemId: 'item-1',
      name: 'Artisan Espresso',
      price: '220.00',
    });

    // Clamp over 10
    useCartStore.getState().setQuantity('item-1', 15);
    expect(useCartStore.getState().items[0]?.quantity).toBe(10);

    // Set to 5
    useCartStore.getState().setQuantity('item-1', 5);
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);

    // Set to 0 removes item
    useCartStore.getState().setQuantity('item-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalQuantity).toBe(0);
  });

  it('removes an item by menuItemId', () => {
    useCartStore.getState().add({
      menuItemId: 'item-1',
      name: 'Item 1',
      price: '100',
    });
    useCartStore.getState().add({
      menuItemId: 'item-2',
      name: 'Item 2',
      price: '200',
    });

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().totalQuantity).toBe(2);

    useCartStore.getState().remove('item-1');
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.menuItemId).toBe('item-2');
    expect(useCartStore.getState().totalQuantity).toBe(1);
  });

  it('clears all items from the cart', () => {
    useCartStore.getState().add({
      menuItemId: 'item-1',
      name: 'Item 1',
      price: '100',
    });
    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().totalQuantity).toBe(0);
  });
});
