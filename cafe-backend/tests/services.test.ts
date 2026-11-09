import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../src/generated/prisma/client.js';
import { AppError } from '../src/lib/errors.js';
import { hashPassword } from '../src/lib/password.js';
import { registerCustomer, authenticateCustomer } from '../src/modules/auth/service.js';
import { createCategory, deleteCategory, updateCategory } from '../src/modules/categories/service.js';
import { createMenuItem, deleteMenuItem, listPublicMenu, updateMenuItem } from '../src/modules/menu/service.js';
import { cancelCustomerOrder, createOrder, getCustomerOrder, listCustomerOrders } from '../src/modules/orders/service.js';
import { cancelCustomerReservation, createReservation, listCustomerReservations } from '../src/modules/reservations/service.js';

function fakeDb(value: unknown): PrismaClient {
  return value as PrismaClient;
}

describe('order service', () => {
  it('uses database prices, creates a confirmed order, and snapshots item names and prices', async () => {
    const orderCreate = vi.fn(async ({ data }: { data: unknown }) => ({ id: 'order-1', ...data }));
    const transactionClient = {
      menuItem: { findMany: vi.fn().mockResolvedValue([
        { id: 'item-1', name: 'Flat White', price: { toFixed: () => '125.50' }, availability: 'AVAILABLE' },
      ]) },
      order: { create: orderCreate },
    };
    const db = fakeDb({ $transaction: (callback: (tx: typeof transactionClient) => unknown) => callback(transactionClient) });

    const order = await createOrder(db, 'customer-1', {
      items: [{ menuItemId: 'item-1', quantity: 2 }],
    });

    const createArgs = orderCreate.mock.calls[0]?.[0] as { data: { totalAmount: { toFixed: (n: number) => string }; status: string; items: { create: Array<{ itemName: string; price: { toFixed: (n: number) => string }; quantity: number }> } } };
    expect(createArgs.data.totalAmount.toFixed(2)).toBe('251.00');
    expect(createArgs.data.status).toBe('CONFIRMED');
    expect(createArgs.data.items.create).toHaveLength(1);
    expect(createArgs.data.items.create[0]?.itemName).toBe('Flat White');
    expect(createArgs.data.items.create[0]?.price.toFixed(2)).toBe('125.50');
    expect(order).toBeDefined();
  });

  it('rejects a menu item that has been deleted', async () => {
    const tx = { menuItem: { findMany: vi.fn().mockResolvedValue([]) }, order: { create: vi.fn() } };
    const db = fakeDb({ $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) });
    await expect(createOrder(db, 'customer-1', { items: [{ menuItemId: 'gone', quantity: 1 }] }))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('no longer exist') });
  });

  it('rejects a menu item that is unavailable at checkout', async () => {
    const tx = {
      menuItem: { findMany: vi.fn().mockResolvedValue([{ id: 'item-1', name: 'Tea', price: { toFixed: () => '20.00' }, availability: 'UNAVAILABLE' }]) },
      order: { create: vi.fn() },
    };
    const db = fakeDb({ $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) });
    await expect(createOrder(db, 'customer-1', { items: [{ menuItemId: 'item-1', quantity: 1 }] }))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('unavailable') });
  });
});

describe('reservation service', () => {
  it('stores the cafe-local date/time as an Asia/Kolkata instant', async () => {
    const create = vi.fn(async ({ data }: { data: { reservationDateTime: Date } }) => data);
    const db = fakeDb({ reservation: { create } });
    const now = new Date('2027-01-01T00:00:00.000Z');
    const result = await createReservation(db, 'customer-1', { reservationDateTime: '2027-01-15T19:30', guestCount: 3 }, now);
    expect(result.reservationDateTime.toISOString()).toBe('2027-01-15T14:00:00.000Z');
    expect(create).toHaveBeenCalledOnce();
  });

  it('rejects reservations in the past', async () => {
    const db = fakeDb({ reservation: { create: vi.fn() } });
    await expect(createReservation(db, 'customer-1', { reservationDateTime: '2026-12-31T19:30', guestCount: 2 }, new Date('2027-01-01T00:00:00.000Z')))
      .rejects.toBeInstanceOf(AppError);
  });

  it('enforces ownership when finding a reservation to cancel', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const db = fakeDb({ reservation: { findFirst, updateMany: vi.fn() } });
    await expect(cancelCustomerReservation(db, 'customer-1', 'reservation-owned-by-someone-else'))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'reservation-owned-by-someone-else', userId: 'customer-1' } }));
  });
});


describe('authentication services', () => {
  it('rejects duplicate registration before creating a user', async () => {
    const create = vi.fn();
    const db = fakeDb({ user: { findUnique: vi.fn().mockResolvedValue({ id: 'existing' }), create } });
    await expect(registerCustomer(db, { name: 'New User', email: 'same@example.com', password: 'password123' }))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(create).not.toHaveBeenCalled();
  });

  it('hashes a new customer password and assigns CUSTOMER server-side', async () => {
    const create = vi.fn().mockImplementation(async ({ data }: { data: { password: string; role: string } }) => ({ id: 'new', ...data }));
    const db = fakeDb({ user: { findUnique: vi.fn().mockResolvedValue(null), create } });
    const result = await registerCustomer(db, { name: 'New User', email: 'new@example.com', password: 'password123' });
    const data = create.mock.calls[0]?.[0].data as { password: string; role: string };
    expect(data.password).not.toBe('password123');
    expect(data.password.startsWith('$2')).toBe(true);
    expect(data.role).toBe('CUSTOMER');
    expect(result.id).toBe('new');
  });

  it('authenticates only when the bcrypt password matches', async () => {
    const hash = await hashPassword('correct-password');
    const db = fakeDb({ user: { findUnique: vi.fn().mockResolvedValue({ id: 'u1', name: 'Customer', email: 'u@example.com', role: 'CUSTOMER', password: hash }) } });
    await expect(authenticateCustomer(db, { email: 'u@example.com', password: 'correct-password' })).resolves.toMatchObject({ id: 'u1', role: 'CUSTOMER' });
    await expect(authenticateCustomer(db, { email: 'u@example.com', password: 'wrong-password' })).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('category and menu services', () => {
  it('blocks deletion of a category containing menu items', async () => {
    const remove = vi.fn();
    const db = fakeDb({ category: { findUnique: vi.fn().mockResolvedValue({ id: 'c1', _count: { menuItems: 1 } }), delete: remove } });
    await expect(deleteCategory(db, 'c1')).rejects.toMatchObject({ statusCode: 409 });
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes an empty category', async () => {
    const remove = vi.fn().mockResolvedValue({ id: 'c1' });
    const db = fakeDb({ category: { findUnique: vi.fn().mockResolvedValue({ id: 'c1', _count: { menuItems: 0 } }), delete: remove } });
    await expect(deleteCategory(db, 'c1')).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('returns only AVAILABLE items for public menu browsing', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const db = fakeDb({ menuItem: { findMany } });
    await listPublicMenu(db, 'category-1');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { availability: 'AVAILABLE', categoryId: 'category-1' } }));
  });

  it('requires a real category before creating a menu item', async () => {
    const create = vi.fn();
    const db = fakeDb({ category: { findUnique: vi.fn().mockResolvedValue(null) }, menuItem: { create } });
    await expect(createMenuItem(db, { name: 'Coffee', description: 'Cup', price: 10, image: 'image.png', categoryId: 'missing', availability: 'AVAILABLE' }))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(create).not.toHaveBeenCalled();
  });
});

describe('customer ownership and cancellation services', () => {
  it('scopes order history to the authenticated customer', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const db = fakeDb({ order: { findMany } });
    await listCustomerOrders(db, 'customer-1');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'customer-1' } }));
  });

  it('cancels a customer-owned order before the 60-second deadline', async () => {
    const now = new Date('2027-01-01T10:00:30.000Z');
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const db = fakeDb({ order: {
      findFirst: vi.fn().mockResolvedValue({ id: 'o1', status: 'CONFIRMED', createdAt: new Date('2027-01-01T10:00:00.000Z') }),
      updateMany,
    } });
    await expect(cancelCustomerOrder(db, 'customer-1', 'o1', now)).resolves.toMatchObject({ status: 'CANCELLED' });
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 'o1', userId: 'customer-1' }) }));
  });

  it('rejects order cancellation after the deadline', async () => {
    const updateMany = vi.fn();
    const db = fakeDb({ order: {
      findFirst: vi.fn().mockResolvedValue({ id: 'o1', status: 'CONFIRMED', createdAt: new Date('2027-01-01T10:00:00.000Z') }),
      updateMany,
    } });
    await expect(cancelCustomerOrder(db, 'customer-1', 'o1', new Date('2027-01-01T10:01:00.001Z')))
      .rejects.toMatchObject({ statusCode: 409 });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('cancels a reservation with exactly 24 hours remaining', async () => {
    const now = new Date('2027-01-01T10:00:00.000Z');
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const db = fakeDb({ reservation: {
      findFirst: vi.fn().mockResolvedValue({ id: 'r1', status: 'CONFIRMED', reservationDateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000) }),
      updateMany,
    } });
    await expect(cancelCustomerReservation(db, 'customer-1', 'r1', now)).resolves.toMatchObject({ status: 'CANCELLED' });
  });

  it('filters reservation history to the customer and requested history type', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const db = fakeDb({ reservation: { findMany } });
    await listCustomerReservations(db, 'customer-1', 'cancelled', new Date('2027-01-01T00:00:00.000Z'));
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'customer-1', status: 'CANCELLED' } }));
  });
});


describe('category and menu management operations', () => {
  it('creates a category', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'c1', name: 'Coffee' });
    const db = fakeDb({ category: { create } });
    await expect(createCategory(db, { name: 'Coffee' })).resolves.toMatchObject({ name: 'Coffee' });
    expect(create).toHaveBeenCalledWith({ data: { name: 'Coffee' } });
  });

  it('edits an existing category', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'c1', name: 'Hot Drinks' });
    const db = fakeDb({ category: { findUnique: vi.fn().mockResolvedValue({ id: 'c1' }), update } });
    await expect(updateCategory(db, 'c1', { name: 'Hot Drinks' })).resolves.toMatchObject({ name: 'Hot Drinks' });
  });

  it('creates a menu item in an existing category', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'm1', name: 'Espresso' });
    const db = fakeDb({ category: { findUnique: vi.fn().mockResolvedValue({ id: 'c1' }) }, menuItem: { create } });
    await expect(createMenuItem(db, { name: 'Espresso', description: 'Coffee', price: 90, image: '/espresso.png', categoryId: 'c1', availability: 'AVAILABLE' }))
      .resolves.toMatchObject({ name: 'Espresso' });
  });

  it('updates a menu item including availability', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'm1', availability: 'UNAVAILABLE' });
    const db = fakeDb({ menuItem: { findUnique: vi.fn().mockResolvedValue({ id: 'm1' }), update } });
    await expect(updateMenuItem(db, 'm1', { availability: 'UNAVAILABLE' })).resolves.toMatchObject({ availability: 'UNAVAILABLE' });
  });

  it('permanently deletes a menu item', async () => {
    const remove = vi.fn().mockResolvedValue({ id: 'm1' });
    const db = fakeDb({ menuItem: { findUnique: vi.fn().mockResolvedValue({ id: 'm1' }), delete: remove } });
    await expect(deleteMenuItem(db, 'm1')).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });
});

describe('order history access', () => {
  it('does not return an order belonging to another customer', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const db = fakeDb({ order: { findFirst } });
    await expect(getCustomerOrder(db, 'customer-1', 'order-2')).rejects.toMatchObject({ statusCode: 404 });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'order-2', userId: 'customer-1' } }));
  });

  it('keeps cancelled orders in the same customer history query', async () => {
    const cancelled = { id: 'order-3', status: 'CANCELLED' };
    const findMany = vi.fn().mockResolvedValue([cancelled]);
    const db = fakeDb({ order: { findMany } });
    const results = await listCustomerOrders(db, 'customer-1');
    expect(results).toContain(cancelled);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'customer-1' } }));
  });
});
