import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";
export default function sitemap(): MetadataRoute.Sitemap {
  // Only one public page. Anchor sections and the API are not destination pages.
  return [{ url: `${siteOrigin()}/` }];
}
