import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { databaseConfig } from '../lib/db-config.mjs';
import { hstsForOrigin, contentSecurityPolicy } from '../lib/security-headers.ts';

const checks = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (name, pass) => { assert.ok(pass, name); checks.push(name); };
const urls = JSON.parse(await readFile('.local/database-urls.json', 'utf8')).kalvia_test;
assert.equal(new URL(urls.kalvia_migrator).pathname, '/kalvia_test', 'Only use the local test database');
const db = new Client(databaseConfig(urls.kalvia_migrator));
await db.connect();
await mkdir('docs/security', { recursive: true });
const servers = [];
const common = {
  'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin', 'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
};
function verifyCommon(response, label) {
  for (const [name, value] of Object.entries(common)) check(`${label}: ${name}`, response.headers.get(name) === value);
  check(`${label}: no production HSTS over local HTTP`, !response.headers.has('strict-transport-security'));
  check(`${label}: no framework disclosure header`, !response.headers.has('x-powered-by'));
}
function verifyPolicy(response, label, reportOnly) {
  const name = reportOnly ? 'content-security-policy-report-only' : 'content-security-policy';
  const policy = response.headers.get(name) || '';
  check(`${label}: correct CSP mode without duplicate policy`, !!policy && !response.headers.has(reportOnly ? 'content-security-policy' : 'content-security-policy-report-only') && !policy.includes(','));
  for (const directive of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "script-src-attr 'none'", "connect-src 'self'", "font-src 'self'", "img-src 'self'"]) check(`${label}: ${directive}`, policy.includes(directive));
  check(`${label}: scripts use a nonce with strict-dynamic`, /script-src 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/.test(policy));
  check(`${label}: no unsafe script/eval or development socket allowances`, !policy.includes('unsafe-eval') && !policy.includes('ws:') && !policy.includes('wss:') && !/script-src[^;]*unsafe-inline/.test(policy));
  return policy.match(/'nonce-([^']+)'/)[1];
}
try {
  check('HSTS is off until an HTTPS origin is confirmed', hstsForOrigin('https://example.com', true) === undefined);
  check('HSTS is off on plain HTTP', hstsForOrigin('http://example.com', true, 'https://example.com') === undefined);
  check('HSTS is off in development', hstsForOrigin('https://example.com', false, 'https://example.com') === undefined);
  check('HSTS applies only to the confirmed HTTPS origin', hstsForOrigin('https://example.com', true, 'https://example.com') === 'max-age=31536000');
  check('HSTS excludes unrelated domains and subdomains', hstsForOrigin('https://sub.example.com', true, 'https://example.com') === undefined);
  check('Development CSP explicitly permits eval and HMR', contentSecurityPolicy('test', true).includes("'unsafe-eval'") && contentSecurityPolicy('test', true).includes('ws:'));
  for (const [index, mode] of ['report-only', 'enforce'].entries()) {
    const origin = `http://127.0.0.1:${3100 + index}`;
    await db.query('TRUNCATE contact_private.rate_limits');
    const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(3100 + index)], { windowsHide: true, stdio: 'ignore', env: { ...process.env, DATABASE_URL: urls.kalvia_app, CONTACT_ALLOWED_ORIGINS: origin, CONTACT_RATE_LIMIT_SECRET: randomBytes(32).toString('hex'), CONTACT_CLIENT_IP_HEADER: '', CSP_REPORT_ONLY: String(mode === 'report-only'), SECURITY_HTTPS_ORIGIN: '' } });
    servers.push(server);
    for (let attempt = 0; attempt < 100; attempt++) { try { if ((await fetch(origin)).ok) break; } catch {} if (attempt === 99) throw Error('Production security server startup failed'); await pause(100); }
    const seenNonces = [];
    for (const [path, options, status, label] of [
      ['/', {}, 200, 'homepage'], ['/missing-security-check', {}, 404, '404 HTML'],
      ['/api/contact', {}, 405, 'API method error'],
      ['/api/contact', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' }, 422, 'API validation error'],
      ['/api/contact', { method: 'POST', headers: { origin: 'https://untrusted.example', 'content-type': 'application/json' }, body: '{}' }, 403, 'API origin error'],
      ['/api/contact', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Security test', email: 'security@example.invalid', interest: 'Academy', message: 'Security-header integration check', website: '' }) }, 201, 'API saved response'],
    ]) {
      const response = await fetch(`${origin}${path}`, options);
      const name = `${mode} ${label}`;
      check(`${name}: status ${status}`, response.status === status);
      verifyCommon(response, name);
      const nonce = verifyPolicy(response, name, mode === 'report-only');
      seenNonces.push(nonce);
      check(`${name}: response is not shared-cached`, /no-store/.test(response.headers.get('cache-control') || ''));
      if (status === 200 || status === 404) {
        const html = await response.text();
        const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map(match => match[0]);
        check(`${name}: rendered bootstrap scripts match the response nonce`, scripts.length > 0 && scripts.every(script => script.includes(`nonce="${nonce}"`)));
      }
    }
    check(`${mode}: every response has a fresh nonce`, new Set(seenNonces).size === seenNonces.length);
    const spoof = await fetch(origin, { headers: { 'x-nonce': 'attacker-value', 'content-security-policy': "script-src 'unsafe-inline'" } });
    check(`${mode}: request cannot supply the script nonce`, !spoof.headers.get(mode === 'report-only' ? 'content-security-policy-report-only' : 'content-security-policy').includes('attacker-value'));
    for (const path of ['/assets/hero-team.webp', '/_next/image?url=%2Fassets%2Fhero-team.webp&w=640&q=75']) {
      const response = await fetch(`${origin}${path}`);
      check(`${mode}: ${path} loads`, response.ok);
      verifyCommon(response, `${mode} asset`);
    }
    const before = Number((await db.query('SELECT count(*) FROM public.contact_submissions')).rows[0].count);
    const browser = spawn(process.execPath, ['scripts/check-interactions.mjs'], { windowsHide: true, stdio: 'inherit', env: { ...process.env, TEST_ORIGIN: origin, SECURITY_CHECK: 'true', SECURITY_CSP_MODE: mode, BROWSER_REPORT_PATH: `docs/security/browser-${mode}.json` } });
    const code = await new Promise((resolve, reject) => { browser.on('exit', resolve); browser.on('error', reject); });
    assert.equal(code, 0, `${mode} browser verification`);
    const after = Number((await db.query('SELECT count(*) FROM public.contact_submissions')).rows[0].count);
    check(`${mode}: browser contact form saved exactly one actual enquiry`, after === before + 1);
    server.kill();
  }
  await writeFile('docs/security/check-report.json', JSON.stringify({ checks, environment: 'local production builds, report-only before enforcement', deploymentVerified: false, productionHttpsVerified: false }, null, 2) + '\n');
  console.log(`${checks.length} security header checks passed, plus both browser suites.`);
} finally {
  for (const server of servers) server.kill();
  await db.end();
}
