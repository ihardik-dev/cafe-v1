import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../plugins/auth.js';
import { adminOnly } from '../admin/authorization.js';
import {
  createMenuItemController,
  deleteMenuItemController,
  getPublicMenuItemController,
  listAdminMenuController,
  listPublicMenuController,
  updateMenuItemController,
} from './controller.js';

const menuRoutes: FastifyPluginAsync = async (app) => {
  app.get('/menu', {
    schema: {
      tags: ['Menu'], summary: 'Browse available menu items',
      querystring: { type: 'object', additionalProperties: false, properties: { categoryId: { type: 'string', format: 'uuid' } } },
    },
  }, listPublicMenuController);

  app.get('/menu/:id', {
    schema: { tags: ['Menu'], summary: 'Get an available menu item', params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, getPublicMenuItemController);

  app.get('/admin/menu-items', {
    preHandler: [authenticate, adminOnly],
    schema: { tags: ['Admin - Menu'], summary: 'List all menu items including unavailable items', security: [{ bearerAuth: [] }] },
  }, listAdminMenuController);

  app.post('/admin/menu-items', {
    preHandler: [authenticate, adminOnly],
    schema: {
      tags: ['Admin - Menu'], summary: 'Create a menu item', security: [{ bearerAuth: [] }],
      body: { type: 'object', additionalProperties: false, required: ['name', 'description', 'price', 'image', 'categoryId'], properties: { name: { type: 'string', minLength: 1 }, description: { type: 'string', minLength: 1 }, price: { type: 'number', exclusiveMinimum: 0 }, image: { type: 'string', minLength: 1 }, categoryId: { type: 'string', format: 'uuid' }, availability: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE'] } } },
    },
  }, createMenuItemController);

  app.patch('/admin/menu-items/:id', {
    preHandler: [authenticate, adminOnly],
    schema: {
      tags: ['Admin - Menu'], summary: 'Edit a menu item, price or availability', security: [{ bearerAuth: [] }],
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      body: { type: 'object', minProperties: 1, additionalProperties: false, properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number', exclusiveMinimum: 0 }, image: { type: 'string' }, categoryId: { type: 'string', format: 'uuid' }, availability: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE'] } } },
    },
  }, updateMenuItemController);

  app.delete('/admin/menu-items/:id', {
    preHandler: [authenticate, adminOnly],
    schema: { tags: ['Admin - Menu'], summary: 'Permanently delete a menu item', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, deleteMenuItemController);
};

export default menuRoutes;
