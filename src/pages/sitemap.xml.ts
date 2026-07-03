import type { APIRoute } from "astro";
import { getAllProducts, getLastUpdatedDate, getHubsBySite } from "@lib/db";

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  return d.split(" ")[0];
}

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant, hostname } = locals;
  const baseUrl = `https://${hostname}`;

  try {
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
      entries.push(`  <url>\n    <loc>${baseUrl}/hubs/</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
    }

    for (const p of products) {
      const date = fmtDate(p.updated_at) || lastmod;
      entries.push(`  <url>\n    <loc>${encodeURI(baseUrl + "/products/" + p.slug)}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`);
    }

    for (const h of hubs) {
      entries.push(`  <url>\n    <loc>${baseUrl}/hubs/${h.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    return new Response("Internal server error", { status: 500 });
  }
};
