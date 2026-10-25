/** Next.js owns these headers. Do not append duplicate policies at the host/CDN. */
export const commonSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

export function contentSecurityPolicy(nonce: string, development: boolean) {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    development ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    // React uses style attributes for SVG geometry, transforms, and the progress bar.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    development ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "media-src 'none'",
    "manifest-src 'self'",
  ].join("; ");
}

export function hstsForOrigin(requestOrigin: string, production: boolean, confirmedOrigin?: string) {
  if (!production || !confirmedOrigin) return undefined;
  try {
    const origin = new URL(confirmedOrigin);
    if (origin.protocol === "https:" && origin.origin === confirmedOrigin && requestOrigin === confirmedOrigin) return "max-age=31536000";
  } catch { /* Leave HSTS off until an exact HTTPS origin has been confirmed. */ }
  return undefined;
}
