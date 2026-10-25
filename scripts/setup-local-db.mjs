import { Client } from 'pg';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { databaseConfig } from '../lib/db-config.mjs';
import { migrate } from './migrate.mjs';
loadEnvConfig(process.cwd());
const local = resolve('.local');
await mkdir(local, { recursive: true });
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const bin = process.env.POSTGRES_BIN || 'C:/Program Files/PostgreSQL/18/bin';
const run = (name, args) => {
  const result = spawnSync(`${bin}/${name}.exe`, args, { windowsHide: true, stdio: 'ignore', timeout: 60000 });
  if (result.status !== 0) throw new Error(`PostgreSQL ${name} failed. Check the local PostgreSQL log.`);
};
const secretsFile = resolve(local, 'database-secrets.json');
const secrets = await exists(secretsFile) ? JSON.parse(await readFile(secretsFile, 'utf8')) : Object.fromEntries(['admin', 'kalvia_migrator', 'kalvia_app', 'kalvia_reader', 'kalvia_maintenance'].map(role => [role, randomBytes(32).toString('hex')]));
await writeFile(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
let adminUrl = process.env.LOCAL_POSTGRES_ADMIN_URL;
let port = '5432';
if (!adminUrl) {
  port = '55432';
  const cluster = resolve(local, 'postgres');
  if (!(await exists(resolve(cluster, 'PG_VERSION')))) {
    const passwordFile = resolve(local, 'init-password');
    await writeFile(passwordFile, secrets.admin, { mode: 0o600 });
    run('initdb', ['-D', cluster, '-U', 'kalvia_local_admin', '--pwfile', passwordFile, '--auth-host=scram-sha-256', '--auth-local=scram-sha-256', '--encoding=UTF8', '--locale=C']);
  }
  const ready = spawnSync(`${bin}/pg_ctl.exe`, ['-D', cluster, 'status'], { windowsHide: true, stdio: 'ignore' });
  if (ready.status !== 0) run('pg_ctl', ['-D', cluster, '-l', resolve(local, 'postgres.log'), '-o', '-h 127.0.0.1 -p 55432', '-w', 'start']);
  adminUrl = `postgresql://kalvia_local_admin:${secrets.admin}@127.0.0.1:${port}/postgres`;
}
const admin = new Client(databaseConfig(adminUrl));
await admin.connect();
try {
  // Fixed role/database names only. Never modify unrelated databases or existing role passwords.
  for (const role of ['kalvia_migrator', 'kalvia_app', 'kalvia_reader', 'kalvia_maintenance']) {
    if (!(await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [role])).rowCount) {
      await admin.query(`CREATE ROLE ${role} LOGIN PASSWORD '${secrets[role]}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`);
    }
  }
  const urls = {};
  for (const name of ['kalvia_development', 'kalvia_test']) {
    if (!(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [name])).rowCount) await admin.query(`CREATE DATABASE ${name} OWNER kalvia_migrator`);
    await admin.query(`REVOKE ALL ON DATABASE ${name} FROM PUBLIC`);
    await admin.query(`GRANT CONNECT ON DATABASE ${name} TO kalvia_migrator, kalvia_app, kalvia_reader, kalvia_maintenance`);
    const url = new URL(adminUrl);
    url.pathname = `/${name}`;
    url.username = 'kalvia_migrator'; url.password = secrets.kalvia_migrator;
    urls[name] = {};
    for (const role of ['kalvia_migrator', 'kalvia_app', 'kalvia_reader', 'kalvia_maintenance']) {
      url.username = role; url.password = secrets[role]; urls[name][role] = url.toString();
    }
    const owner = new Client(databaseConfig(urls[name].kalvia_migrator));
    await owner.connect();
    await owner.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    await owner.end();
    await migrate(urls[name].kalvia_migrator);
  }
  await writeFile(resolve(local, 'database-urls.json'), JSON.stringify(urls), { mode: 0o600 });
  const envFile = resolve('.env.local');
  if (!(await exists(envFile))) await writeFile(envFile, `DATABASE_URL=${urls.kalvia_development.kalvia_app}\nMIGRATION_DATABASE_URL=${urls.kalvia_development.kalvia_migrator}\nMAINTENANCE_DATABASE_URL=${urls.kalvia_development.kalvia_maintenance}\nCONTACT_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000\nCONTACT_RATE_LIMIT_SECRET=${randomBytes(32).toString('hex')}\n`, { mode: 0o600 });
  console.log(`Development and test databases migrated on local port ${new URL(adminUrl).port || '5432'}. Credentials stay in ignored local files.`);
  console.log('If .env.local already existed, copy the development URLs from .local/database-urls.json into it.');
} finally { await admin.end(); }
