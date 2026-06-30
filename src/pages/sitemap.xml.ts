import type { APIRoute } from "astro";
import { getAllProducts, getCategoriesBySite } from "@lib/db";

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant, hostname } = locals;
  const baseUrl = `https://${hostname}`;

  try {
    const [products, categories] = await Promise.all([
      getAllProducts(DB, tenant.id),
      getCategoriesBySite(DB, tenant.id),
    ]);

    const urls: string[] = [];
    urls.push(`  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>`);
    urls.push(`  <url><loc>${baseUrl}/compare</loc><priority>0.8</priority><changefreq>daily</changefreq></url>`);

    for (const cat of categories) {
      const catUrl = `${baseUrl}/compare?category=${cat.slug}`;
      urls.push(`  <url><loc>${encodeURI(catUrl)}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>`);
    }

    for (const p of products) {
      const pUrl = `${baseUrl}/products/${p.slug}`;
      const lastmod = p.updated_at ? p.updated_at.split("T")[0] : "";
      urls.push(`  <url><loc>${encodeURI(pUrl)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>0.6</priority><changefreq>weekly</changefreq></url>`);
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
