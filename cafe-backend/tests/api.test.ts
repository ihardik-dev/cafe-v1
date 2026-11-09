import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../src/generated/prisma/client.js';
import type { AppConfig } from '../src/config.js';
import { buildApp } from '../src/app.js';

const config: AppConfig = {
  NODE_ENV: 'test', HOST: '127.0.0.1', PORT: 4000,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-secret-that-is-at-least-thirty-two-characters-long',
  ADMIN_NAME: 'Cafe Admin', ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'admin-password-123', LOG_LEVEL: 'silent',
};

const apps: Array<Awaited<ReturnType<typeof buildApp>>> = [];

async function makeApp() {
  const db = {
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: { data: { id?: string; name: string; email: string; role: string } }) => ({
        id: data.id ?? 'user-1', name: data.name, email: data.email, role: data.role, createdAt: new Date(),
      })),
    },
    category: { findMany: vi.fn().mockResolvedValue([]) },
    menuItem: { findMany: vi.fn().mockResolvedValue([]) },
  } as unknown as PrismaClient;
  const app = await buildApp({ db, config, logger: false });
  await app.ready();
  apps.push(app);
  return { app, db };
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe('API authentication and role protection', () => {
  it('rejects access to a protected profile without a JWT', async () => {
    const { app } = await makeApp();
    const response = await app.inject({ method: 'GET', url: '/api/v1/users/me' });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ success: false, message: 'Authentication required' });
  });

  it('prevents a CUSTOMER from accessing admin menu endpoints', async () => {
    const { app, db } = await makeApp();
    const token = app.jwt.sign({ sub: 'customer-1', email: 'customer@example.com', role: 'CUSTOMER' });
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/menu-items', headers: { authorization: `Bearer ${token}` } });
    expect(response.statusCode).toBe(403);
    expect((db.menuItem.findMany as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it('allows an ADMIN to list menu items, but only through the protected menu endpoint', async () => {
    const { app, db } = await makeApp();
    const token = app.jwt.sign({ sub: 'admin-1', email: 'admin@example.com', role: 'ADMIN' });
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/menu-items', headers: { authorization: `Bearer ${token}` } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true, data: { items: [] } });
    expect(db.menuItem.findMany).toHaveBeenCalledOnce();
  });

  it('does not allow public registration to select ADMIN role', async () => {
    const { app, db } = await makeApp();
    const response = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { name: 'Bad Actor', email: 'bad@example.com', password: 'password-123', role: 'ADMIN' },
    });
    expect(response.statusCode).toBe(400);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('allows guest menu browsing without authentication', async () => {
    const { app, db } = await makeApp();
    const response = await app.inject({ method: 'GET', url: '/api/v1/categories' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true, data: { categories: [] } });
    expect(db.category.findMany).toHaveBeenCalledOnce();
  });

  it('requires authentication before creating orders or reservations', async () => {
    const { app } = await makeApp();
    const order = await app.inject({ method: 'POST', url: '/api/v1/orders', payload: { items: [{ menuItemId: '11111111-1111-4111-8111-111111111111', quantity: 1 }] } });
    const reservation = await app.inject({ method: 'POST', url: '/api/v1/reservations', payload: { reservationDateTime: '2027-01-15T19:30', guestCount: 2 } });
    expect(order.statusCode).toBe(401);
    expect(reservation.statusCode).toBe(401);
  });

  it('does not grant ADMIN access to customer order or reservation endpoints', async () => {
    const { app } = await makeApp();
    const token = app.jwt.sign({ sub: 'admin-1', email: 'admin@example.com', role: 'ADMIN' });
    const headers = { authorization: `Bearer ${token}` };
    const orders = await app.inject({ method: 'GET', url: '/api/v1/orders', headers });
    const reservations = await app.inject({ method: 'GET', url: '/api/v1/reservations', headers });
    expect(orders.statusCode).toBe(403);
    expect(reservations.statusCode).toBe(403);
  });
});
