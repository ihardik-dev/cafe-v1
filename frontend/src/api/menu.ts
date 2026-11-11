import apiClient from './client';
import type { Category, MenuItem } from '../types/api';

/**
 * Fetch all available categories from the backend.
 * GET /api/v1/categories
 */
export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<{ categories: Category[] }>('/categories');
  const data = res as unknown as { categories: Category[] };
  return data.categories || [];
}

/**
 * Fetch public menu items, optionally filtered by categoryId.
 * GET /api/v1/menu
 */
export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  const res = await apiClient.get<{ items: MenuItem[] }>('/menu', {
    params: categoryId ? { categoryId } : undefined,
  });
  const data = res as unknown as { items: MenuItem[] };
  return data.items || [];
}

/**
 * Fetch a single available menu item by its UUID.
 * GET /api/v1/menu/:id
 */
export async function getMenuItem(id: string): Promise<MenuItem> {
  const res = await apiClient.get<{ item: MenuItem }>(`/menu/${id}`);
  const data = res as unknown as { item: MenuItem };
  return data.item;
}
