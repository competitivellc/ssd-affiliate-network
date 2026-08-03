import type { APIRoute } from "astro";
import {
  getAllProducts,
  getHubsBySite,
  getCategoriesBySite,
} from "@lib/db";

// Cache TTL shortened from 24h to 5m so per-route lastmod changes
// (e.g. after a deploy) propagate to Googlebot within minutes, not a day.
// Old 24h TTL was holding the stale 2026-07-03 lastmod on every URL for
// 30+ days, signaling "site dormant" and crushing crawl budget.
const CACHE_TTL_MS = 5 * 60 * 1000;

// Slugs that are 301-redirected away (cannibalization consolidation,
// commit 0687666). Must NOT appear in the sitemap — Google would
// obediently crawl the redirect target, but the entries themselves
// are noise that dilutes crawl priority for real URLs.
const REDIRECTED_SLUGS = new Set([
  "samsung-t7-shield",
  "samsung-t7-shield-portable",
]);

// Today's date as YYYY-MM-DD. Used as the lastmod for static pages
// (about/contact/privacy/terms/methodology) and as a floor for any
// URL whose DB timestamp is missing or older than the last deploy.
// Rationale: every deploy touches the rendered HTML of every route,
// so "today" is a truthful lastmod for static pages even when their
// underlying content didn't change.
const TODAY = new Date().toISOString().split("T")[0];

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  return d.split(" ")[0];
}

// Emit a <url> entry, deduplicating on loc so we don't double-list
// URLs that could be reached by multiple code paths.
function pushEntry(
  entries: string[],
  seen: Set<string>,
  loc: string,
  lastmod: string,
  changefreq = "weekly",
  priority = "0.7",
): void {
  if (seen.has(loc)) return;
  seen.add(loc);
  entries.push(
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  );
}

async function buildSitemapXml(
  DB: import("@cloudflare/workers-types").D1Database,
  tenant: { id: string },
  hostname: string,
): Promise<string> {
  const baseUrl = `https://${hostname}`;

  const [products, hubs, categories] = await Promise.all([
    getAllProducts(DB, tenant.id),
    getHubsBySite(DB, tenant.id),
    getCategoriesBySite(DB, tenant.id),
  ]);

  // Per-URL lastmod strategy:
  //  - products: their own updated_at (most actionable signal)
  //  - hubs/categories/brands/home/compare/hubs index: TODAY, because
  //    the page content is dynamic (DB-driven) and any deploy may
  //    change what's rendered. Floor at TODAY so Google always sees
  //    "this URL was touched recently".
  //  - static pages (about/contact/etc.): TODAY.
  //  - /compare/[slug] combos: TODAY (the spec/price comparison is
  //    dynamic, refreshed every render).
  const seen = new Set<string>();
  const entries: string[] = [];

  // Home: high priority, daily refresh hint.
  pushEntry(entries, seen, `${baseUrl}/`, TODAY, "daily", "1.0");
  pushEntry(entries, seen, `${baseUrl}/compare`, TODAY, "daily", "0.9");
  pushEntry(entries, seen, `${baseUrl}/hubs`, TODAY, "weekly", "0.8");

  // Static legal/about pages. Low priority but should be in the index.
  pushEntry(entries, seen, `${baseUrl}/about`, TODAY, "monthly", "0.3");
  pushEntry(entries, seen, `${baseUrl}/contact`, TODAY, "monthly", "0.3");
  pushEntry(entries, seen, `${baseUrl}/editorial-methodology`, TODAY, "monthly", "0.3");
  pushEntry(entries, seen, `${baseUrl}/privacy`, TODAY, "yearly", "0.3");
  pushEntry(entries, seen, `${baseUrl}/terms`, TODAY, "yearly", "0.3");

  // Products — emit each live product page with its own updated_at.
  // Skip slugs that are 301-redirected elsewhere (cannibalization fix).
  const liveProducts = products.filter(
    (p) => !REDIRECTED_SLUGS.has(p.slug),
  );
  for (const p of liveProducts) {
    const date = fmtDate(p.updated_at) || TODAY;
    pushEntry(
      entries,
      seen,
      `${encodeURI(baseUrl + "/products/" + p.slug)}`,
      date,
      "weekly",
      "0.8",
    );
  }

  // Hubs — programmatic editorial pages, weekly recrawl.
  for (const h of hubs) {
    const date = fmtDate(h.updated_at) || TODAY;
    pushEntry(
      entries,
      seen,
      `${baseUrl}/hubs/${h.slug}`,
      date,
      "weekly",
      "0.7",
    );
  }

  // Category landing + best-of pages. Both are dynamic, both canonical
  // siblings of hubs (per commit 8f14782). Emit them so Google can see
  // the canonical link and consolidate.
  for (const cat of categories) {
    pushEntry(
      entries,
      seen,
      `${baseUrl}/category/${cat.slug}`,
      TODAY,
      "weekly",
      "0.6",
    );
    pushEntry(
      entries,
      seen,
      `${baseUrl}/best/${cat.slug}`,
      TODAY,
      "weekly",
      "0.6",
    );
  }

  // Brand index pages — derive unique brand slugs from the product set
  // (same approach as the previous implementation).
  const brandSlugs = [...new Set(products.map((p) => p.brand_slug).filter(Boolean))];
  for (const brandSlug of brandSlugs) {
    pushEntry(
      entries,
      seen,
      `${baseUrl}/brands/${brandSlug}`,
      TODAY,
      "weekly",
      "0.6",
    );
  }

  // /compare/[slug] head-to-head combo pages. GSC shows these are
  // already getting discovered via internal links (12i on
  // samsung-t7-shield-portable-vs-samsung-t9-portable, etc.) but were
  // absent from the sitemap — so Google couldn't be told "this URL
  // matters, please recrawl". Emit all unique unordered product pairs
  // using the `-vs-` separator that compare/[slug].astro parses.
  // Skip pairs where either side is a redirected slug.
  const pairSlugs = liveProducts.map((p) => p.slug);
  for (let i = 0; i < pairSlugs.length; i++) {
    for (let j = i + 1; j < pairSlugs.length; j++) {
      const a = pairSlugs[i];
      const b = pairSlugs[j];
      // Stable, deterministic order: alphabetically smaller slug first.
      // compare/[slug].astro doesn't care about order (it parses both
      // sides the same way), but a stable URL form helps dedupe and
      // avoids emitting both A-vs-B and B-vs-A.
      const [first, second] = a < b ? [a, b] : [b, a];
      pushEntry(
        entries,
        seen,
        `${baseUrl}/compare/${first}-vs-${second}`,
        TODAY,
        "weekly",
        "0.5",
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant, hostname, runtime } = locals;

  if (!DB) {
    return new Response("Internal server error", { status: 500 });
  }

  try {
    const cache = runtime?.caches?.default ?? (caches as any)?.default;
    const cacheKey = new Request(request.url, { method: "GET" });

    const cached = await cache.match(cacheKey);

    if (cached) {
      const cachedAt = parseInt(cached.headers.get("x-cached-at") || "0", 10);
      const age = Date.now() - cachedAt;

      if (age < CACHE_TTL_MS) {
        const headers = new Headers(cached.headers);
        headers.set("x-cache-status", "HIT");
        headers.delete("x-cached-at");
        return new Response(cached.body, { status: cached.status, headers });
      }

      const staleHeaders = new Headers(cached.headers);
      staleHeaders.set("x-cache-status", "STALE");
      staleHeaders.delete("x-cached-at");

      if (runtime?.ctx?.waitUntil) {
        runtime.ctx.waitUntil(
          buildSitemapXml(DB, tenant, hostname)
            .then(async (xml) => {
              const fresh = new Response(xml, {
                headers: {
                  "Content-Type": "application/xml; charset=utf-8",
                  "Cache-Control": "public, max-age=300, s-maxage=300",
                  "x-cached-at": String(Date.now()),
                },
              });
              await cache.put(cacheKey, fresh);
            })
            .catch(() => {}),
        );
      }

      return new Response(cached.body, { status: cached.status, headers: staleHeaders });
    }

    const xml = await buildSitemapXml(DB, tenant, hostname);
    const response = new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "x-cached-at": String(Date.now()),
        "x-cache-status": "MISS",
      },
    });

    await cache.put(cacheKey, response.clone());
    return response;
  } catch (err) {
    return new Response("Internal server error", { status: 500 });
  }
};
