import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../plugins/auth.js';
import { getOwnProfileController } from './controller.js';

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/users/me', {
    preHandler: [authenticate],
    schema: { tags: ['Users'], summary: 'Get the authenticated user profile', security: [{ bearerAuth: [] }] },
  }, getOwnProfileController);
};

export default userRoutes;
