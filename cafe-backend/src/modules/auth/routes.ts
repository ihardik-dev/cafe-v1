import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../plugins/auth.js';
import { loginController, logoutController, registerCustomerController } from './controller.js';

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', {
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    schema: {
      tags: ['Authentication'], summary: 'Register a customer account',
      body: {
        type: 'object', additionalProperties: false, required: ['name', 'email', 'password'],
        properties: { name: { type: 'string', minLength: 2, maxLength: 100 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 72 } },
      },
    },
  }, registerCustomerController);

  app.post('/auth/login', {
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    schema: {
      tags: ['Authentication'], summary: 'Log in with email and password',
      body: { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 1 } } },
    },
  }, loginController);

  app.post('/auth/logout', {
    preHandler: [authenticate],
    schema: { tags: ['Authentication'], summary: 'Log out (client discards the stateless JWT)', security: [{ bearerAuth: [] }] },
  }, logoutController);
};

export default authRoutes;
