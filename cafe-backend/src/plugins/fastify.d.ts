import type { PrismaClient } from '../generated/prisma/client.js';

type CafeJwtUser = {
  sub: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
};

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: CafeJwtUser;
    user: CafeJwtUser;
  }
}
