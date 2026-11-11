import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  categoryName?: string;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  itemCount: number;

  // Primary API as specified in Phase 4 task 3
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;

  // Compatibility aliases
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const calculateTotal = (items: CartItem[]) =>
        items.reduce((sum, item) => sum + item.quantity, 0);

      const addHandler = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.menuItemId === item.menuItemId);

        let updated: CartItem[];
        if (existingIndex > -1) {
          const existing = items[existingIndex]!;
          const newQty = Math.min(10, Math.max(1, existing.quantity + quantity));
          updated = items.map((i, idx) => (idx === existingIndex ? { ...i, quantity: newQty } : i));
        } else {
          const clampedQty = Math.min(10, Math.max(1, quantity));
          updated = [...items, { ...item, quantity: clampedQty }];
        }

        const total = calculateTotal(updated);
        set({ items: updated, totalQuantity: total, itemCount: total });
      };

      const setQuantityHandler = (menuItemId: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          const updated = items.filter((i) => i.menuItemId !== menuItemId);
          const total = calculateTotal(updated);
          set({ items: updated, totalQuantity: total, itemCount: total });
          return;
        }

        const clamped = Math.min(10, Math.max(1, quantity));
        const updated = items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: clamped } : i,
        );
        const total = calculateTotal(updated);
        set({ items: updated, totalQuantity: total, itemCount: total });
      };

      const removeHandler = (menuItemId: string) => {
        const { items } = get();
        const updated = items.filter((i) => i.menuItemId !== menuItemId);
        const total = calculateTotal(updated);
        set({ items: updated, totalQuantity: total, itemCount: total });
      };

      const clearHandler = () => {
        set({ items: [], totalQuantity: 0, itemCount: 0 });
      };

      return {
        items: [],
        totalQuantity: 0,
        itemCount: 0,

        add: addHandler,
        setQuantity: setQuantityHandler,
        remove: removeHandler,
        clear: clearHandler,

        // Aliases
        addItem: addHandler,
        removeItem: removeHandler,
        updateQuantity: setQuantityHandler,
        clearCart: clearHandler,
      };
    },
    {
      name: 'cafe_cart_storage',
    },
  ),
);

// Selectors
export const selectTotalQuantity = (state: CartState) => state.totalQuantity;
export const selectCartItems = (state: CartState) => state.items;
export const selectItemInCart = (menuItemId: string) => (state: CartState) =>
  state.items.find((i) => i.menuItemId === menuItemId);
