# Metadata and asset delivery

The confirmed public origin is `https://kalvia.one`. `SITE_ORIGIN` can override this exact HTTPS origin; rebuild after changing it. Canonical, Open Graph, Twitter, robots and sitemap URLs share this configuration. The sitemap lists the single homepage; section anchors are not separate pages. Robots permits public crawling and excludes `/api/`; this is a crawler preference, not access control. The SVG favicon and generated 1200 × 630 social images use existing branding.

The hero image is preloaded with responsive sizes. Gallery images use responsive sizes, lazy loading and asynchronous decoding. Explicit image dimensions, frame aspect ratios and the rotating headline's shared grid reserve layout space. Parkinsans remains primary and DK Cool Crayon remains secondary; the secondary font is self-hosted and is not preloaded on mobile, where the hero accent is hidden.

The homepage remains a Server Component. State, observers and event handlers stay in the existing interactive components; static section content is passed as server-rendered children. Metadata and social-image generation add no client-side JavaScript.

Run `npm run build`, start the production server, then run `npm run test:delivery` (default `TEST_ORIGIN=http://127.0.0.1:3300`). The script requires Chrome, with optional `CHROME_PATH`, and writes `check-report.json` and `social-preview.png` here.

Verification on 23 October 2026: 25 checks passed, including actual PNG dimensions, canonical and crawler metadata, hero preload, gallery deferral, stable image/headline dimensions and absence of browser errors. Cold browser navigation at 390px and 768px recorded no layout shifts; 1440px recorded about 0.00034 from the accent font swap. These are local lab samples, not field Core Web Vitals or a complete performance audit. The social preview was visually inspected. The existing Parkinsans fallback-metrics build warning remains; the font loads correctly.

This configuration does not deploy the site or verify production HTTPS. HSTS and deployed-header checks remain separate pending deployment work.
