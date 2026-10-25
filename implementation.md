# Kalvia website implementation plan

## Objective

Rebuild the existing Kalvia website using Next.js and Tailwind CSS as a simple, single-page information website. Preserve the current branding, content, section order, responsive layouts, and useful interactions. Keep navigation and calls to action within the page, without external redirects.

The existing source is in `kalvia-website/`: `index.html`, `styles.css`, `script.js`, and `assets/`. Keep these files intact as the migration reference. Build the Next.js application at the workspace root.

## Scope

- One public homepage with section anchors.
- Existing content, images, SVG artwork, and visual identity.
- Local interactive features and animations.
- A live contact form that saves enquiries to a simple PostgreSQL database through a server-side endpoint.
- Security headers and basic protections for the contact endpoint and stored enquiries.
- Clearly labelled demonstration for SOAT verification.
- No user accounts, payments, CRM, live technician verification, or email notifications at this stage. Contact submission success means the enquiry was saved to PostgreSQL.
- No new destination pages or external navigation at this stage.

## Step-by-step implementation

### 1. Record the existing website baseline

- [x] Review the current HTML, stylesheet, scripts, and assets.
- [x] Record all sections, navigation anchors, calls to action, and interactive states.
- [x] Capture reference screenshots at mobile, tablet, and desktop sizes.
- [x] Identify any external navigation and map it to an appropriate section or informational action on the same page.
- [x] Use the current `index.html` as the primary reference; retain `index.original.html` for historical comparison.

Baseline recorded on 23 October 2026: [structure, behaviours, assets, navigation mapping and capture notes](docs/baseline/README.md), [responsive reference screenshots](docs/baseline/screenshots/), [browser capture report](docs/baseline/capture-report.json), and [source integrity manifest](docs/baseline/source-manifest.json). Existing source files remain unchanged. Later implementation steps remain pending.

**Complete when:** the page structure and behaviours to preserve are documented and visually captured.

### 2. Initialise the application

- [x] Create a Next.js project at the workspace root with App Router, TypeScript, Tailwind CSS, and ESLint.
- [x] Add development, production build, production start, lint, and type-check commands.
- [x] Create the initial structure:

```text
app/
  layout.tsx
  page.tsx
  globals.css
  api/
    contact/
      route.ts
components/
  ui/
  sections/
data/
  site.ts
lib/
  db.ts
  contact-validation.ts
db/
  migrations/
public/
  assets/
next.config.ts
.env.example          # Variable names and placeholders only
kalvia-website/       # Existing reference source
implementation.md
```

- [x] Keep the homepage and static sections server-rendered; add client components where interaction requires them.

**Complete when:** the homepage runs locally and the initial production build succeeds.

### 3. Establish the visual foundation

- [x] Translate the existing colours, fonts, spacing, radii, shadows, and breakpoints into Tailwind theme values.
- [x] Configure Parkinsans and Gochi Hand while retaining suitable fallback fonts.
- [x] Set up global typography, page background, section spacing, and anchor scroll offsets.
- [x] Build shared containers, buttons, cards, tabs, and form controls.
- [x] Preserve the Kalvia logo, arch shapes, decorative SVG graphics, and brand treatments.
- [x] Reserve custom CSS for graphics, keyframes, and effects that need it.

**Complete when:** shared elements match the existing visual style at the target screen sizes.

### 4. Migrate content and assets

- [x] Copy the existing WebP images and favicon into `public/assets/`.
- [x] Convert inline SVG artwork into reusable React components where appropriate.
- [x] Move repeated audience, persona, value, and navigation content into typed data structures.
- [x] Preserve existing wording and correct any confirmed text-encoding issues.
- [x] Add descriptive image alternatives and mark decorative artwork appropriately.
- [x] Use Next.js image handling with explicit dimensions or stable aspect ratios.

**Complete when:** all existing content and assets are available in the new application without broken references.

### 5. Rebuild the static page sections

- [x] Header, navigation, and mobile menu layout.
- [x] Hero section and imagery.
- [x] Before/after comparison.
- [x] Prosperity graphic and supporting copy.
- [x] Academy and Marketplace content, including audience panels.
- [x] Absorb / Apply / Ascend journey.
- [x] SOAT information and demonstration area.
- [x] Persona path finder.
- [x] About, values, vision, and mission content.
- [x] Image gallery.
- [x] Contact information and enquiry form layout (live submission is implemented in step 8).
- [x] Closing call to action and footer.

Preserve the source section order and existing anchor IDs so internal navigation continues to work.

**Complete when:** the entire page is present and visually comparable to the existing website.

Static page verification: production screenshots at 390, 768 and 1440px are in "docs/static-page/". Local interactions remain step 6; live contact persistence remains step 8.

### 6. Restore local interactions

- [x] Replace direct DOM updates with React state and declarative rendering.
- [x] Implement mobile menu opening, closing, accessible labels, and keyboard behaviour.
- [x] Restore active-section navigation and same-page scrolling.
- [x] Restore the rotating hero headline with a stable mobile layout.
- [x] Implement the before/after switch and prosperity-stage selection.
- [x] Implement Academy / Marketplace tabs and their audience tabs with keyboard support.
- [x] Restore the journey's scroll-linked active steps.
- [x] Restore persona selection and contact-interest prefilling.
- [x] Restore value-card flips for mouse, touch, and keyboard input.
- [x] Restore reveal effects, counters, progress indicator, and seal movement.
- [x] Clean up timers, event listeners, and observers when components unmount.
- [x] Respect reduced-motion preferences and keep content readable without animation.

**Complete when:** the existing interactive states work without navigation away from the page or browser console errors.

Completed on 23 October 2026. React state now drives the local interactions, with keyboard and touch support, reduced-motion handling, and cleanup of timers, observers and listeners. Production build, lint and TypeScript checks pass. All 71 production-browser checks pass with no console errors; see [verification report](docs/interactions/check-report.json) and [responsive screenshots](docs/interactions/). Run the checks with `npm run test:interactions` against the running production app. Contact persistence remains step 8.

### 7. Keep SOAT as a demo and navigation within the page

- [x] Keep SOAT sample records local and label the verification area as a demo.
- [x] Show sample valid, expired, and unknown-ID states without suggesting a live register was queried.
- [x] Ensure application, sponsorship, marketplace, partnership, and footer actions stay within the page.
- [x] Display contact details as information without introducing external redirects.

**Complete when:** SOAT is clearly identified as a demonstration and navigation stays within the homepage.

Completed on 23 October 2026. SOAT uses explicit local sample fixtures and labels its valid, expired and unknown-ID results as demonstration data. The form makes no verification requests; email and address details are informational, and all navigation and calls to action resolve to existing homepage anchors. Lint, TypeScript and the production build pass. All 103 [production browser checks](docs/interactions/check-report.json) pass, including ID normalization, empty and unknown inputs, text-safe rendering, every anchor action, and absence of verification or page-navigation requests.

### 8. Connect PostgreSQL and implement the live contact form

- [ ] Set up separate development and production PostgreSQL databases and a server-only `DATABASE_URL` environment variable. Never expose database credentials through `NEXT_PUBLIC_` variables or commit them to source control.
- [x] Add a server-only database module with connection pooling suitable for the chosen hosting environment and TLS for remote production connections.
- [x] Create a versioned migration for a `contact_submissions` table containing an ID, name, email, optional phone, interest, message, and creation timestamp. Collect only fields used by the form.
- [x] Apply the migration in development and document how production migrations are run.
- [x] Use a restricted application database role and parameterised queries. Keep schema migration privileges separate from normal application access.
- [x] Implement a same-origin `POST /api/contact` endpoint that validates and normalises all fields on the server, enforces field and request-size limits, and accepts only supported interest values.
- [x] Reject unsupported methods and content types; check the request origin against configured site origins and do not enable broad cross-origin access.
- [x] Add a honeypot and rate limiting that works across production instances, using trusted proxy information when identifying clients. Define how limits behave during service failures.
- [x] Connect the existing contact form and interest prefilling to this endpoint without navigating away from the homepage.
- [x] Add pending, validation-error, rate-limit, success, and service-error states. Prevent repeated clicks while submitting and preserve entries after a failed request.
- [x] Show success only after the database confirms the insert, using wording such as "Your enquiry has been received." Do not claim that an email was sent.
- [x] Return generic server-error messages, disable caching of contact responses, and keep credentials, message contents, and personal information out of application logs.
- [x] Add a short notice beside the form explaining what information is stored and why. Define a retention period and a routine for deleting old submissions.
- [x] Document how authorised staff retrieve enquiries through restricted database access; no public listing endpoint or admin dashboard is needed for this phase.
- [ ] Configure production backups and document a restore procedure.

**Complete when:** a valid submission creates a PostgreSQL record, invalid or blocked submissions create none, database failures show an accurate error, and enquiries are accessible only through authorised database access.

Implemented and verified locally on 23 October 2026: isolated development/test PostgreSQL databases, versioned migration, restricted application/reader/maintenance roles, shared database rate limiting, live enquiry form and endpoint, privacy notice, retention command, and [operations/restore instructions](docs/contact/operations.md). Lint, TypeScript and production build pass; [39 PostgreSQL integration checks](docs/contact/check-report.json) and [114 browser checks](docs/interactions/check-report.json) pass.

**Production items pending:** no production database has been provisioned and no production backup schedule is active. The requested Prisma Postgres provider gives all credentials full database access, which conflicts with the restricted application-role requirement; resolve that exception or choose a provider with role controls before production setup. Production migrations, trusted ingress, retention scheduling and a backup/restore rehearsal require the eventual hosting/database configuration. Step 8 remains partially complete until the two unchecked production items are verified.

### 9. Add and verify security headers

- [x] Configure response headers in Next.js or the hosting layer, with clear ownership to avoid conflicting duplicate policies.
- [x] Define a Content Security Policy (CSP) restricted to the scripts, styles, images, fonts, and connections the site actually uses. Include `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'none'`.
- [x] Choose a CSP strategy compatible with Next.js rendering and inline bootstrap scripts. Use nonces or hashes where needed, avoid broad production script allowances, and account for any effect on static rendering and caching.
- [x] Test the CSP in report-only mode before enforcement and verify that production navigation, hydration, images, fonts, animations, and contact submissions still work. Keep development-only allowances out of production.
- [x] Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY` alongside the CSP framing restriction.
- [x] Add a `Permissions-Policy` disabling unused capabilities such as camera, microphone, and geolocation.
- [ ] Enable `Strict-Transport-Security` on production HTTPS responses after confirming HTTPS configuration. Include subdomains only if all relevant subdomains support HTTPS; do not enable preload by default.
- [ ] Verify headers on deployed page, API, and error responses, and check that contact responses use `Cache-Control: no-store`.

**Complete when:** production responses carry the intended headers and the enforced CSP allows required site functionality without unnecessary permissions.

Implemented and verified locally on 23 October 2026. Next.js owns the common headers; the proxy supplies per-response CSP nonces, and HTML is rendered dynamically with no-store caching. Report-only verification ran before enforcement. [272 security-header checks](docs/security/check-report.json), [120 report-only browser checks](docs/security/browser-report-only.json), and [120 enforced-CSP browser checks](docs/security/browser-enforce.json) pass, including real PostgreSQL contact saves and an injected-script negative control. See [header ownership, CSP strategy and HTTPS rollout instructions](docs/security/README.md).

**Deployment items pending:** no production HTTPS origin or hosting ingress has been configured. HSTS is implemented but stays disabled until `SECURITY_HTTPS_ORIGIN` is set after HTTPS verification; it applies only to that exact production HTTPS origin, without subdomains or preload. Actual deployed page, API and hosting-error responses must still be checked before ticking the two remaining items. Local production-build verification does not establish deployed HTTPS behavior.

### 10. Refine responsive layouts and accessibility

- [x] Compare the rebuilt page with reference screenshots at mobile, tablet, and desktop widths.
- [x] Resolve horizontal overflow, text wrapping, image cropping, and sticky-element overlap.
- [x] Check heading hierarchy, landmarks, labels, contrast, and visible focus states.
- [x] Verify tabs, menu controls, flip cards, and form fields using the keyboard.
- [x] Ensure status messages are announced appropriately and hidden panels are excluded from keyboard navigation.
- [x] Check that reduced-motion settings leave all content usable.

**Complete when:** the page is usable across screen sizes and its main interactions work with keyboard and touch input.

Completed on 23 October 2026. Mobile reflow, readable contrast, 44px control targets, scrolling landscape menus, skip navigation, valid heading/ARIA semantics, screen-reader descriptions, visible field focus, and motion controls are implemented. The mobile comparison uses readable stacked cards; prosperity controls sit below the graphic, the journey graphic does not cover text, and every gallery image remains available. Cards and calls to action reflow with text enlarged to 200%.

Verification: [131 mobile/accessibility checks and 22 axe audits](docs/accessibility/audit.json) pass across nine viewport sizes, with zero automated violations, clipped controls or horizontal overflow in the checked states. All 115 existing interaction checks pass. Lint, TypeScript and production build pass. See [responsive screenshots and verification notes](docs/accessibility/README.md).

### 11. Add metadata and optimise delivery

- [x] Add the site title, description, favicon, theme colour, and social-preview metadata.
- [x] Add robots and sitemap configuration using the confirmed production URL when available.
- [x] Optimise image loading, prioritising the main hero image and deferring lower-page imagery.
- [x] Prevent layout shifts by reserving image and rotating-headline space.
- [x] Keep client-side JavaScript focused on interactive components.

**Complete when:** metadata is present and production checks show no avoidable asset or layout problems.

Completed on 23 October 2026 using the confirmed production origin `https://kalvia.one`. Canonical, crawler and social metadata, branded social images, responsive image sizes, hero preload and deferred gallery loading are implemented. Static content remains server-rendered. [25 production delivery checks](docs/delivery/check-report.json) pass at mobile, tablet and desktop sizes, with stable hero/headline dimensions, no horizontal overflow or browser errors, and negligible measured layout shift. Lint, TypeScript and production build pass. See [delivery configuration and verification limits](docs/delivery/README.md).

### 12. Validate and document the handover

- [ ] Run linting, TypeScript checks, and the production build.
- [ ] Smoke-test the production app and check for hydration errors and missing assets.
- [ ] Test every navigation item, tab, persona choice, demo verification state, and live contact-form state.
- [ ] Add focused integration tests for valid submissions, invalid input, origin checks, request limits, spam protection, and database failures. Verify persisted records and ensure rejected submissions are not saved.
- [ ] Check production security headers and CSP enforcement, including contact endpoint and error responses.
- [ ] Confirm no links or actions navigate to external destinations.
- [ ] Confirm contact submissions use only the intended same-origin endpoint and SOAT makes no live technician-verification requests.
- [ ] Add a README covering setup, commands, component structure, content edits, SOAT demo limitations, database provisioning, migrations, environment variables, enquiry retrieval, retention, backups, rate limiting, and security-header configuration.
- [ ] Record any remaining visual differences or known issues.
- [ ] Prepare the application for hosting with a server runtime for the contact endpoint, production PostgreSQL connectivity, and environment configuration; a static-only export will not support this form. Deployment is a separate step when requested.

**Complete when:** the production build passes, the single-page experience works as intended, and setup and maintenance instructions are available.

## Delivery checklist

- [ ] Next.js and Tailwind implementation is complete.
- [ ] Existing branding, content, imagery, and section order are preserved.
- [x] Navigation and calls to action remain within the homepage.
- [x] Existing local interactions are restored.
- [x] SOAT verification is explicitly labelled as a demonstration.
- [x] The live contact form saves validated enquiries to PostgreSQL and reports success or failure accurately.
- [x] Database migrations, restricted access, secrets, backups, and retention are documented.
- [x] Contact endpoint validation, spam protection, and rate limiting are verified.
- [ ] Production security headers and an enforced, compatible CSP are verified.
- [x] Mobile, tablet, desktop, and keyboard checks pass.
- [ ] Lint, type checks, and production build pass.
- [ ] Original source files remain intact.
- [ ] README documents how to run and update the site.
