# Kalvia

**Kalvia is a single-page platform for helping people absorb knowledge, apply practical skills, and ascend in their careers.** The production website is available at [kalvia.one](https://kalvia.one).

## Project Description

This website presents Kalvia's Academy, Marketplace, sponsorship, partnership, SOAT information, journey, values, and contact paths in one responsive experience. It is designed for prospective learners, partners, sponsors, and marketplace participants. The page preserves the original Kalvia visual identity and includes keyboard-accessible navigation, audience and offering tabs, persona discovery, reduced-motion support, and a clearly labelled local SOAT demonstration.

The contact form submits enquiries to a server-side PostgreSQL endpoint. It does not send email, provide accounts or payments, expose an admin dashboard, or query a live technician register. Contact success means that PostgreSQL confirmed the enquiry was saved.

## Tech Stack

- Next.js 16 App Router and React 19
- TypeScript 6
- Tailwind CSS 4 with PostCSS
- PostgreSQL with the `pg` driver
- Next.js `next/font` with self-hosted Parkinsans and DK Cool Crayon fonts
- ESLint 9
- Headless Chrome, `axe-core`, and custom Node.js scripts for browser verification

## Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm
- PostgreSQL 18 tools for the local database setup
- Google Chrome for browser-based verification scripts

### Install and run

```powershell
git clone <repository-url>
cd kalvia-website
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create the isolated local PostgreSQL cluster and apply migrations, run this before starting the app:

```powershell
npm run db:setup-local
npm run dev
```

The setup script uses `127.0.0.1:55432`, creates separate development and test databases, and writes local connection details under `.local/`. It can use another PostgreSQL installation by setting `POSTGRES_BIN`. Do not commit `.env.local`, `.local/`, database credentials, or production data.

### Useful commands

```powershell
npm run lint
npm run type-check
npm run build
npm start
npm run db:migrate
npm run db:prune
```

Browser checks expect a running production server. Set `TEST_ORIGIN` when it is not running on the script's default port. Set `CHROME_PATH` when Chrome is installed somewhere other than its default Windows location.

```powershell
npm run build
npm start
$env:TEST_ORIGIN = "http://127.0.0.1:3000"
npm run test:interactions
npm run test:accessibility
npm run test:delivery
npm run test:security
```

The verification reports are written to `docs/`. See the [accessibility notes](docs/accessibility/README.md), [contact operations](docs/contact/operations.md), [security configuration](docs/security/README.md), and [delivery verification](docs/delivery/README.md) for details.

## Environment Variables

Copy `.env.example` to `.env.local`. Every variable below is server-only. Never prefix these values with `NEXT_PUBLIC_` or commit real credentials.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Contact runtime | PostgreSQL connection for the restricted application role. |
| `MIGRATION_DATABASE_URL` | Database migrations | Direct connection for the schema-owner migration role. Keep it out of the app runtime. |
| `MAINTENANCE_DATABASE_URL` | Retention job | Connection for pruning expired enquiries and rate-limit buckets. |
| `CONTACT_ALLOWED_ORIGINS` | Contact runtime | Comma-separated exact origins allowed to submit the form. |
| `CONTACT_RATE_LIMIT_SECRET` | Contact runtime | At least 32 random characters, shared by all app instances. |
| `DATABASE_CA_CERT` | Optional | PEM certificate for remote database TLS when system CAs are insufficient. |
| `CONTACT_CLIENT_IP_HEADER` | Optional | One trusted client-IP header written by a configured hosting ingress. |
| `CSP_REPORT_ONLY` | Optional | Set to `true` to verify CSP in report-only mode. Defaults to `false`. |
| `SECURITY_HTTPS_ORIGIN` | Production only | Exact verified HTTPS origin that may receive HSTS. |
| `SITE_ORIGIN` | Optional | Canonical site origin for metadata, robots, and sitemap. Defaults to `https://kalvia.one`. |
| `LOCAL_POSTGRES_ADMIN_URL` | Local setup only | Existing local admin connection used by `db:setup-local`; never deploy it. |

Remote database connections must use TLS with certificate validation. The application role must not have schema, read, update, or delete access beyond the permissions required by the contact endpoint. See [contact operations](docs/contact/operations.md) for roles, rate limits, retention, retrieval, and backups.

## Deployment

The app can be deployed to a Node.js-compatible Next.js host:

```powershell
npm ci
npm run build
npm start
```

Configure the production environment before accepting contact submissions:

1. Provision a PostgreSQL database with separate application, migration, reader, and maintenance roles.
2. Set the production secrets and exact HTTPS origin in the host secret store.
3. Run `npm run db:migrate` from a release job using `MIGRATION_DATABASE_URL`; migrations do not run automatically at app startup.
4. Schedule `npm run db:prune` with `MAINTENANCE_DATABASE_URL` to enforce the 180-day enquiry retention period.
5. Configure encrypted backups, verify a restore rehearsal, and restrict staff retrieval to private database access.
6. Verify the homepage, error responses, `/api/contact`, CSP, cache headers, HTTPS redirect, and HSTS on the deployed host.

Production provisioning is not complete in this repository: no production database, backup schedule, hosting ingress, or restore rehearsal has been configured. The current Prisma Postgres proposal also does not provide the restricted PostgreSQL role model required by the application; resolve that constraint or choose a provider with role controls before launch.

## Project Structure

- `app/`: routes, metadata, global styles, and the contact API route
- `components/`: reusable UI and homepage sections
- `data/`: typed site and content data
- `lib/`: database, validation, metadata, and security modules
- `db/migrations/`: versioned PostgreSQL migrations
- `public/assets/`: website images and other public assets
- `kalvia-website/`: original static source retained as a migration reference
- `scripts/`: database, browser, accessibility, security, and delivery checks
- `docs/`: implementation verification and operational runbooks

## Contributing

1. Create a focused branch from the current default branch.
2. Keep content, visual, accessibility, and security changes consistent with the existing single-page experience.
3. Run `npm run lint`, `npm run type-check`, and `npm run build` before opening a pull request. Run the relevant database or browser checks when those areas change.
4. Describe the user-visible change, validation performed, environment assumptions, and any deployment or migration work in the pull request.

Do not include credentials, personal contact submissions, production exports, or generated local database files in commits. Do not edit an applied migration; add a new numbered migration instead.

## License

This repository does not currently include a license file or declare an open-source license. Unless the project owner adds one, the source remains "all rights reserved" and is not licensed for redistribution or reuse. Third-party dependencies retain their own licenses.
