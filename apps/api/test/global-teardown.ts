import { Client } from 'pg';
import { withDatabaseName } from './helpers/database-url.helper';

export default async function globalTeardown(): Promise<void> {
  const testDatabaseUrl = process.env.DATABASE_URL;
  const testDatabaseName = process.env.E2E_TEST_DB_NAME;

  if (!testDatabaseUrl || !testDatabaseName) {
    return;
  }

  const maintenanceUrl = withDatabaseName(testDatabaseUrl, 'postgres');
  const adminClient = new Client({ connectionString: maintenanceUrl });
  await adminClient.connect();

  await adminClient.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [testDatabaseName],
  );
  await adminClient.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);

  await adminClient.end();
}
