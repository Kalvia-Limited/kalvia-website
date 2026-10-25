export const siteTitle = "Kalvia | Enabling Prosperity";
export const siteDescription = "Practical technical training, professional skills and access to opportunity. Discover Kalvia Academy, Marketplace and the SOAT seal in Lagos, Nigeria.";
export function siteOrigin() {
  const value = (process.env.SITE_ORIGIN || "https://kalvia.one").trim().replace(/\/$/, "");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== value || url.username || url.password) throw new Error("SITE_ORIGIN must be an exact HTTPS origin");
  return value;
}
