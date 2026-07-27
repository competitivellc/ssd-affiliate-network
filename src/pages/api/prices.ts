import type { APIRoute } from "@astro";
import { getProductBySlug, getProductPricesFresh } from "@lib/db";

// Pol §6(b) line 365: "You will not sell, resell, redistribute, sublicense, or
// transfer any Program Content or any application that uses, incorporates, or
// displays any Program Content." Exposing raw affiliate_url over a public
// unauthenticated endpoint would let third parties scrape Amazon Special
// Links that contain our Associate tag (Program Content), violating this.
//
// This endpoint returns metadata about pricing only — retailer name, condition,
// in-stock state, freshness — never the affiliate_url itself. The visible
// product page renders the actual GeoAffiliateLink for the visitor; the API
// is intended for internal/stateful widgets, not for redistribution.

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant, marketplace } = locals;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const retailer = url.searchParams.get("retailer");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const product = await getProductBySlug(DB, tenant.id, slug);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let prices = await getProductPricesFresh(DB, product.id, {
      marketplace,
      inStockOnly: false,
      maxAgeHours: 24,
    });
    if (retailer) {
      prices = prices.filter((p) => p.retailer === retailer);
    }

    return new Response(
      JSON.stringify({
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
        },
        prices: prices.map((p) => ({
          retailer: p.retailer,
          condition: p.condition || "new",
          in_stock: p.in_stock === 1,
          updated: p.fetched_at,
          // No affiliate_url exposed. Callers must load the product HTML page
          // to render a properly-tagged Special Link via GeoAffiliateLink.
        })),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
