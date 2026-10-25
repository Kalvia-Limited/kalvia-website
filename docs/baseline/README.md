# Existing website baseline

Recorded 23 October 2026 for implementation step 1. This is a migration reference, not a new implementation. The authoritative source is [current index.html](../../kalvia-website/index.html), supported by [styles.css](../../kalvia-website/styles.css), [script.js](../../kalvia-website/script.js), and the five files in `kalvia-website/assets/`. Keep those files intact. [index.original.html](../../kalvia-website/index.original.html) is historical comparison only: it embeds its main CSS and interaction script, whereas the current page loads the separate files. Do not substitute historical styling for the current responsive refinements.

## Structure and section order

This table follows the actual current HTML. Unnamed sections have no public navigation anchor; heading IDs label their sections rather than providing new destination pages.

| Order | Region / heading | Existing ID or label | Content and visual reference |
| --- | --- | --- | --- |
| 1 | Fixed header | `top`, `nav-links` | White pill navigation, blue logo, orange Get started, separate mobile menu button; progress bar above it. |
| 2 | Hero | `hero-title` | “Africa's next class of … starts here!”; rotating trade words; blue background, yellow arch, ripple lines, team cutout, SOAT and Business-ready chips. |
| 3 | Promise strip | What Kalvia promises | Mastery, built in; Trust you can see; Access to opportunity. Yellow three-column band. |
| 4 | Marquee | Decorative, `aria-hidden` | Mastery, Ethics, Access, Confidence, Assurance, Quality, Growth, Impact, repeated for continuous movement. |
| 5 | Why we exist / comparison | `about`, `why-title`, `cycle` | “Technical education was underbuilt. That is fixable.” Copy and old-cycle / With Kalvia diagram. This is the About destination. |
| 6 | Prosperity | `prosper-title`, `ripple-stage`, `ripple-svg`, `prosper-copy`, `chain` | Four nested arch stages; copy panel; People → Businesses → Families → Society; “Enabling Prosperity”. |
| 7 | Academy and Marketplace | `academy`, `brands-title` | “Learn the craft. Then find the work.” Two offering panels, each with three audience panels. Marketplace shares the Academy section anchor. |
| 8 | Journey | `journey-title`, `mark-stage`, `mark-zone`, `step-num` | “Absorb. Apply. Ascend.” Sticky logo illustration and three scroll-linked articles: book, gear, seeing eye. |
| 9 | SOAT | `soat`, `soat-title`, `seal`, `verify`, `soat-id`, `verify-result` | Shield artwork, one-year renewal explanation, facts 12 / 2 / 1, sample verification form. |
| 10 | Persona path finder | `finder`, `finder-title`, `finder-out` | “Who are you here as?” Student, parent/sponsor, technician, business choices with tailored copy and CTA. |
| 11 | Values | `values-title` | Six flip cards: Respect the Work and the Worker; Pursue Mastery; Own the Outcome; Earn Trust Every Day; Serve with Professionalism; Advance Together. Preserve front labels and back descriptions. |
| 12 | Gallery | Kalvia in the field | Machinist / “Theory becomes practice”; carpenter / “Respect the work”; site team / “Professional on every site”. |
| 13 | Vision and mission | `vision-title`, `vision-ripple` | “Beginning in Nigeria. Built for the continent.” Vision and mission cards, decorative arches; Brave, Honest, Confident, Reassuring, Informed pills. |
| 14 | Contact including closing CTA | `contact`, `contact-title`, `contact-form` | Orange “start enabling prosperity” band precedes the contact grid inside this section. “Let's build something that lasts.” Email, Yaba address, enquiry form. |
| 15 | Footer | `year` | Logo/tagline; Kalvia, Company, Visit columns; dynamic copyright year; Back to top. |

In particular, preserve **gallery before vision/mission** and **the CTA inside Contact**, even though later plan summaries group those items differently. Preserve all existing IDs when rebuilding; `k-mark` and `k-logo` are SVG symbol IDs used by `<use>`, not navigation links.

## Navigation and calls to action

| Location / action | Current destination | State change or migration mapping |
| --- | --- | --- |
| Header and footer logo; Back to top | `#top` | Scroll to header/top. |
| Header/footer Academy | `#academy` | Explicitly select Academy. |
| Header/footer Marketplace | `#academy`, `data-brand="market"` | Select Marketplace before scrolling; preserve this distinction. No separate `#marketplace` exists. |
| Header/footer SOAT / SOAT seal | `#soat` | Scroll to sample seal checker. |
| Header About; hero Why Kalvia; footer About us | `#about` | Scroll to Why we exist. |
| Header/hero/footer Get started | `#finder` | Scroll to persona chooser. |
| Header/footer Contact | `#contact` | Scroll to contact section. |
| Academy Apply to the Academy | `#contact` | Check `Academy` interest radio. |
| Marketplace Hire a technician | `#contact` | Check `Marketplace` interest radio. |
| Student persona Apply to the Academy | `#contact` | Check `Academy`. |
| Sponsor persona Sponsor a learner | `#contact` | Check `Sponsoring`. |
| Technician persona Join the Marketplace | `#contact` | Check `Marketplace`. |
| Business persona Talk to partnerships | `#contact` | Check `Partnership`. |
| Orange start enabling prosperity band | `#contact-form` | Scroll directly to form. |
| Contact email and footer Visit email (two links) | `mailto:hello@kalvia.one` | External application navigation. In migration render the address as information; an adjacent same-page enquiry action can target `#contact-form`. Do not launch an email client. |
| SOAT Verify / sample-ID buttons | Local submit / local button | Update result inline; no external register call. |
| Contact Send message | Intercepted local submit | Currently replaces form with simulated success; later step 8 must save to PostgreSQL before showing success. |

There are no external HTTP navigation links, telephone links, map links, social links, downloads, or new-tab destinations in the current page. The address is plain text: **50 Herbert Macaulay Way, Yaba, Lagos, Nigeria**. Google Fonts (`fonts.googleapis.com` stylesheet and `fonts.gstatic.com` font files) are external asset requests, not navigation; account for these separately when implementing fonts and CSP. SVG `href="#k-logo"` and `href="#k-mark"` reference local symbols.

## Interactive state inventory

These behaviours are derived from the current script and CSS. Responsive screenshots document rendered states; this inventory does not claim every interaction has received a browser smoke test.

| Feature | Initial state | Other states and triggers |
| --- | --- | --- |
| Header / progress | Unscrolled, progress zero | Scroll >40px deepens shadow; progress scales with scroll fraction. Hero photo parallax uses 0.12 × scroll while within first viewport. |
| Navigation tracking | No explicit initial active item | IntersectionObserver highlights `academy`, `soat`, `about`, `contact` around viewport centre. Marketplace links are deliberately excluded from active highlighting. |
| Mobile menu | Closed, `aria-expanded=false`, Open menu | Toggle opens/closes menu and changes label; selecting a link closes menu. Current close-on-link path does not reset the Close menu label. No Escape handler or focus management exists. |
| Reveals | Elements offset down 28px with JS enabled | Entering viewport at threshold .12 sets `.in` once; stagger delays .1/.2/.3s. Current CSS does not make unrevealed text transparent. |
| Hero words | technical professionals | Desktop >920px, normal motion: solar installers → electricians → plumbers → HVAC technicians → repeat, every 2400ms. Transition 600ms. Mobile/tablet show first phrase only. Preference and width checked at startup. |
| Before / after | The old cycle selected | Low trust / Low pay / Low aspiration, centre “No structure, no credentials” → Earned trust / Fair pay / Real careers, centre “Training, SOAT & access”. Switch thumb moves, diagram contracts for 220ms, ring changes colour/style/direction. `aria-pressed` tracks selection. |
| Prosperity | Students, first ring lit | Businesses → Parents & sponsors (Families prosper) → Society; each updates heading, paragraph, selected label, cumulative rings/chain and pulse. Auto-advance every 2600ms after stage reaches 50% visibility; stops at Society. Clicking label/ring selects stage and stops current timer. |
| Offering tabs | Academy visible, Marketplace hidden | Click or Left/Right arrow changes panel, selection and tab stop. Marketplace navigation selects market; ordinary Academy links select academy. Hidden panel uses `hidden`. |
| Academy audiences | Students: Relevance and quality | Parents & sponsors: Assurance for a stronger future; Enterprises: Impact you can measure. Each swaps who/title/copy, three bullet points, promise tags. |
| Marketplace audiences | Technicians: Access and structure | Customers: Reliable, skilled professionals; Enterprises: Professionalism in service delivery. Each swaps copy/bullets/tags. Audience selections persist independently when changing offering. Current audience tabs only handle clicks, without roving tabindex or arrow keys. |
| Journey | Absorb active, step 01, book highlight | Scroll centre selects Apply / 02 / gear and Ascend / 03 / eye, changing opacity, highlight position/height/colour and number. Logo remains sticky, smaller on narrow layouts. |
| SOAT seal / facts | Shield resting; 12-month counter begins at 0 | Hover-capable pointer tilts shield up to ±11 degrees per axis, resets on leave. Counter eases to 12 over 1200ms at .6 visibility; reduced motion sets final value directly. Other facts stay 2 and 1. |
| SOAT empty | Empty result hidden | Blank submission shows “Enter the ID printed on the technician's Kalvia card.” |
| SOAT valid sample | Submit `KA17/A` | Lagbaja Tamedu, Electrical installation, LT, “SOAT valid”; expiry eight months after page load. |
| SOAT expired sample | Submit `KA09/C` | Adebisi Adebolu, Solar PV installation, AA, “Renewal due”; expiry one month before page load. |
| SOAT unknown | Submit e.g. `UNKNOWN` | Sample-register not-found message, suggests checking ID/contacting Kalvia. IDs trimmed, uppercased, whitespace removed. Sample buttons populate and submit immediately. Dates depend on browser date, not a real register. |
| Persona finder | Student selected, Academy recommendation | Sponsor → sponsorship; technician → Marketplace; business → Academy + Marketplace partnership. Swap after 180ms; generated CTA prefills contact interest when clicked. Buttons expose `aria-pressed`, output `aria-live=polite`. |
| Values | Front faces visible | Hover flips using CSS; click/tap toggles `.flipped`. Native buttons permit keyboard activation, but back faces lack distinct accessible state. Hover can keep a clicked-off card visually flipped until pointer leaves. |
| Gallery and decorative effects | Arch crops and captions | Hover zoom 1.06; marquee runs for 38s and pauses on hover; hero chips float over 6s; links/buttons have hover and focus styling. |
| Contact interest | Academy checked | Sponsoring, Marketplace, Partnership; CTA delegation checks matching radio without submitting. |
| Contact fields | Empty name/email/message | Required name/message trim length >1; email uses simple regex. Invalid fields show border and helper error; first invalid input focused. Typing clears field error. No phone field in current form. |
| Contact success | No result | Any locally valid submission replaces entire form with “Thank you, [first name]!”, “Your message is on its way.” and email-reply claim. **No request, persistence, pending state, retry, rate limit or service error.** This preview copy must change when step 8 is implemented. |
| Footer year | HTML fallback 2026 | Script inserts browser's current year. |

Reduced motion disables CSS animations, makes transitions nearly immediate, disables smooth scrolling, hero rotation/parallax, prosperity autoplay and seal tilt, and immediately sets counters. JS copy-swap timeouts still run. Without JS, static content remains, but audience boxes, generated finder recommendation/ripples, verification and contact behaviours are unavailable; avoid carrying those content gaps into server rendering.

## Visual tokens, responsive layout and assets

Primary blues `#170C79`, `#271CC1`, `#0A0250`; orange `#FF5A00`; yellow `#FFAE00`; greens `#023903`, `#047D06`; passion red `#DB213A`. Page `#FBFAF7`, text `#0A0250`, secondary text `#4A4670`, white `#FFFFFF`. Preserve the light blue/yellow/orange/green tints defined in `:root`. Main font Parkinsans (300–800), accent Gochi Hand (a stated stand-in for DK Cool Crayon); system and cursive fallbacks. Container maximum 1200px with `clamp(16px,4vw,40px)` gutters, 32px/20px/pill radii, section vertical spacing `clamp(80px,11vw,140px)`, arch motifs and shadow treatments.

| CSS breakpoint | Layout change |
| --- | --- |
| ≤920px | Mobile navigation; header CTA hidden; hero stacks, visual minimum 400px, tag hidden, rotating phrase fixed to first item. |
| ≤900px | Offering cards stack; persona grid changes four columns to two. |
| ≤860px | Comparison, prosperity, journey, SOAT and contact stack; journey sticky mark becomes 150px; values three to two columns; footer four to two. |
| ≤760px | Promise and vision/mission stack; gallery becomes two columns and hides third image. |
| ≤560px | Persona grid becomes one column with horizontal cards; recommendation CTA stacks. |
| ≤520px | Values and paired name/email become single column; later rule sets value minimum height 170px; essence wraps. |
| ≤480px | SOAT fact cards and footer become one column; result badge can wrap. |

| Asset | HTML dimensions | Bytes | Use |
| --- | --- | --- | --- |
| `hero-team.webp` | 1200 × 689 | 120588 | Hero team cutout, eager/default loading. |
| `machinist.webp` | 733 × 1100 | 41816 | First gallery frame, lazy loading. |
| `workshop.webp` | 733 × 1100 | 94998 | Second gallery frame, lazy loading. |
| `site.webp` | 733 × 1100 | 52418 | Third gallery frame, lazy loading, hidden ≤760px. |
| `favicon.svg` | SVG | 14236 | Browser icon. |

All artwork beyond those assets is inline SVG, CSS or script-generated geometry: reusable logo/mark symbols, hero/vision/prosperity arch ripples, SOAT shield, persona/contact/promise icons, arch image frames, offering bars, journey highlight, progress bar and arrows. There are no other local asset files. Image natural dimensions and font load results are recorded in `capture-report.json`.

## Captures and reproduction

References are under [screenshots/](screenshots/). `mobile.png`, `tablet.png`, `desktop.png` show the initial viewport; matching `*-full.png` files record the entire page after scrolling through it to trigger lazy loading and reveals. `mobile-menu.png` records the expanded menu. Capture dimensions are CSS viewport pixels at device scale factor 1: mobile **390 × 844**, tablet **768 × 1024**, desktop **1440 × 1000**. These are responsive desktop-Chrome captures, not physical-device or touch emulation.

Run [capture-baseline.ps1](../../scripts/capture-baseline.ps1) from the workspace root in PowerShell with local Chrome installed. It opens an isolated temporary Chrome profile and uses the browser debugging protocol to set exact viewport dimensions (headless window flags alone can enforce a minimum width). It reads the current `index.html` through a file URL, waits for fonts, captures initial viewports, scrolls to load images/reveals, and captures full-page references without changing source files. For full-page capture it eagerly loads all four images, including the third gallery image hidden at narrow widths, to avoid waiting indefinitely for a hidden lazy image. Browser automation may require elevated execution in this environment. If local script-file execution is disabled, `& ([scriptblock]::Create((Get-Content -Raw ./scripts/capture-baseline.ps1)))` runs the same reviewed commands without changing system execution policy; this command completed successfully during baseline verification.

Animations remain enabled, so time-dependent hero wording, ripple selection and sticky journey state can differ between initial and full-page captures. Exact frame timing is not a migration requirement. Full-page PNGs use content width, excluding the 15px scrollbar: 375px mobile, 753px tablet, 1425px desktop. `capture-report.json` records actual viewport sizes, image loading, fonts, section/anchor inventory, JavaScript exceptions and browser version. The verified run loaded all four images at every size, loaded the used Parkinsans and Gochi Hand faces, and recorded no JavaScript exceptions. Unused font subsets can remain `unloaded`. Source SHA-256 hashes are saved in `source-manifest.json`; all nine reference files were checked and remain unchanged.

## Findings for later steps

- Preserve source copy and section order. Fix accessibility limitations in later interaction/accessibility work rather than treating them as requirements to reproduce: missing Escape/focus behaviour for menu, stale close-on-link label, incomplete audience keyboard semantics, value flip announcements and contact error associations.
- `index.html` and the historical HTML place title/metadata/links in the body after a short wrapper head. Use proper Next.js metadata/layout when rebuilding.
- Both existing forms are local previews. SOAT must remain an explicitly labelled demo; remove wording that implies a connected live register. Contact success must mean a database-confirmed save, with accurate copy and failures.
- Retain the UTF-8 punctuation as read from disk (arrows, middle dots, apostrophes, copyright). Default PowerShell decoding can display mojibake; that display alone is not evidence of source corruption.
- Fixed-header anchor offsets, narrow-screen wrapping/overflow and hidden content semantics need explicit verification in the rebuilt site. Baseline defects should be documented and corrected, not copied blindly.
