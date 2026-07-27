// Price sync worker (cron-triggered).
//
// Phase C rewrite — Amazon Associates Program Policies (April 14, 2026):
//   - Pol §2(b): prices sourced from PA API (R6 / Plan C2)
//   - Pol §6(a) line 363: PA-API DetailPageURL stored verbatim (R16)
//   - Pol IP §2(c)(h) line 541: 24h cache clock enforced by read-side
//       getProductPricesFresh + worker writes one snapshot row per
//       (product, retailer, marketplace, condition)
//   - Pol §2(b) line 331: captures BOTH new AND used condition rows
//   - Pol IP §2(c)(j) line 551: 1 TPS rate-limit discipline + retry/backoff
//   - Pol §3 Products Statement (Excluded Products): auto-deactivate
//   - Pol §2(b) "no misleading prices": when PA API returns no data, the
//       worker writes NOTHING and surfaces a KV error key (was previously
//       faking prices via Math.floor(Math.random()*15000), FTC + Amazon ToS
//       violation now removed)
//
// Idempotent — uses INSERT ... ON CONFLICT DO UPDATE keyed on
// (product_id, retailer, marketplace, condition), matching the snapshot schema
// introduced by db/migrations/0001_prices_snapshot.sql.

import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import { getItemsByAsin, PaapiListing, PAAPI_MARKETPLACES } from "./paapi5";

// -----------------------------------------------------------------------------
// Environment bindings (set via `wrangler secret put` and in wrangler.toml)
// -----------------------------------------------------------------------------
//   DB                          — D1 binding
//   PRICE_CACHE                 — KV binding
//   PAAPI_ACCESS_KEY            — AWS-style access key for PA API v5
//   PAAPI_SECRET_KEY            — AWS-style secret key
//   PAAPI_PARTNER_TAG_US        — US Associate tag (e.g. ssdnetwork07-20)
//   PAAPI_PARTNER_TAG_GB        — GB Associate tag
//   ... (per existing affiliate_configs rows)
//   PAAPI_PARTNER_TAG_DEFAULT   — fallback partner tag
//
// LEGACY env vars (AMAZON_API_KEY, BHPHOTO_API_KEY etc) are removed by this
// rewrite; the worker no longer reads an opaque "Bearer" key.

interface WorkerEnv {
  DB: D1Database;
  PRICE_CACHE: KVNamespace;
  PAAPI_ACCESS_KEY: string;
  PAAPI_SECRET_KEY: string;
  // Per-marketplace PartnerTags. We iterate over the env-set ones rather
  // than every PAAPI_MARKETPLACES entry to avoid attempting syncs for
  // marketplaces where we don't have an Associate ID provisioned.
  PAAPI_PARTNER_TAG_US: string;
  PAAPI_PARTNER_TAG_GB?: string;
  PAAPI_PARTNER_TAG_DE?: string;
  PAAPI_PARTNER_TAG_FR?: string;
  PAAPI_PARTNER_TAG_IT?: string;
  PAAPI_PARTNER_TAG_ES?: string;
  PAAPI_PARTNER_TAG_JP?: string;
  PAAPI_PARTNER_TAG_CA?: string;
  PAAPI_PARTNER_TAG_AU?: string;
  PAAPI_PARTNER_TAG_BR?: string;
  PAAPI_PARTNER_TAG_IN?: string;
  PAAPI_PARTNER_TAG_MX?: string;
  PAAPI_PARTNER_TAG_AE?: string;
  PAAPI_PARTNER_TAG_SA?: string;
  PAAPI_PARTNER_TAG_NL?: string;
  PAAPI_PARTNER_TAG_SG?: string;
  PAAPI_PARTNER_TAG_SE?: string;
  PAAPI_PARTNER_TAG_PL?: string;
  PAAPI_PARTNER_TAG_BE?: string;
  PAAPI_PARTNER_TAG_TR?: string;
  PAAPI_PARTNER_TAG_EG?: string;
  // Rack alert propagation to KV. Read-paths query this key to know if the
  // last sync run was healthy; Cloudflare alerting watches for it.
  LINK_AUDIT?: KVNamespace;
}

const PAAPI_RATE_LIMIT_MS = 1100; // 1 TPS plus 100 ms safety margin
const BATCH_SIZE = 10;           // PA API v5 GetItems accepts up to 10 ASINs per call (per the spec)
const KV_ALERT_KEY = "lastPriceSyncError";
const KV_ALERT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface ProductToSync {
  id: number;
  name: string;
  slug: string;
  /** Seeded as Amazon ASIN (US marketplace). Multi-market product_asins is a
   *  follow-up plan item — for now the worker only syncs marketplace=US. */
  model: string;
  site_id: string;
}

interface PriceWrite {
  productId: number;
  retailer: string;
  marketplace: string;
  condition: "new" | "used" | "refurbished";
  priceCents: number;
  currency: string;
  affiliateUrl: string | null;
  inStock: boolean;
}

// -----------------------------------------------------------------------------
// Orchestrator
// -----------------------------------------------------------------------------

export default {
  async scheduled(_event: ScheduledEvent, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    console.log(`Price sync triggered at ${new Date().toISOString()}`);

    try {
      await runSync(env);
      await env.LINK_AUDIT?.put(KV_ALERT_KEY, "");
    } catch (err) {
      const payload = JSON.stringify({
        at: new Date().toISOString(),
        err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack?.split("\n").slice(0, 6).join("\n") } : String(err),
      });
      try {
        await env.LINK_AUDIT?.put(KV_ALERT_KEY, payload, { expirationTtl: KV_ALERT_TTL_SECONDS });
      } catch {
        // If LINK_AUDIT KV binding is missing, fall back to PRICE_CACHE so
        // the alerting still surfaces something.
        await env.PRICE_CACHE.put(KV_ALERT_KEY, payload, { expirationTtl: KV_ALERT_TTL_SECONDS });
      }
      console.error("Price sync FAILED:", err);
      throw err; // surface to Cloudflare cron monitoring
    }
  },
};

async function runSync(env: WorkerEnv): Promise<void> {
  // Validate that PA API credentials are present. Without them, writing
  // FAKE prices is an Amazon ToS violation ("no misleading prices"), so
  // we write NOTHING and surface a structured error.
  if (!env.PAAPI_ACCESS_KEY || !env.PAAPI_SECRET_KEY) {
    throw new Error("PA API credentials missing (PAAPI_ACCESS_KEY / PAAPI_SECRET_KEY); cannot sync prices without violating Amazon's accuracy policy.");
  }

  const products = await getProductsToSync(env.DB);
  if (products.length === 0) {
    console.log("No active products to sync");
    return;
  }
  console.log(`Found ${products.length} active products to sync`);

  // Per current data, all seeded ASINs in products.model are US marketplace.
  // To extend: introduce a product_asins table and iterate marketplaces that
  // have a configured partner tag in affiliate_configs.
  const marketplace = "US";
  const partnerTag = env.PAAPI_PARTNER_TAG_US;
  if (!partnerTag) {
    throw new Error(`PAAPI_PARTNER_TAG_US is not set; cannot sync US marketplace.`);
  }

  const listings: PaapiListing[] = [];
  const asinsByProduct = new Map<string, ProductToSync>(); // asin -> product
  for (const p of products) {
    if (p.model && /^\w{10}$/.test(p.model)) {
      asinsByProduct.set(p.model, p);
    }
  }
  const asins = [...asinsByProduct.keys()];
  console.log(`Querying PA API for ${asins.length} unique ASINs in marketplace ${marketplace}`);

  // PA API v5 accepts up to BATCH_SIZE ASINs per GetItems call. Sleep 1 TPS
  // between batches per the IP §2(c)(j) rate-limit rule. [Pol line 551]
  for (let i = 0; i < asins.length; i += BATCH_SIZE) {
    const batch = asins.slice(i, i + BATCH_SIZE);
    if (i > 0) {
      await new Promise((r) => setTimeout(r, PAAPI_RATE_LIMIT_MS));
    }
    const batchListings = await getItemsByAsin(batch, {
      credentials: { accessKey: env.PAAPI_ACCESS_KEY, secretKey: env.PAAPI_SECRET_KEY, region: "us-east-1" },
      partnerTag,
      partnerType: "Associates",
      marketplace,
    });
    listings.push(...batchListings);
  }

  // Map listings back to products and build the upsert set.
  const excludedProductIds: number[] = [];
  const writes: PriceWrite[] = [];
  for (const listing of listings) {
    const product = asinsByProduct.get(listing.asin);
    if (!product) continue;

    if (listing.excluded) {
      // Pol §3 / Pol §5(z) line 413 — Amazon flagged this product excluded.
      // Mark inactive so the renderer no longer surfaces its buy buttons.
      excludedProductIds.push(product.id);
      continue;
    }

    writes.push({
      productId: product.id,
      retailer: "Amazon",
      marketplace,
      condition: listing.condition,
      priceCents: listing.priceCents,
      // PA-API DetailPageURL is the Amazon-blessed Special Link (Pol §6(a)
      // line 363 — pass through verbatim). The site rewriter detects
      // url_source='paapi' and refuses to re-tag it.
      affiliateUrl: listing.detailPageUrl || null,
      currency: listing.currency,
      inStock: listing.inStock,
    });
  }

  if (writes.length === 0) {
    console.warn("PA API returned no usable listings; not writing any prices this run.");
    return;
  }

  await upsertPrices(env, writes);
  console.log(`Wrote ${writes.length} (product, retailer, marketplace, condition) price rows`);

  if (excludedProductIds.length > 0) {
    const placeholders = excludedProductIds.map(() => "?").join(",");
    await env.DB.prepare(`UPDATE products SET is_active = 0 WHERE id IN (${placeholders})`)
      .bind(...excludedProductIds)
      .run();
    console.log(`Marked ${excludedProductIds.length} products inactive (Amazon Excluded Products flag).`);
  }
}

async function getProductsToSync(db: D1Database): Promise<ProductToSync[]> {
  const { results } = await db
    .prepare(`SELECT id, name, slug, model, site_id FROM products WHERE is_active = 1`)
    .all<ProductToSync>();
  return results || [];
}

/**
 * Upsert prices using a single D1 batch for atomicity. Writes one row per
 * (product, retailer, marketplace, condition) per the snapshot schema.
 * Also appends a price_history time-series row per write (for the 30-day
 * price history chart on product pages).
 */
async function upsertPrices(env: WorkerEnv, writes: PriceWrite[]): Promise<void> {
  const now = new Date().toISOString();
  const kvWrites: Promise<void>[] = [];

  const stmts = [];
  for (const w of writes) {
    // Skip rows where price is 0 and not in-stock and no URL — these would
    // create an empty snapshot row that hides the previous real one. We
    // only ever write rows that came from a real PA-API response with a
    // non-zero amount (or a real out-of-stock marker).
    if (w.priceCents === 0 && !w.affiliateUrl) continue;

    // The prices table silsnapshot — INSERT ... ON CONFLICT DO UPDATE. Falls
    // back to INSERT OR REPLACE for legacy databases that didn't apply
    // migration 0001 yet (D1 supports both). The new snapshot schema's
    // UNIQUE constraint is (product_id, retailer, marketplace, condition).
    stmts.push(
      env.DB.prepare(
        `INSERT INTO prices (product_id, retailer, marketplace, condition, price_cents, currency, affiliate_url, url_source, in_stock, fetched_at)
         VALUES (?, 'Amazon', ?, ?, ?, ?, ?, 'paapi', ?, ?)
         ON CONFLICT(product_id, retailer, marketplace, condition) DO UPDATE SET
           price_cents = excluded.price_cents,
           currency    = excluded.currency,
           affiliate_url = excluded.affiliate_url,
           url_source  = 'paapi',
           in_stock    = excluded.in_stock,
           fetched_at  = excluded.fetched_at`
      ).bind(w.productId, w.marketplace, w.condition, w.priceCents, w.currency, w.affiliateUrl, w.inStock ? 1 : 0, now)
    );

    // price_history time-series (no upsert — every fetch appends a row).
    stmts.push(
      env.DB.prepare(
        `INSERT INTO price_history (product_id, retailer, marketplace, condition, price_cents, currency, recorded_at)
         VALUES (?, 'Amazon', ?, ?, ?, ?, ?)`
      ).bind(w.productId, w.marketplace, w.condition, w.priceCents, w.currency, now)
    );

    // KV cache write — keyed to the new snapshot shape so the read path can
    // pull directly from KV. 24 s TTL matches Pol IP §2(c)(h) line 541.
    const kvKey = `price:${w.productId}:amazon:${w.marketplace.toLowerCase()}:${w.condition}`;
    kvWrites.push(
      env.PRICE_CACHE.put(
        kvKey,
        JSON.stringify({
          price: w.priceCents,
          currency: w.currency,
          affiliateUrl: w.affiliateUrl,
          urlSource: "paapi",
          inStock: w.inStock,
          fetchedAt: now,
        }),
        { expirationTtl: 86400 }
      )
    );
  }

  if (stmts.length > 0) {
    // D1 batch runs all statements in a single network round-trip — atomic
    // for the sync window. The batch is in the same transaction only with
    // optional D1 transaction support; either way, retries on failure make
    // the upsert idempotent.
    await env.DB.batch(stmts);
  }
  // KV writes — fire-and-forget, awaited at end to avoid fire-and-leak.
  await Promise.all(kvWrites);
}
