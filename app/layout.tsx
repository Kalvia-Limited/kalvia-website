import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./reference-layout.css";
import { Parkinsans } from "next/font/google";
import localFont from "next/font/local";
import { connection } from "next/server";
import { siteDescription, siteOrigin, siteTitle } from "@/lib/site-metadata";
const mainFont = Parkinsans({ subsets: ["latin"], display: "swap", variable: "--font-parkinsans" });
const accentFont = localFont({ src: "./fonts/dk-cool-crayon.ttf", weight: "400", style: "normal", display: "swap", variable: "--font-dk-cool-crayon", fallback: ["cursive"], adjustFontFallback: false, preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()), title: siteTitle, description: siteDescription,
  alternates: { canonical: "/" }, icons: { icon: { url: "/assets/favicon.svg", type: "image/svg+xml" } },
  openGraph: { type: "website", locale: "en_NG", siteName: "Kalvia", title: siteTitle, description: siteDescription, url: "/" },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription },
};
export const viewport: Viewport = { themeColor: "#170C79", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Include the request nonce in framework scripts, including on HTML error pages.
  await connection();
  return <html lang="en" className={`${mainFont.variable} ${accentFont.variable}`}><body>{children}</body></html>;
}
