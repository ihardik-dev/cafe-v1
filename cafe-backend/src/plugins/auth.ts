import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { AppError } from '../lib/errors.js';

export const authenticate: preHandlerHookHandler = async (request: FastifyRequest) => {
  try {
    await request.jwtVerify();
  } catch {
    throw new AppError(401, 'Authentication required');
  }
};

export function authorize(...roles: Array<'CUSTOMER' | 'ADMIN'>): preHandlerHookHandler {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }
  };
}

