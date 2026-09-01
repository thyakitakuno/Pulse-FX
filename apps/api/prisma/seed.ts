import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const adminName = process.env.SEED_ADMIN_NAME ?? 'Paul Julius Reuter';
const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'paul';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'thomson';

async function main() {
  const passwordHash = await argon2.hash(adminPassword);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      name: adminName,
      username: adminUsername,
      password: passwordHash,
      role: 'ADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
