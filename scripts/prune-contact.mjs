import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { Client } from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';
loadEnvConfig(process.cwd());
const db = new Client(databaseConfig(process.env.MAINTENANCE_DATABASE_URL));
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("DELETE FROM public.contact_submissions WHERE created_at < now() - interval '180 days'");
  await db.query('DELETE FROM contact_private.rate_limits WHERE reset_at < now()');
  await db.query('COMMIT');
  console.log('Expired enquiries and rate-limit buckets removed.');
} catch { await db.query('ROLLBACK').catch(() => {}); console.error('Retention job failed. Check the maintenance connection.'); process.exitCode = 1; }
finally { await db.end(); }
