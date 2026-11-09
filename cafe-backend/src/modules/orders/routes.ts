import type { FastifyPluginAsync } from 'fastify';
import { authenticate, authorize } from '../../plugins/auth.js';
import {
  cancelCustomerOrderController,
  createOrderController,
  getCustomerOrderController,
  listCustomerOrdersController,
} from './controller.js';

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/orders', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: {
      tags: ['Orders'], summary: 'Create a confirmed demonstration order', security: [{ bearerAuth: [] }],
      body: { type: 'object', additionalProperties: false, required: ['items'], properties: { items: { type: 'array', minItems: 1, items: { type: 'object', additionalProperties: false, required: ['menuItemId', 'quantity'], properties: { menuItemId: { type: 'string', format: 'uuid' }, quantity: { type: 'integer', minimum: 1, maximum: 10 } } } } } },
    },
  }, createOrderController);

  app.get('/orders', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: { tags: ['Orders'], summary: 'Get the authenticated customer order history', security: [{ bearerAuth: [] }] },
  }, listCustomerOrdersController);

  app.get('/orders/:id', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: { tags: ['Orders'], summary: 'Get one of the authenticated customer orders', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, getCustomerOrderController);

  app.post('/orders/:id/cancel', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: { tags: ['Orders'], summary: 'Cancel an order within 60 seconds of creation', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, cancelCustomerOrderController);
};

export default orderRoutes;
