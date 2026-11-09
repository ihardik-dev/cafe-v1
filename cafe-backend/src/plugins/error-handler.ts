import type { FastifyInstance } from 'fastify';
import { Prisma } from '../generated/prisma/client.js';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';

export function installErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        message: error.message,
        ...(error.details ? { errors: error.details } : {}),
      });
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          field: issue.path.map(String).join('.') || 'request',
          message: issue.message,
        })),
      });
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'validation' in error &&
      Array.isArray(error.validation)
    ) {
      const issues = error.validation as Array<{
        instancePath?: string;
        message?: string;
        params?: { missingProperty?: string };
      }>;

      return reply.code(400).send({
        success: false,
        message: 'Validation failed',
        errors: issues.map((issue) => ({
          field: issue.instancePath?.replace(/^\//, '').replaceAll('/', '.')
            || issue.params?.missingProperty
            || 'request',
          message: issue.message ?? 'Invalid value',
        })),
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return reply.code(409).send({
          success: false,
          message: 'A record with this value already exists',
        });
      }

      if (error.code === 'P2025') {
        return reply.code(404).send({
          success: false,
          message: 'Resource not found',
        });
      }

      if (error.code === 'P2003') {
        return reply.code(409).send({
          success: false,
          message: 'The operation conflicts with related records',
        });
      }
    }

    const httpError = error as Error & { statusCode?: number };

    if (httpError.statusCode === 429) {
      return reply.code(429).send({
        success: false,
        message: 'Too many attempts. Please try again later.',
      });
    }

    if (
      typeof httpError.statusCode === 'number' &&
      httpError.statusCode >= 400 &&
      httpError.statusCode < 500
    ) {
      return reply.code(httpError.statusCode).send({
        success: false,
        message: httpError.message,
      });
    }

    request.log.error(
      { errorName: httpError.name, requestId: request.id },
      'Unhandled request error',
    );

    return reply.code(500).send({
      success: false,
      message: 'Internal server error',
    });
  });
}