import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const adminName = process.env.SEED_ADMIN_NAME ?? 'Paul Julius Reuter';
const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'paul';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'thomson';

const indicators = [
  {
    code: 'USD-BRL',
    name: 'Dólar americano (USD/BRL)',
    source: 'BCB' as const,
    frequency: 'DAILY' as const,
    unit: 'BRL',
    description: 'Taxa de câmbio de fechamento (PTAX) entre o dólar americano e o real.',
    limitations:
      'Publicada pelo Banco Central apenas em dias úteis. Feriados e fins de semana não têm cotação PTAX própria.',
  },
  {
    code: 'EUR-BRL',
    name: 'Euro (EUR/BRL)',
    source: 'BCB' as const,
    frequency: 'DAILY' as const,
    unit: 'BRL',
    description: 'Taxa de câmbio de fechamento (PTAX) entre o euro e o real.',
    limitations:
      'Publicada pelo Banco Central apenas em dias úteis. Feriados e fins de semana não têm cotação PTAX própria.',
  },
  {
    code: 'FEDFUNDS',
    name: 'Taxa de juros dos EUA (Fed Funds Rate)',
    source: 'FRED' as const,
    frequency: 'MONTHLY' as const,
    unit: '%',
    description: 'Média mensal da taxa efetiva de juros do Federal Reserve dos EUA.',
    limitations:
      'Publicada pelo Federal Reserve com defasagem de algumas semanas em relação ao mês de referência.',
  },
  {
    code: 'CPIAUCSL',
    name: 'Inflação ao consumidor dos EUA (CPI)',
    source: 'FRED' as const,
    frequency: 'MONTHLY' as const,
    unit: 'index 1982-1984=100',
    description: 'Índice de preços ao consumidor dos EUA, não sazonalmente ajustado.',
    limitations:
      'Publicado com defasagem em relação ao mês de referência e sujeito a revisões após a divulgação inicial.',
  },
];

async function main() {
  for (const indicator of indicators) {
    await prisma.indicator.upsert({
      where: { code: indicator.code },
      update: indicator,
      create: indicator,
    });
  }

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
