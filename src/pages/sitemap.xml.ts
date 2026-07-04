import type { APIRoute } from "astro";
import { getAllProducts, getLastUpdatedDate, getHubsBySite } from "@lib/db";

const CACHE_TTL_MS = 86_400_000;

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  return d.split(" ")[0];
}

async function buildSitemapXml(
  DB: import("@cloudflare/workers-types").D1Database,
  tenant: { id: string },
  hostname: string,
): Promise<string> {
  const baseUrl = `https://${hostname}`;

  const [products, lastUpdated, hubs] = await Promise.all([
    getAllProducts(DB, tenant.id),
    getLastUpdatedDate(DB, tenant.id),
    getHubsBySite(DB, tenant.id),
  ]);

  const lastmod = fmtDate(lastUpdated);
  const entries: string[] = [];

  entries.push(`  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
    entries.push(`  <url>\n    <loc>${baseUrl}/compare</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);

  if (hubs.length > 0) {
    entries.push(`  <url>\n    <loc>${baseUrl}/hubs</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
  }

  for (const p of products) {
    const date = fmtDate(p.updated_at) || lastmod;
    entries.push(`  <url>\n    <loc>${encodeURI(baseUrl + "/products/" + p.slug)}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
  }

  for (const h of hubs) {
    entries.push(`  <url>\n    <loc>${baseUrl}/hubs/${h.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
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
                  "Cache-Control": "public, max-age=86400, s-maxage=86400",
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
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
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
