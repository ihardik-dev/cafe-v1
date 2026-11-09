import type { PrismaClient } from '../../generated/prisma/client.js';
import { AppError } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import type { RegisterInput, LoginInput } from './schemas.js';

export async function registerCustomer(db: PrismaClient, input: RegisterInput) {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new AppError(409, 'An account with this email already exists');

  const password = await hashPassword(input.password);
  return db.user.create({
    data: { name: input.name, email: input.email, password, role: 'CUSTOMER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function authenticateCustomer(db: PrismaClient, input: LoginInput) {
  const user = await db.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.password))) {
    throw new AppError(401, 'Invalid email or password');
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
