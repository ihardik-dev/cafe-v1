import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseInput } from '../../lib/validation.js';
import { menuItemCreateSchema, menuItemParamsSchema, menuItemUpdateSchema, publicMenuQuerySchema } from './schemas.js';
import { createMenuItem, deleteMenuItem, getPublicMenuItem, listAdminMenu, listPublicMenu, updateMenuItem } from './service.js';

export async function listPublicMenuController(request: FastifyRequest) {
  const query = parseInput(publicMenuQuerySchema, request.query);
  const items = await listPublicMenu(request.server.db, query.categoryId);
  return { success: true, message: 'Menu retrieved successfully', data: { items } };
}

export async function getPublicMenuItemController(request: FastifyRequest) {
  const { id } = parseInput(menuItemParamsSchema, request.params);
  const item = await getPublicMenuItem(request.server.db, id);
  return { success: true, message: 'Menu item retrieved successfully', data: { item } };
}

export async function listAdminMenuController(request: FastifyRequest) {
  const items = await listAdminMenu(request.server.db);
  return { success: true, message: 'Menu items retrieved successfully', data: { items } };
}

export async function createMenuItemController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(menuItemCreateSchema, request.body);
  const item = await createMenuItem(request.server.db, input);
  request.log.info({ menuItemId: item.id }, 'Menu item created');
  return reply.code(201).send({ success: true, message: 'Menu item created successfully', data: { item } });
}

export async function updateMenuItemController(request: FastifyRequest) {
  const { id } = parseInput(menuItemParamsSchema, request.params);
  const input = parseInput(menuItemUpdateSchema, request.body);
  const item = await updateMenuItem(request.server.db, id, input);
  request.log.info({ menuItemId: id }, 'Menu item updated');
  return { success: true, message: 'Menu item updated successfully', data: { item } };
}

export async function deleteMenuItemController(request: FastifyRequest) {
  const { id } = parseInput(menuItemParamsSchema, request.params);
  await deleteMenuItem(request.server.db, id);
  request.log.info({ menuItemId: id }, 'Menu item deleted');
  return { success: true, message: 'Menu item deleted successfully', data: null };
}
