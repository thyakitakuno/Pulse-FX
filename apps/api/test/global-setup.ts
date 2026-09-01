import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { config } from 'dotenv';
import { Client } from 'pg';
import { withDatabaseName } from './helpers/database-url.helper';

export default async function globalSetup(): Promise<void> {
  config({ path: `${__dirname}/../.env.test` });

  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL não definido para os testes e2e.');
  }

  const testDatabaseName = `pulsefx_test_${randomBytes(4).toString('hex')}`;
  const maintenanceUrl = withDatabaseName(baseUrl, 'postgres');
  const testDatabaseUrl = withDatabaseName(baseUrl, testDatabaseName);

  const adminClient = new Client({ connectionString: maintenanceUrl });
  await adminClient.connect();
  await adminClient.query(`CREATE DATABASE "${testDatabaseName}"`);
  await adminClient.end();

  execSync('npx prisma migrate deploy && npx prisma db seed', {
    cwd: `${__dirname}/..`,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.E2E_TEST_DB_NAME = testDatabaseName;
}
