import type { FastifyPluginAsync } from 'fastify';
import { authenticate, authorize } from '../../plugins/auth.js';
import {
  cancelCustomerReservationController,
  createReservationController,
  listCustomerReservationsController,
} from './controller.js';

const reservationRoutes: FastifyPluginAsync = async (app) => {
  app.post('/reservations', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: {
      tags: ['Reservations'], summary: 'Create a confirmed cafe reservation', security: [{ bearerAuth: [] }],
      body: { type: 'object', additionalProperties: false, required: ['reservationDateTime', 'guestCount'], properties: { reservationDateTime: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$', description: 'Cafe-local time in Asia/Kolkata, YYYY-MM-DDTHH:mm' }, guestCount: { type: 'integer', minimum: 1, maximum: 6 } } },
    },
  }, createReservationController);

  app.get('/reservations', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: {
      tags: ['Reservations'], summary: 'Get reservation history', security: [{ bearerAuth: [] }],
      querystring: { type: 'object', additionalProperties: false, properties: { filter: { type: 'string', enum: ['upcoming', 'previous', 'cancelled'] } } },
    },
  }, listCustomerReservationsController);

  app.post('/reservations/:id/cancel', {
    preHandler: [authenticate, authorize('CUSTOMER')],
    schema: { tags: ['Reservations'], summary: 'Cancel a reservation at least 24 hours in advance', security: [{ bearerAuth: [] }], params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } },
  }, cancelCustomerReservationController);
};

export default reservationRoutes;
