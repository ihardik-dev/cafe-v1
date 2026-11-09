import type { FastifyRequest } from 'fastify';
import { AppError } from '../../lib/errors.js';

export async function getOwnProfileController(request: FastifyRequest) {
  const user = await request.server.db.user.findUnique({
    where: { id: request.user.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  return { success: true, message: 'Profile retrieved successfully', data: { user } };
}
