import { Prisma, type PrismaClient } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import { decimalToMinorUnits, minorUnitsToDecimal } from '../../lib/money.js';
import { canCancelOrder, ORDER_CANCELLATION_WINDOW_MS } from '../../lib/time.js';
import type { CreateOrderInput } from './schemas.js';

export async function createOrder(db: PrismaClient, userId: string, input: CreateOrderInput) {
  return db.$transaction(async (tx) => {
    const requestedIds = input.items.map((item) => item.menuItemId);
    const menuItems = await tx.menuItem.findMany({ where: { id: { in: requestedIds } } });
    const byId = new Map(menuItems.map((item) => [item.id, item]));

    const missingIds = requestedIds.filter((id) => !byId.has(id));
    if (missingIds.length > 0) {
      throw new AppError(409, 'One or more menu items no longer exist. Remove them from your cart and try again.', missingIds.map((id) => ({ field: 'items', message: `Menu item ${id} no longer exists` })));
    }

    const unavailableIds = menuItems.filter((item) => item.availability !== 'AVAILABLE').map((item) => item.id);
    if (unavailableIds.length > 0) {
      throw new AppError(409, 'One or more menu items are unavailable. Remove them from your cart and try again.', unavailableIds.map((id) => ({ field: 'items', message: `Menu item ${id} is unavailable` })));
    }

    let totalMinorUnits = 0n;
    const snapshotItems = input.items.map(({ menuItemId, quantity }) => {
      const menuItem = byId.get(menuItemId);
      if (!menuItem) throw new AppError(409, 'A requested menu item could not be found');
      totalMinorUnits += decimalToMinorUnits(menuItem.price) * BigInt(quantity);
      return { itemName: menuItem.name, price: menuItem.price, quantity };
    });

    const totalAmount = new Prisma.Decimal(minorUnitsToDecimal(totalMinorUnits));
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'CONFIRMED',
        items: { create: snapshotItems },
      },
      include: { items: true },
    });
    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function listCustomerOrders(db: PrismaClient, userId: string) {
  return db.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
}

export async function getCustomerOrder(db: PrismaClient, userId: string, id: string) {
  const order = await db.order.findFirst({ where: { id, userId }, include: { items: true } });
  if (!order) throw new AppError(404, 'Order not found');
  return order;
}

export async function cancelCustomerOrder(db: PrismaClient, userId: string, id: string, now = new Date()) {
  const order = await db.order.findFirst({ where: { id, userId }, select: { id: true, status: true, createdAt: true } });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.status !== 'CONFIRMED') throw new AppError(409, 'Only confirmed orders can be cancelled');
  if (!canCancelOrder(order.createdAt, now)) throw new AppError(409, 'The 60-second order cancellation window has expired');

  const cutoff = new Date(now.getTime() - ORDER_CANCELLATION_WINDOW_MS);
  const result = await db.order.updateMany({
    where: { id, userId, status: 'CONFIRMED', createdAt: { gte: cutoff } },
    data: { status: 'CANCELLED' },
  });
  if (result.count !== 1) throw new AppError(409, 'The order can no longer be cancelled');
  return { ...order, status: 'CANCELLED' as const };
}
