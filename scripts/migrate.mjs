import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { Client } from 'pg';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { databaseConfig } from '../lib/db-config.mjs';
loadEnvConfig(process.cwd());
export async function migrate(url = process.env.MIGRATION_DATABASE_URL) {
  const db = new Client(databaseConfig(url));
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(734261889)');
    await db.query('CREATE TABLE IF NOT EXISTS public.schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    await db.query('REVOKE ALL ON public.schema_migrations FROM PUBLIC');
    for (const file of (await readdir('db/migrations')).filter(file => file.endsWith('.sql')).sort()) {
      const sql = await readFile(`db/migrations/${file}`, 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const { rows } = await db.query('SELECT checksum FROM public.schema_migrations WHERE version=$1', [file]);
      if (rows.length) { if (rows[0].checksum !== checksum) throw new Error('Applied migration was modified'); continue; }
      await db.query(sql);
      await db.query('INSERT INTO public.schema_migrations (version, checksum) VALUES ($1,$2)', [file, checksum]);
      console.log(`Applied ${file}`);
    }
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
  finally { await db.end(); }
}
if (process.argv[1]?.endsWith('migrate.mjs')) {
  try { await migrate(); console.log('Migrations are current.'); }
  catch { console.error('Migration failed. Check the direct migration connection, roles and schema version.'); process.exitCode = 1; }
}
