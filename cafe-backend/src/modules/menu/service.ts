import type { PrismaClient } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import type { z } from 'zod';
import type { menuItemCreateSchema, menuItemUpdateSchema } from './schemas.js';

type MenuItemCreate = z.infer<typeof menuItemCreateSchema>;
type MenuItemUpdate = z.infer<typeof menuItemUpdateSchema>;

export async function listPublicMenu(db: PrismaClient, categoryId?: string) {
  return db.menuItem.findMany({
    where: { availability: 'AVAILABLE', ...(categoryId ? { categoryId } : {}) },
    include: { category: true },
    orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
  });
}

export async function getPublicMenuItem(db: PrismaClient, id: string) {
  const item = await db.menuItem.findFirst({ where: { id, availability: 'AVAILABLE' }, include: { category: true } });
  if (!item) throw new AppError(404, 'Available menu item not found');
  return item;
}

export async function listAdminMenu(db: PrismaClient) {
  return db.menuItem.findMany({ include: { category: true }, orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }] });
}

export async function createMenuItem(db: PrismaClient, input: MenuItemCreate) {
  const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  if (!category) throw new AppError(404, 'Category not found');
  return db.menuItem.create({ data: input, include: { category: true } });
}

export async function updateMenuItem(db: PrismaClient, id: string, input: MenuItemUpdate) {
  const item = await db.menuItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) throw new AppError(404, 'Menu item not found');

  if (input.categoryId !== undefined) {
    const category = await db.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) throw new AppError(404, 'Category not found');
  }

  return db.menuItem.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.availability !== undefined ? { availability: input.availability } : {}),
    },
    include: { category: true },
  });
}

export async function deleteMenuItem(db: PrismaClient, id: string) {
  const item = await db.menuItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) throw new AppError(404, 'Menu item not found');
  await db.menuItem.delete({ where: { id } });
}
