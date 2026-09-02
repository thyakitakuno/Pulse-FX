export function withDatabaseName(
  connectionUrl: string,
  databaseName: string,
): string {
  const url = new URL(connectionUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}
