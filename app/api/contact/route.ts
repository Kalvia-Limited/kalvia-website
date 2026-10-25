import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { getPool } from "@/lib/db";
import { validateContact } from "@/lib/contact-validation";
export const runtime = "nodejs";
const maxBytes = 24 * 1024;
const reply = (status: number, body: object, headers = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
const unavailable = () => reply(503, { error: "We couldn't save your enquiry. Please try again later." });

export async function POST(request: Request) {
  const origins = (process.env.CONTACT_ALLOWED_ORIGINS ?? "").split(",").map(value => value.trim()).filter(Boolean);
  if (!origins.length) return unavailable();
  if (!origins.includes(request.headers.get("origin") ?? "") || ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "")) return reply(403, { error: "This request is not allowed." });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json" || request.headers.has("content-encoding")) return reply(415, { error: "Send an uncompressed JSON enquiry." });
  if (Number(request.headers.get("content-length")) > maxBytes) return reply(413, { error: "Your enquiry is too large." });
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: "Please complete the enquiry form." });
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); return reply(413, { error: "Your enquiry is too large." }); }
      chunks.push(value);
    }
    input = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
  } catch { return reply(400, { error: "Send a valid JSON enquiry." }); }
  const { data, errors } = validateContact(input);
  if (!data) return reply(422, { error: "Please check the highlighted fields.", errors });
  if (data.website) return reply(400, { error: "Unable to accept this enquiry." });
  try {
    const secret = process.env.CONTACT_RATE_LIMIT_SECRET;
    if (!secret || secret.length < 32 || secret === "REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS") return unavailable();
    let client = "shared";
    const header = process.env.CONTACT_CLIENT_IP_HEADER;
    if (header) {
      // Configure only a header the hosting ingress overwrites. Never trust arbitrary forwarded headers.
      const address = request.headers.get(header)?.trim();
      if (!address || !isIP(address)) return unavailable();
      const canonical = isIP(address) === 6 ? new URL(`http://[${address}]/`).hostname : address;
      client = createHmac("sha256", secret).update(canonical).digest("hex");
    }
    const pool = getPool();
    const global = await pool.query<{ allowed: boolean }>("SELECT contact_private.consume_limit($1, $2, $3) AS allowed", ["global", 100, 600]);
    if (!global.rows[0].allowed) return reply(429, { error: "Too many enquiries. Please try again in 10 minutes." }, { "Retry-After": "600" });
    if (client !== "shared") {
      const limit = await pool.query<{ allowed: boolean }>("SELECT contact_private.consume_limit($1, $2, $3) AS allowed", [client, 5, 600]);
      if (!limit.rows[0].allowed) return reply(429, { error: "Too many enquiries. Please try again in 10 minutes." }, { "Retry-After": "600" });
    }
    const saved = await pool.query("INSERT INTO public.contact_submissions (name, email, interest, message) VALUES ($1, $2, $3, $4)", [data.name, data.email, data.interest, data.message]);
    if (saved.rowCount !== 1) return unavailable();
    return reply(201, { message: "Your enquiry has been received." });
  } catch { return unavailable(); }
}
const methodNotAllowed = () => reply(405, { error: "Use POST to submit an enquiry." }, { Allow: "POST" });
export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE, methodNotAllowed as OPTIONS, methodNotAllowed as HEAD };
