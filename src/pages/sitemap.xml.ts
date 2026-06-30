import type { APIRoute } from "astro";
import { getAllProducts } from "@lib/db";

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant, hostname } = locals;
  const baseUrl = `https://${hostname}`;

  try {
    const products = await getAllProducts(DB, tenant.id);

    const urls: string[] = [];
    urls.push(`  <url><loc>${baseUrl}/</loc></url>`);
    urls.push(`  <url><loc>${baseUrl}/compare</loc></url>`);

    for (const p of products) {
      const pUrl = `${baseUrl}/products/${p.slug}`;
      const lastmod = p.updated_at ? p.updated_at.replace(" ", "T") + "Z" : "";
      urls.push(`  <url><loc>${encodeURI(pUrl)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
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
