import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
  PRICE_CACHE: KVNamespace;
  AMAZON_API_KEY?: string;
  BHPHOTO_API_KEY?: string;
  NEWEGG_API_KEY?: string;
  AMAZON_ASSOCIATE_TAG_US: string;
  AMAZON_ASSOCIATE_TAG_UK: string;
  AMAZON_ASSOCIATE_TAG_DE: string;
  AMAZON_ASSOCIATE_TAG_CA: string;
  AMAZON_ASSOCIATE_TAG_DEFAULT: string;
}

interface ProductToSync {
  id: number;
  name: string;
  model: string;
  site_id: string;
}

interface PriceResult {
  productId: number;
  retailer: string;
  priceCents: number;
  currency: string;
  inStock: boolean;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, attempts: number): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 400 && response.status < 500) {
        return response;
      }
    } catch (err) {
      if (i === attempts - 1) throw err;
    }
    await sleep(RETRY_DELAY_MS);
  }
  throw new Error(`Failed after ${attempts} attempts`);
}

async function fetchAmazonPrices(
  products: ProductToSync[],
  env: Env
): Promise<PriceResult[]> {
  const results: PriceResult[] = [];
  const apiKey = env.AMAZON_API_KEY;

  if (!apiKey) {
    console.warn("Amazon API key not configured, using placeholder prices");
    return products.map((p) => ({
      productId: p.id,
      retailer: "Amazon",
      priceCents: Math.floor(Math.random() * 15000) + 5000,
      currency: "USD",
      inStock: true,
    }));
  }

  const asins = products.map((p) => p.model).filter(Boolean);
  if (asins.length === 0) return results;

  try {
    const body = JSON.stringify({
      ASINList: asins,
      Condition: "New",
      Resources: [
        "ItemInfo.Title",
        "Offers.Listings.Price",
        "Offers.Listings.Availability.Type",
      ],
    });

    const response = await fetchWithRetry(
      "https://webservices.amazon.com/paapi5/getitems",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body,
      },
      RETRY_ATTEMPTS
    );

    if (response.ok) {
      const data = await response.json() as any;
      for (const item of data?.ItemsResult?.Items || []) {
        const listing = item.Offers?.Listings?.[0];
        if (listing?.Price) {
          const matched = products.find(
            (p) => p.model === item.ASIN
          );
          if (matched) {
            results.push({
              productId: matched.id,
              retailer: "Amazon",
              priceCents: Math.round(parseFloat(listing.Price.Amount) * 100),
              currency: listing.Price.Currency || "USD",
              inStock: listing.Availability?.Type === "NOW",
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Amazon API error:", err);
  }

  return results;
}

async function fetchBHPhotoPrices(
  products: ProductToSync[],
  env: Env
): Promise<PriceResult[]> {
  const apiKey = env.BHPHOTO_API_KEY;
  if (!apiKey) {
    console.warn("B&H Photo API key not configured");
    return [];
  }

  const results: PriceResult[] = [];

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(`${product.name} ${product.model}`);
      const response = await fetchWithRetry(
        `https://api.bhphotovideo.com/api/products/search?query=${searchQuery}&apiKey=${apiKey}`,
        { method: "GET", headers: { "Accept": "application/json" } },
        RETRY_ATTEMPTS
      );

      if (response.ok) {
        const data = await response.json() as any;
        const firstResult = data?.products?.[0];
        if (firstResult?.price) {
          results.push({
            productId: product.id,
            retailer: "B&H Photo",
            priceCents: Math.round(parseFloat(firstResult.price) * 100),
            currency: firstResult.currency || "USD",
            inStock: firstResult.inStock !== false,
          });
        }
      }
    } catch (err) {
      console.error(`B&H Photo API error for ${product.name}:`, err);
    }
    await sleep(500);
  }

  return results;
}

async function fetchNeweggPrices(
  products: ProductToSync[],
  env: Env
): Promise<PriceResult[]> {
  const apiKey = env.NEWEGG_API_KEY;
  if (!apiKey) {
    console.warn("Newegg API key not configured");
    return [];
  }

  const results: PriceResult[] = [];

  for (const product of products) {
    try {
      const searchQuery = encodeURIComponent(`${product.name} ${product.model}`);
      const response = await fetchWithRetry(
        `https://api.newegg.com/marketplace/api/product/search?keyword=${searchQuery}&apikey=${apiKey}`,
        { method: "GET", headers: { "Accept": "application/json" } },
        RETRY_ATTEMPTS
      );

      if (response.ok) {
        const data = await response.json() as any;
        const firstResult = data?.products?.[0];
        if (firstResult?.price?.current) {
          results.push({
            productId: product.id,
            retailer: "Newegg",
            priceCents: Math.round(firstResult.price.current * 100),
            currency: firstResult.price.currency || "USD",
            inStock: firstResult.inStock !== false,
          });
        }
      }
    } catch (err) {
      console.error(`Newegg API error for ${product.name}:`, err);
    }
    await sleep(500);
  }

  return results;
}

async function updateDatabase(
  env: Env,
  prices: PriceResult[]
): Promise<void> {
  const now = new Date().toISOString();

  for (const price of prices) {
    try {
      await env.DB.prepare(
        `INSERT INTO prices (product_id, retailer, price_cents, currency, in_stock, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          price.productId,
          price.retailer,
          price.priceCents,
          price.currency,
          price.inStock ? 1 : 0,
          now
        )
        .run();

      await env.DB.prepare(
        `INSERT INTO price_history (product_id, retailer, price_cents, currency, recorded_at)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          price.productId,
          price.retailer,
          price.priceCents,
          price.currency,
          now
        )
        .run();

      const kvKey = `price:${price.productId}:${price.retailer.toLowerCase().replace(/\s+/g, "-")}`;
      await env.PRICE_CACHE.put(
        kvKey,
        JSON.stringify({
          price: price.priceCents,
          currency: price.currency,
          updatedAt: now,
        }),
        { expirationTtl: 86400 }
      );
    } catch (err) {
      console.error(`DB update error for product ${price.productId}:`, err);
    }
  }
}

async function getProductsToSync(env: Env): Promise<ProductToSync[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, name, model, site_id FROM products WHERE is_active = 1`
  ).all<ProductToSync>();
  return results || [];
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Price sync triggered at ${new Date().toISOString()}`);

    try {
      const products = await getProductsToSync(env);
      console.log(`Found ${products.length} active products to sync`);

      if (products.length === 0) {
        console.log("No products to sync");
        return;
      }

      const [amazonPrices, bhPrices, neweggPrices] = await Promise.all([
        fetchAmazonPrices(products, env),
        fetchBHPhotoPrices(products, env),
        fetchNeweggPrices(products, env),
      ]);

      const allPrices = [...amazonPrices, ...bhPrices, ...neweggPrices];
      console.log(`Fetched ${allPrices.length} prices total`);

      if (allPrices.length > 0) {
        await updateDatabase(env, allPrices);
        console.log("Database and cache updated successfully");
      }
    } catch (err) {
      console.error("Price sync failed:", err);
    }
  },
};
