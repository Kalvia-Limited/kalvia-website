import type { Offering } from "./content";
export const site = { name: "Kalvia", email: "hello@kalvia.one", address: "50 Herbert Macaulay Way, Yaba, Lagos, Nigeria" } as const;
export interface NavigationItem { label: string; href: `#${string}`; brand?: Offering }
export const navigation: NavigationItem[] = [
  { label: "Academy", href: "#academy", brand: "academy" },
  { label: "Marketplace", href: "#academy", brand: "market" },
  { label: "SOAT", href: "#soat" }, { label: "About", href: "#about" }, { label: "Contact", href: "#contact" },
];
export interface SiteImage { src: string; width: number; height: number; alt: string; caption?: string }
export const heroImage: SiteImage = { src: "/assets/hero-team.webp", width: 1200, height: 689, alt: "Three Kalvia trainees in workwear, one holding a power tool" };
export const galleryImages: SiteImage[] = [
  { src: "/assets/machinist.webp", width: 733, height: 1100, alt: "A technician adjusting a machine in a workshop", caption: "Theory becomes practice" },
  { src: "/assets/workshop.webp", width: 733, height: 1100, alt: "A carpenter shaping wood with a chisel", caption: "Respect the work" },
  { src: "/assets/site.webp", width: 733, height: 1100, alt: "Two professionals in hard hats reviewing work on site", caption: "Professional on every site" },
];
