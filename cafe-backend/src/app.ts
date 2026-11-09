import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Prisma } from './generated/prisma/client.js';
import type { PrismaClient } from './generated/prisma/client.js';
import { loadConfig, type AppConfig } from './config.js';
import { createPrismaClient } from './lib/prisma.js';
import { installErrorHandler } from './plugins/error-handler.js';
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import categoryRoutes from './modules/categories/routes.js';
import menuRoutes from './modules/menu/routes.js';
import orderRoutes from './modules/orders/routes.js';
import reservationRoutes from './modules/reservations/routes.js';

export type BuildAppOptions = {
  db?: PrismaClient;
  config?: AppConfig;
  logger?: boolean;
};

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const ownsDb = options.db === undefined;
  const db = options.db ?? createPrismaClient(config);

  const app = Fastify({
    logger: options.logger === false ? false : {
      level: config.LOG_LEVEL,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'res.headers["set-cookie"]'],
        censor: '[REDACTED]',
      },
    },
    ajv: {
      customOptions: {
        coerceTypes: false,
        removeAdditional: false,
        useDefaults: false,
      },
    },
    disableRequestLogging: false,
  });

  app.decorate('db', db);

  const successResponse = {
    type: 'object',
    required: ['success', 'message', 'data'],
    additionalProperties: true,
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {},
    },
  };
  const errorResponse = {
    type: 'object',
    required: ['success', 'message'],
    additionalProperties: true,
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      errors: { type: 'array', items: { type: 'object', required: ['field', 'message'], additionalProperties: false, properties: { field: { type: 'string' }, message: { type: 'string' } } } },
    },
  };
  const commonResponseSchemas = {
    200: successResponse,
    201: successResponse,
    400: errorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
    429: errorResponse,
    500: errorResponse,
  };
  app.addHook('onRoute', (routeOptions) => {
    // Swagger routes return OpenAPI documents, not standard API responses.
    if (
      routeOptions.url === '/docs' ||
      routeOptions.url.startsWith('/docs/')
    ) {
      return;
    }

    const existing = routeOptions.schema ?? {};
    const existingResponse =
      typeof existing.response === 'object' &&
      existing.response !== null &&
      !Array.isArray(existing.response)
        ? existing.response
        : {};

    routeOptions.schema = {
      ...existing,
      response: { ...commonResponseSchemas, ...existingResponse },
    };
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(jwt, { secret: config.JWT_SECRET });
  await app.register(rateLimit, { global: false });
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Cafe Backend API',
        description: 'Cafe menu, demonstration orders, and customer reservations API.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      url: '/docs/json',
    },
  });

  installErrorHandler(app);

  app.get('/health', { schema: { tags: ['Health'], summary: 'Check API and database health' } }, async () => {
    await db.$queryRaw(Prisma.sql`SELECT 1`);
    return { success: true, message: 'Service is healthy', data: { database: 'connected' } };
  });

  app.setNotFoundHandler((_request, reply) => reply.code(404).send({
    success: false,
    message: 'Route not found',
  }));

  await app.register(async (api) => {
    await api.register(authRoutes);
    await api.register(userRoutes);
    await api.register(categoryRoutes);
    await api.register(menuRoutes);
    await api.register(orderRoutes);
    await api.register(reservationRoutes);
  }, { prefix: '/api/v1' });

  if (ownsDb) {
    app.addHook('onClose', async () => {
      await db.$disconnect();
    });
  }

  return app;
}
