export function databaseConfig(connectionString) {
  if (!connectionString) throw new Error('Database configuration missing');
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Invalid database protocol');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  // URL SSL parameters can override pg's ssl object, so always set TLS here.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslnegotiation']) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: local ? false : { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : {}) },
    max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000,
    statement_timeout: 5000, query_timeout: 7000, application_name: 'kalvia-contact',
  };
}
