import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseInput } from '../../lib/validation.js';
import { loginSchema, registerSchema } from './schemas.js';
import { authenticateCustomer, registerCustomer } from './service.js';

export async function registerCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(registerSchema, request.body);
  const user = await registerCustomer(request.server.db, input);
  request.log.info({ userId: user.id }, 'Customer registered');
  return reply.code(201).send({ success: true, message: 'Registration successful', data: { user } });
}

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const input = parseInput(loginSchema, request.body);
  let user;
  try {
    user = await authenticateCustomer(request.server.db, input);
  } catch (error) {
    request.log.warn({ email: input.email }, 'Failed login attempt');
    throw error;
  }
  const token = request.server.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '7d' });
  request.log.info({ userId: user.id }, 'User logged in');
  return reply.send({ success: true, message: 'Login successful', data: { token, user } });
}

export async function logoutController(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send({ success: true, message: 'Logged out. Discard the JWT on the client.', data: null });
}
