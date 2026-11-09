import type { PrismaClient } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import type { z } from 'zod';
import type { categoryCreateSchema, categoryUpdateSchema } from './schemas.js';

type CategoryCreate = z.infer<typeof categoryCreateSchema>;
type CategoryUpdate = z.infer<typeof categoryUpdateSchema>;

export async function listCategories(db: PrismaClient) {
  return db.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(db: PrismaClient, input: CategoryCreate) {
  return db.category.create({ data: input });
}

export async function updateCategory(db: PrismaClient, id: string, input: CategoryUpdate) {
  const exists = await db.category.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new AppError(404, 'Category not found');

  return db.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
    },
  });
}

export async function deleteCategory(db: PrismaClient, id: string) {
  const category = await db.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { menuItems: true } } },
  });
  if (!category) throw new AppError(404, 'Category not found');
  if (category._count.menuItems > 0) throw new AppError(409, 'Cannot delete a category that contains menu items');
  await db.category.delete({ where: { id } });
}
