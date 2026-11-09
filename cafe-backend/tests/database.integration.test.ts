import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPrismaClient } from '../src/lib/prisma.js';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const integration = testDatabaseUrl ? describe : describe.skip;

integration('PostgreSQL integration (requires TEST_DATABASE_URL and applied migrations)', () => {
  const db = createPrismaClient({ DATABASE_URL: testDatabaseUrl ?? 'postgresql://unused:unused@localhost:5432/unused' });

  beforeAll(async () => {
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('can create, read, and delete a category through Prisma and PostgreSQL', async () => {
    const name = `vitest-${randomUUID()}`;
    const created = await db.category.create({ data: { name } });
    const found = await db.category.findUnique({ where: { id: created.id } });
    expect(found?.name).toBe(name);
    await db.category.delete({ where: { id: created.id } });
  });

  it('can query the database', async () => {
    await expect(db.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });
});
