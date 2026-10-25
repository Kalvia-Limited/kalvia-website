# Contact enquiries: setup and operations

## Current status and production prerequisites

Development and integration-test databases run in an isolated PostgreSQL 18 cluster on loopback port 55432. This does not modify the existing PostgreSQL service on port 5432. Application, migration, read-only staff and maintenance connections use different roles. `.local/` and `.env.local` are ignored by source control. No production database has been created and no production backup schedule is active.

The requested production provider is Prisma Postgres. Its current [connection permissions](https://www.prisma.io/docs/postgres/database/connecting-to-your-database) give every credential full database access and do not allow restricting credentials to PostgreSQL roles, tables or schemas. This conflicts with the plan's restricted application-role requirement. The current migration intentionally requires restricted roles; it must not be presented as a working Prisma Postgres deployment. Resolve that requirement with the owner before production provisioning. Choosing a provider with PostgreSQL role management preserves the implemented permissions. Using Prisma Postgres requires an explicit permission exception and a provider-specific migration change.

Production still needs a hosting platform, database, exact HTTPS site origin, trusted client-IP ingress configuration, a shared random rate-limit secret, retention scheduling, backups and a restore rehearsal. Step 8 must remain partially unchecked until these are configured and verified. Do not place development databases or test credentials in production.

## Local setup

Use Node.js 20.9+ for the app; the browser/integration verification scripts use the installed Node.js 24 runtime. Install packages with `npm ci`. Install PostgreSQL 18 tools; the local setup script defaults to `C:/Program Files/PostgreSQL/18/bin` (override `POSTGRES_BIN` if needed). Run:

```powershell
npm run db:setup-local
npm run dev
```

Setup creates `.local/postgres`, binds only to 127.0.0.1:55432, generates random local passwords, creates only `kalvia_development` and `kalvia_test`, and applies migrations to both. It saves local connections to `.local/database-urls.json` and creates `.env.local` only if that file does not already exist. Otherwise copy the development app, migrator and maintenance URLs into the corresponding variables yourself. Do not print or paste those files into logs or chat. The setup script does not rotate pre-existing roles. If fixed Kalvia role/database names already exist on an explicitly selected server, verify ownership and credentials before using that mode.

An existing local server may be used by setting `LOCAL_POSTGRES_ADMIN_URL` in `.env.local` before setup. This requires an administrator authorized to create roles/databases. This variable is only for setup and must never be deployed. To stop the isolated cluster:

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D .local/postgres -m fast stop
```

Re-run setup to start it again. Local SQL data and credentials are not portable deployment artifacts.

## Environment and migration access

Use `.env.example` as a list of variable names. All are server-only. The application runtime receives `DATABASE_URL`, `CONTACT_ALLOWED_ORIGINS`, `CONTACT_RATE_LIMIT_SECRET`, optional `DATABASE_CA_CERT`, and optionally `CONTACT_CLIENT_IP_HEADER`. Never use `NEXT_PUBLIC_` for any of them.

`DATABASE_URL` uses the application role and the provider's pooled PostgreSQL TCP endpoint. The server maintains at most three connections per process, with connection and statement deadlines. Account for the total number of hosting instances against the provider connection limit. Non-loopback connections enforce TLS with certificate validation; supply a trusted CA PEM in `DATABASE_CA_CERT` if the server does not use a publicly trusted certificate. SSL URL parameters are removed before the explicit TLS configuration is applied, so a URL cannot disable certificate validation. Do not use Accelerate or `prisma+postgres:` URLs with this driver.

`MIGRATION_DATABASE_URL` uses a direct connection and the schema-owner/migration role. Keep it in the release job, outside the application runtime. The migrations require existing `kalvia_app`, `kalvia_reader` and `kalvia_maintenance` roles. A database administrator creates these LOGIN roles with separate strong credentials, `NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`, then creates the database owned by `kalvia_migrator`. Revoke public database access, grant CONNECT only to the intended roles, and revoke PUBLIC CREATE on the public schema, as done by local setup.

```powershell
npm run db:migrate
```

The runner uses a transaction, an advisory lock and checksums in `schema_migrations`. Applied migration files must not be edited. Add another numbered migration for future schema changes. Back up and rehearse migrations against a separate database before the production release. No migration runs automatically at application startup.

The app can INSERT only the four collected fields and execute the rate-limit function. It cannot SELECT, UPDATE, DELETE, change schema, or access rate-limit rows. The SECURITY DEFINER function fixes its search path and grants no table access. The staff reader can SELECT enquiries. The maintenance role can delete expired records using timestamp predicates, without reading messages. The form collects no phone number, so the database does not store one.

## Request protections and rate limits

`POST /api/contact` accepts uncompressed JSON up to 24 KiB, including a streamed-body limit when Content-Length is absent. Requests must carry an exact allowed Origin; comma-separated entries in `CONTACT_ALLOWED_ORIGINS` must be explicit scheme/host/port origins without trailing slashes. Cross-site and same-site cross-origin fetch metadata are rejected. There are no CORS grants. Unsupported methods return 405 with no listing; every route response has `Cache-Control: no-store`.

Name, email, interest and message are validated and normalized on the server. Maximum lengths are 120, 254 and 5,000 characters for name, email and message. Interest must be one of Academy, Sponsoring, Marketplace or Partnership. The hidden website honeypot must be empty. Rejected requests do not save enquiries. HTML-like and SQL-like text are treated as data; inserts use query parameters. Success is returned only after PostgreSQL confirms the insert.

Atomic PostgreSQL rate counters share limits across instances: 100 accepted attempts per 10-minute window globally, plus five per trusted client IP when configured. Rate-limited responses return 429 and `Retry-After: 600`. `CONTACT_RATE_LIMIT_SECRET` must contain at least 32 random characters, be identical across instances, and be rotated securely. Client IPs are HMAC-hashed, never stored in enquiry records or returned to the client. Global limits bound the number of active client buckets per window. Expired buckets are pruned by the daily maintenance job.

Set `CONTACT_CLIENT_IP_HEADER` only after confirming the hosting ingress strips any caller-supplied value and writes one canonical client IP into that exact header. The application deliberately rejects missing, malformed or comma-separated values when configured. Never configure an unverified `x-forwarded-for` chain. If no trusted ingress is available, leave the variable empty: forwarded headers are ignored and the global limit protects all clients together. A dedicated database limiter failure or a database failure returns 503 and saves nothing; it does not fall back to unshared memory or accept submissions without throttling.

Application code does not log credentials, message contents, query errors or personal information. Configure hosting/proxy/database logging to omit request bodies, authorization secrets, SQL parameter values and sensitive error details; do not enable statement logging for contact inserts. Restrict infrastructure logs and database access independently.

## Enquiry retrieval and retention

Authorized staff use a VPN/private database connection and the read-only role through an approved SQL client. There is no public enquiry list or admin dashboard. Retrieve only what is needed:

```sql
SELECT id, name, email, interest, message, created_at
FROM public.contact_submissions
ORDER BY created_at DESC
LIMIT 100;
```

Do not export personal data into public files, issue trackers or application logs. Revoke staff credentials when access is no longer required. Live enquiries are kept for up to 180 days; run `npm run db:prune` daily using `MAINTENANCE_DATABASE_URL` and alert the operator if the job fails. The script removes older enquiries and expired rate buckets in one transaction. The runtime application must not receive maintenance credentials. Configure the actual hosting scheduler before accepting production enquiries. Backups may retain deleted enquiries until their own retention expires; keep restored data under the same access controls and re-run retention before restoring application access.

## Backups and restore procedure

Production backup configuration is pending production provisioning. For Prisma Postgres, [managed backup availability](https://www.prisma.io/docs/postgres/database/backups) depends on the selected plan. Confirm the chosen plan provides daily snapshots, inspect a first successful snapshot and its retention, and assign an operator for restore alerts. The current documented daily snapshots retain seven days on Starter/Pro and 30 on Business; they do not cover changes after the last snapshot. Do not assume a free plan supplies backups or promise point-in-time recovery. Agree the acceptable data-loss window with the owner.

For a PostgreSQL provider supporting roles, enable its managed encrypted backups and verify the actual retention/snapshot status. Keep database and migration credentials in the provider secret store. A logical export is a supplementary recovery/migration tool, not a substitute for verified managed backups.

For a manual export, use `pg_dump --format=custom --no-owner --no-acl --file=<private-backup-path>` with a direct admin/backup connection provided through the standard PGHOST, PGPORT, PGDATABASE, PGUSER and secret PGPASSWORD/PGPASSFILE environment. Use `PGSSLMODE=verify-full` remotely and a compatible pg_dump version. Do not put credentials in command-line arguments or commit archives. Store encrypted archives in restricted off-machine storage with lifecycle deletion and audit access.

Restore into a NEW empty database or provider instance, never over the active database by default. Recreate the restricted roles and database grants, then use `pg_restore --no-owner --no-privileges --exit-on-error --dbname=<new-database-name> <private-archive>` with connection credentials supplied through the environment. Restore under the migrator/owner role; reapply application/reader/maintenance grants from `001_contact.sql` (the GRANT statements only), because archives omit ACLs. Verify migration checksums and schema, compare expected row counts privately, run retention, and exercise the form against the restored database. For Prisma-managed snapshots, follow the Console restore flow to a separate instance and validate its resulting connections and access model. Only switch production connections after the owner approves the verified restore; retain the old instance until the cutover is confirmed. Record a restore rehearsal before launch and repeat it periodically.

## Verification

Run `npm run lint`, `npm run type-check`, `npm run build`, and `npm run test:contact`. The contact test starts four local production runtimes (including failure cases) and uses only `kalvia_test`; it clears that test database and must never point at a production database. Its 39 checks verify actual persistence, rejection without inserts, atomic concurrent rate limits across processes, failed inserts, limiter failure, database unavailability, spoofed forwarded headers, streamed body limits, database permissions and retention. Reports contain check names only in `docs/contact/check-report.json`. Browser checks use `npm run test:interactions` against a running local app; the 114 checks include mocked contact responses to verify UI states and duplicate-click prevention without saving extra enquiries. Responsive contact form captures are saved in `docs/contact/`.
