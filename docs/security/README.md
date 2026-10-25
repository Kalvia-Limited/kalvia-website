# Security headers and CSP

## Ownership and rendering

Next.js owns the application headers. `next.config.ts` applies the common headers from `lib/security-headers.ts` to page, API, error and asset responses. `proxy.ts` generates a cryptographically random 192-bit nonce for each page/API/error request, replaces any caller-supplied nonce or CSP headers, forwards the policy internally for Next.js rendering, and emits exactly one CSP response policy.

The root layout calls `connection()` so HTML, including the 404 page, is rendered for each request. Next.js reads the internal request CSP and puts its nonce on bootstrap scripts. These responses use `Cache-Control: no-store`; do not enable full-page CDN caching, static export, ISR or shared HTML caching without replacing the nonce strategy. Static JS, CSS, fonts, images and assets are excluded from nonce generation and retain their normal asset caching. They still receive the common security headers. The contact API independently sets `Cache-Control: no-store` for every success/error/method response.

Do not append another CSP or competing copies of these headers at a CDN or hosting proxy. Multiple CSP policies intersect and can break hydration. If a host injects headers by default, check actual wire responses and designate a single owner. This configuration disables `X-Powered-By`.

## Production policy

- Scripts require the response nonce and use `strict-dynamic` so trusted Next.js runtime code can load its chunks. Inline event handlers are blocked. Production has no `unsafe-inline`, `unsafe-eval`, wildcard or scheme allowlist for scripts.
- Stylesheets load from the same origin; inline style elements require a nonce. `style-src-attr 'unsafe-inline'` supports the existing React style props, decorative SVG geometry, scrolling transforms and progress indicator. This exception applies only to style attributes, not scripts or arbitrary style elements.
- Images and bundled Parkinsans/DK Cool Crayon fonts load from the same origin. Connections, including `POST /api/contact`, are limited to the same origin. No external font or technician-register requests are needed.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'` are set. Frames, media and workers are disabled because the site does not use them.
- Common headers are `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a Permissions-Policy disabling camera, microphone, geolocation, payment, USB and browsing topics.

Development alone allows `unsafe-eval` for React/Next.js diagnostics, inline style elements for development tooling, and WebSocket connections for HMR. The production browser/header tests reject those allowances in a production build. No CSP collector endpoint is installed: browser verification captures `securitypolicyviolation` events without sending page or enquiry data to a reporting service.

## Report-only rollout

Set the server-only `CSP_REPORT_ONLY=true` before starting the production runtime to emit `Content-Security-Policy-Report-Only` instead of the enforced header. Next.js still receives the policy internally and renders matching nonces. Review the browser's CSP diagnostics while exercising every section, menu, tab, image, font and contact form state. An intentionally untrusted script is expected to run and produce a report-only violation during the negative-control test.

After report-only verification, set `CSP_REPORT_ONLY=false` (the default) and restart the runtime. Repeat the checks under enforcement. The intentionally injected script must now be blocked while normal functionality has no CSP violations. Do not solve violations by adding general script `unsafe-inline`, `unsafe-eval`, wildcards or external schemes to production.

## HTTPS and HSTS: deployment work pending

No production domain, hosting ingress or HTTPS deployment is configured in this workspace, so production HTTPS and deployed headers have not been verified. Local HTTP verification does not complete those deployment items in step 9.

`SECURITY_HTTPS_ORIGIN` is empty by default. Leave it empty until the actual production HTTPS origin and request protocol are verified. Then set it to the exact HTTPS origin with no trailing slash, for example `https://your-confirmed-domain.example`. On a production request whose origin matches that value, the proxy emits `Strict-Transport-Security: max-age=31536000`. The application does not enable `includeSubDomains` or `preload`.

Do not set a fake HTTPS origin for the local HTTP server, or trust an arbitrary client-supplied forwarded-protocol header. At a TLS-terminating host, confirm what origin/protocol Next.js actually receives and that the ingress overwrites any forwarded headers it uses. If the host cannot provide a trustworthy HTTPS request origin, explicitly move HSTS ownership to that verified TLS terminator and avoid also setting it in Next.js. Confirm HTTP-to-HTTPS redirects and HTTPS for all intended entry points before enabling HSTS. Keep development/preview HTTP origins outside the production setting.

After deployment, check the raw headers on the homepage, 404 HTML, API 201, 400/403/405/413/415/422/429/503 responses as applicable, and hosting-generated errors. Confirm exactly one CSP, the common headers, no-store contact responses and HSTS on production HTTPS. Hosting-generated errors may need headers configured at the host; local Next.js checks cannot prove that behavior. Check real browser hydration, local navigation, animations, self-hosted fonts, image loading and successful database persistence with the enforced policy. Record the deployed origin, date, and results before ticking the two remaining deployment items.

## Repeatable verification

Use the installed Node.js 24 runtime and Chrome, then run:

```powershell
npm run lint
npm run type-check
npm run build
npm run test:security
```

The security script starts production servers on loopback ports 3100 and 3101, first in report-only mode and then in enforced mode. It uses the isolated `kalvia_test` database, resets its rate-limit buckets and saves synthetic enquiries; it never uses the development enquiry database or a production database. It checks response headers, nonces, request-header spoofing, cache behavior and HSTS configuration boundaries. Each browser suite verifies the full existing interaction/form behavior, real contact insertion under CSP, fonts, images, nonce-bearing scripts and zero spontaneous CSP violations. Its negative control adds an untrusted parser-inserted script to a local test HTML response, then verifies report-only versus blocked behavior. This test HTML is supplied only through Chrome's test interception and is not part of application code.

Set `CHROME_PATH` if Chrome is installed elsewhere. The tests write `check-report.json`, `browser-report-only.json` and `browser-enforce.json` in `docs/security/`. Those reports explicitly distinguish local production-build verification from deployed HTTPS verification. Contact/backend behavior is also covered by `npm run test:contact`.

Reference: the installed Next.js guide at `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`, [MDN CSP nonces and strict-dynamic](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), and [MDN style attribute policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr).
