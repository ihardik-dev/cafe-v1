import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseInput } from '../../lib/validation.js';
import { categoryCreateSchema, categoryIdSchema, categoryUpdateSchema } from './schemas.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from './service.js';

export async function listCategoriesController(request: FastifyRequest) {
  const categories = await listCategories(request.server.db);
  return { success: true, message: 'Categories retrieved successfully', data: { categories } };
}

export async function createCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(categoryCreateSchema, request.body);
  const category = await createCategory(request.server.db, input);
  request.log.info({ categoryId: category.id }, 'Category created');
  return reply.code(201).send({ success: true, message: 'Category created successfully', data: { category } });
}

export async function updateCategoryController(request: FastifyRequest) {
  const { id } = parseInput(categoryIdSchema, request.params);
  const input = parseInput(categoryUpdateSchema, request.body);
  const category = await updateCategory(request.server.db, id, input);
  request.log.info({ categoryId: id }, 'Category updated');
  return { success: true, message: 'Category updated successfully', data: { category } };
}

export async function deleteCategoryController(request: FastifyRequest) {
  const { id } = parseInput(categoryIdSchema, request.params);
  await deleteCategory(request.server.db, id);
  request.log.info({ categoryId: id }, 'Category deleted');
  return { success: true, message: 'Category deleted successfully', data: null };
}
