import type { APIRoute } from "astro";
import { getProductBySlug, getProductPrices } from "@lib/db";

export const GET: APIRoute = async ({ locals, request }) => {
  const { DB, tenant } = locals;
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

    let prices = await getProductPrices(DB, product.id);
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
          price_cents: p.price_cents,
          currency: p.currency,
          affiliate_url: p.affiliate_url,
          in_stock: p.in_stock === 1,
          updated: p.fetched_at,
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
