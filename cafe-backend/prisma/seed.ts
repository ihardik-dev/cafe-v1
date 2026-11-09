import 'dotenv/config';
import { loadConfig } from '../src/config.js';
import { createPrismaClient } from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';

const categories = ['Coffee', 'Tea', 'Cold Beverages', 'Snacks', 'Desserts'] as const;

async function main(): Promise<void> {
  const config = loadConfig();
  const db = createPrismaClient(config);
  try {
    for (const name of categories) {
      await db.category.upsert({ where: { name }, update: {}, create: { name } });
    }

    const hashedPassword = await hashPassword(config.ADMIN_PASSWORD);
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const adminData = {
      name: config.ADMIN_NAME,
      email: config.ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'ADMIN' as const,
    };
    if (existingAdmin) {
      await db.user.update({ where: { id: existingAdmin.id }, data: adminData });
    } else {
      await db.user.create({ data: adminData });
    }

    console.info(`Seed complete: ${categories.length} categories and the configured admin account are ready.`);
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error('Database seeding failed:', error);
  process.exitCode = 1;
});
