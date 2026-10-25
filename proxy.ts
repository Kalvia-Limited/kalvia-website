import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy, hstsForOrigin } from "@/lib/security-headers";

export function proxy(request: NextRequest) {
  const development = process.env.NODE_ENV === "development";
  const nonce = randomBytes(24).toString("base64");
  const policy = contentSecurityPolicy(nonce, development);
  const headers = new Headers(request.headers);
  // Always replace caller-supplied policy/nonce values before Next.js renders.
  headers.set("Content-Security-Policy", policy);
  headers.delete("Content-Security-Policy-Report-Only");
  headers.set("x-nonce", nonce);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set(process.env.CSP_REPORT_ONLY === "true" ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", policy);
  // Nonced HTML must never be shared between responses. API errors are also uncached.
  response.headers.set("Cache-Control", "no-store");
  const hsts = hstsForOrigin(request.nextUrl.origin, process.env.NODE_ENV === "production", process.env.SECURITY_HTTPS_ORIGIN);
  if (hsts) response.headers.set("Strict-Transport-Security", hsts);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static/|_next/image|assets/|favicon.ico|robots.txt|sitemap.xml|opengraph-image|twitter-image).*)"],
};
