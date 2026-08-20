import type { APIRoute } from "astro";

// Server-side affiliate-click attribution beacon (deployed 2026-08-20).
//
// Receives a passive sendBeacon POST from the BaseLayout.astro click listener
// whenever a visitor clicks an affiliate Special Link (a[data-affiliate="1"]).
// The row lands in the affiliate_clicks D1 table REGARDLESS of cookie consent
// — this is the cookieless server-side measurement path that closes the GA4
// Consent Mode v2 attribution gap (see AGENTS.md RESULT (2026-08-14)).
//
// Compliance: passive first-party analytics. The listener never modifies
// href/rel/target/linkCode/tag; this endpoint only records what was clicked,
// never the affiliate_url itself (no Program Content exposure — the Special
// Link URLs with the Associates tag are never logged or returned). No PII is
// captured (no IP, no user-agent, no cookies), so no consent is required to
// record these events server-side.

const MAX_BODY_BYTES = 1024;
const MAX_PAGE_PATH = 512;
const MAX_PRODUCT_SLUG = 120;
const MAX_RETAILER = 32;
const MAX_CTA = 64;

export const POST: APIRoute = async ({ locals, request }) => {
  const { DB, tenant } = locals;
  if (!DB || !tenant) {
    return new Response("Internal server error", { status: 500 });
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return new Response("Payload too large", { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return new Response("Invalid payload", { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const pagePath =
    typeof b.page_path === "string" && b.page_path.length <= MAX_PAGE_PATH
      ? (b.page_path || "/")
      : null;
  const productSlug =
    typeof b.product_slug === "string" && b.product_slug.length <= MAX_PRODUCT_SLUG
      ? b.product_slug
      : null;
  const retailer =
    typeof b.retailer === "string" && b.retailer.length <= MAX_RETAILER
      ? b.retailer
      : null;
  const ctaLabel =
    typeof b.cta_label === "string" && b.cta_label.length <= MAX_CTA
      ? b.cta_label
      : null;

  if (!pagePath) {
    return new Response("Missing page_path", { status: 400 });
  }

  try {
    await DB.prepare(
      "INSERT INTO affiliate_clicks (site_id, page_path, product_slug, retailer, cta_label) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(tenant.id, pagePath, productSlug, retailer, ctaLabel)
      .run();
  } catch (err) {
    console.error("affiliate-click insert failed:", err);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
};