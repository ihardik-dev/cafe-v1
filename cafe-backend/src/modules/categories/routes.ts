import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../plugins/auth.js';
import { adminOnly } from '../admin/authorization.js';
import { createCategoryController, deleteCategoryController, listCategoriesController, updateCategoryController } from './controller.js';

const categoryRoutes: FastifyPluginAsync = async (app) => {
  app.get('/categories', { schema: { tags: ['Categories'], summary: 'List menu categories' } }, listCategoriesController);

  app.post('/admin/categories', {
    preHandler: [authenticate, adminOnly],
    schema: { tags: ['Admin - Categories'], summary: 'Create a category', security: [{ bearerAuth: [] }], body: { type: 'object', additionalProperties: false, required: ['name'], properties: { name: { type: 'string', minLength: 1, maxLength: 80 } } } },
  }, createCategoryController);

  app.patch('/admin/categories/:id', {
    preHandler: [authenticate, adminOnly],
    schema: { tags: ['Admin - Categories'], summary: 'Edit a category', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } }, body: { type: 'object', minProperties: 1, additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 80 } } } },
  }, updateCategoryController);

  app.delete('/admin/categories/:id', {
    preHandler: [authenticate, adminOnly],
    schema: { tags: ['Admin - Categories'], summary: 'Delete an empty category', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, deleteCategoryController);
};

export default categoryRoutes;
