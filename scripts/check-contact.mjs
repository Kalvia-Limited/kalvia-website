import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';

const urls = JSON.parse(await readFile('.local/database-urls.json', 'utf8')).kalvia_test;
const owner = new Client(databaseConfig(urls.kalvia_migrator));
const app = new Client(databaseConfig(urls.kalvia_app));
const reader = new Client(databaseConfig(urls.kalvia_reader));
const maintenance = new Client(databaseConfig(urls.kalvia_maintenance));
const servers = [];
const checks = [];
const origins = ['http://127.0.0.1:3001', 'http://127.0.0.1:3002'];
const rateSecret = randomBytes(32).toString('hex');
const valid = { name: '  Test Enquirer  ', email: 'TEST@Example.com ', message: ' A test enquiry. ', interest: 'Academy', website: '' };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (name, value) => { assert.equal(value, true, name); checks.push(name); };
const verifySecurity = response => {
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.ok(response.headers.get('permissions-policy')?.includes('geolocation=()'));
  assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
  assert.ok(response.headers.get('cache-control')?.includes('no-store'));
  return response;
};
try {
  await Promise.all([owner.connect(), app.connect(), reader.connect(), maintenance.connect()]);
  await owner.query('TRUNCATE public.contact_submissions, contact_private.rate_limits');
  for (const [i, origin] of origins.entries()) {
    const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(3001 + i)], { windowsHide: true, stdio: 'ignore', env: { ...process.env, DATABASE_URL: urls.kalvia_app, CONTACT_ALLOWED_ORIGINS: origins.join(','), CONTACT_RATE_LIMIT_SECRET: rateSecret, CONTACT_CLIENT_IP_HEADER: 'x-test-client-ip' } });
    servers.push(child);
    for (let wait = 0; wait < 100; wait++) {
      try { if ((await fetch(origin)).ok) break; } catch { /* Wait for this test server. */ }
      if (wait === 99) throw new Error('Contact test server failed to start');
      await pause(100);
    }
  }
  let ip = 1;
  const post = (body = valid, options = {}) => {
    const origin = origins[options.server ?? 0];
    return fetch(`${origin}/api/contact`, { method: options.method ?? 'POST', headers: { origin, 'content-type': 'application/json', 'x-test-client-ip': `192.0.2.${ip++}`, ...options.headers }, ...(options.method === 'GET' || options.method === 'HEAD' ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) }).then(verifySecurity);
  };
  const count = async () => Number((await reader.query('SELECT count(*) FROM public.contact_submissions')).rows[0].count);
  let response = await post();
  check('Valid enquiry returns 201 after persistence', response.status === 201 && await count() === 1);
  check('Success is accurate and non-email wording', (await response.json()).message === 'Your enquiry has been received.');
  const stored = (await reader.query('SELECT name,email,interest,message FROM public.contact_submissions')).rows[0];
  check('Stored fields are normalized', stored.name === 'Test Enquirer' && stored.email === 'test@example.com' && stored.message === 'A test enquiry.');
  for (const [label, body, status, headers] of [
    ['empty name', { ...valid, name: '' }, 422], ['invalid email', { ...valid, email: 'bad' }, 422],
    ['missing interest', { ...valid, interest: '' }, 422], ['unsupported interest', { ...valid, interest: 'other' }, 422],
    ['long message', { ...valid, message: 'x'.repeat(5001) }, 422], ['wrong field type', { ...valid, name: {} }, 422],
    ['honeypot', { ...valid, website: 'spam.example' }, 400], ['malformed JSON', '{', 400],
    ['oversized body', 'x'.repeat(25000), 413], ['wrong content type', valid, 415, { 'content-type': 'text/plain' }],
    ['cross origin', valid, 403, { origin: 'https://untrusted.example' }], ['missing origin', valid, 403, { origin: '' }],
    ['cross-site fetch metadata', valid, 403, { 'sec-fetch-site': 'cross-site' }],
    ['same-site cross-origin metadata', valid, 403, { 'sec-fetch-site': 'same-site' }],
    ['encoded body', valid, 415, { 'content-encoding': 'gzip' }], ['invalid proxy header', valid, 503, { 'x-test-client-ip': 'bad, address' }],
  ]) {
    response = await post(body, { headers });
    check(`Rejects ${label} without saving`, response.status === status && await count() === 1 && response.headers.get('cache-control') === 'no-store');
  }
  response = await post(valid, { method: 'GET' });
  check('GET has no listing and is not cached', response.status === 405 && response.headers.get('allow') === 'POST' && response.headers.get('cache-control') === 'no-store');
  for (const method of ['PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    response = await post(valid, { method });
    check(`${method} is rejected`, response.status === 405 && response.headers.get('cache-control') === 'no-store');
  }
  response = await fetch(`${origins[0]}/api/contact`, { method: 'POST', headers: { origin: origins[0], 'content-type': 'application/json', 'x-test-client-ip': '192.0.2.200' }, body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(25000)); controller.close(); } }), duplex: 'half' });
  check('Streamed oversized body without Content-Length is rejected', response.status === 413 && await count() === 1);
  // Cross-instance, concurrent enforcement: both runtimes use the same database and secret.
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => post(valid, { server: i % 2, headers: { 'x-test-client-ip': '198.51.100.4' } })));
  check('Concurrent rate limiting accepts exactly five across two instances', results.filter(result => result.status === 201).length === 5 && results.filter(result => result.status === 429).length === 3 && await count() === 6);
  check('Rate-limit response supplies Retry-After', results.find(result => result.status === 429)?.headers.get('retry-after') === '600');
  await owner.query('REVOKE INSERT (name,email,interest,message) ON public.contact_submissions FROM kalvia_app');
  response = await post();
  check('Insert failure returns generic 503 and saves nothing', response.status === 503 && await count() === 6 && (await response.json()).error === "We couldn't save your enquiry. Please try again later.");
  await owner.query('GRANT INSERT (name,email,interest,message) ON public.contact_submissions TO kalvia_app');
  await owner.query('REVOKE EXECUTE ON FUNCTION contact_private.consume_limit(text,integer,integer) FROM kalvia_app');
  response = await post();
  check('Rate-limiter failure fails closed', response.status === 503 && await count() === 6);
  await owner.query('GRANT EXECUTE ON FUNCTION contact_private.consume_limit(text,integer,integer) TO kalvia_app');
  for (const sql of ['SELECT * FROM public.contact_submissions', 'DELETE FROM public.contact_submissions', 'CREATE TABLE public.forbidden (id int)', 'SELECT * FROM contact_private.rate_limits']) {
    let denied = false;
    try { await app.query(sql); } catch (error) { denied = error.code === '42501'; }
    check(`Application role cannot ${sql.split(' ')[0]} protected data or schema`, denied);
  }
  response = await post({ ...valid, message: "A literal SQL-like message: '); DROP TABLE contact_submissions; --" });
  check('Parameterized insert preserves SQL-like text', response.status === 201 && await count() === 7);
  await owner.query("INSERT INTO public.contact_submissions(name,email,interest,message,created_at) VALUES ('Old test','old@example.com','Academy','Expired',now()-interval '181 days')");
  await maintenance.query("DELETE FROM public.contact_submissions WHERE created_at < now()-interval '180 days'");
  await maintenance.query('DELETE FROM contact_private.rate_limits WHERE reset_at < now()');
  check('Retention removes only enquiries older than 180 days', await count() === 7);
  for (const [port, outage] of [[3003, false], [3004, true]]) {
    const origin = `http://127.0.0.1:${port}`;
    const url = new URL(urls.kalvia_app);
    if (outage) url.pathname = '/kalvia_nonexistent_test';
    const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { windowsHide: true, stdio: 'ignore', env: { ...process.env, DATABASE_URL: url.toString(), CONTACT_ALLOWED_ORIGINS: origin, CONTACT_RATE_LIMIT_SECRET: rateSecret, CONTACT_CLIENT_IP_HEADER: '' } });
    servers.push(child);
    for (let wait = 0; wait < 100; wait++) { try { if ((await fetch(origin)).ok) break; } catch {} await pause(100); }
    const request = () => fetch(`${origin}/api/contact`, { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${ip++}` }, body: JSON.stringify(valid) }).then(verifySecurity);
    if (outage) {
      response = await request();
      check('Unavailable database returns 503 and creates no record', response.status === 503 && await count() === 8);
    } else {
      await owner.query("UPDATE contact_private.rate_limits SET attempts=99 WHERE key='global'");
      response = await request();
      check('Without trusted ingress the shared global limiter allows its last slot', response.status === 201 && await count() === 8);
      response = await request();
      check('Spoofed forwarded IP cannot bypass the global limit', response.status === 429 && await count() === 8);
    }
  }
  await mkdir('docs/contact', { recursive: true });
  await writeFile('docs/contact/check-report.json', JSON.stringify({ checks, database: 'isolated local PostgreSQL, kalvia_test', instances: 4 }, null, 2) + '\n');
  console.log(`${checks.length} PostgreSQL contact integration checks passed.`);
} finally {
  await owner.query('GRANT INSERT (name,email,interest,message) ON public.contact_submissions TO kalvia_app').catch(() => {});
  await owner.query('GRANT EXECUTE ON FUNCTION contact_private.consume_limit(text,integer,integer) TO kalvia_app').catch(() => {});
  for (const server of servers) server.kill();
  await Promise.all([owner.end(), app.end(), reader.end(), maintenance.end()]);
}
