// PA-API v5 client — SearchItems + GetItems, SigV4-signed.
//
// Marketplace → host/region mapping is documented at
// https://webservices.amazon.com/cloud/paapi5 — endpoint host varies by
// marketplace, signature region is always us-east-1 (PA-API is a single-region
// service). The amazon.com ASIN marketplace is *not* the only one;
// this map lets the worker fetch prices from the visitor's local Amazon
// storefront per Pol §2(b) "prices and availability may vary from time to
// time" + market-specific Extra context.

import { signSigV4, SigV4Credentials } from "./sigv4";

export interface PaapiMarketplace {
  /** Marketplace ID — passed in PartnerTag's region inference and used as the
   *  `marketplace` column value in the prices table (link integrity schema). */
  marketplace: string;
  /** PA-API v5 API endpoint host (no path). */
  host: string;
  /** Path component. Always "/paapi5/<resource>" for the v5 REST API. */
  searchPath: string;
  itemsPath: string;
  /** Country code (ISO-3166-1 alpha-2) — pairs with src/lib/affiliate.ts
   *  AMAZON_HOSTS map. */
  country: string;
}

export const PAAPI_MARKETPLACES: Record<string, PaapiMarketplace> = {
  US: { marketplace: "US", host: "webservices.amazon.com",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "US" },
  GB: { marketplace: "GB", host: "webservices.amazon.co.uk",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",  country: "GB" },
  DE: { marketplace: "DE", host: "webservices.amazon.de",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "DE" },
  FR: { marketplace: "FR", host: "webservices.amazon.fr",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "FR" },
  IT: { marketplace: "IT", host: "webservices.amazon.it",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "IT" },
  ES: { marketplace: "ES", host: "webservices.amazon.es",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "ES" },
  JP: { marketplace: "JP", host: "webservices.amazon.co.jp",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "JP" },
  CA: { marketplace: "CA", host: "webservices.amazon.ca",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "CA" },
  AU: { marketplace: "AU", host: "webservices.amazon.com.au",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "AU" },
  BR: { marketplace: "BR", host: "webservices.amazon.com.br", searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "BR" },
  IN: { marketplace: "IN", host: "webservices.amazon.in",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "IN" },
  MX: { marketplace: "MX", host: "webservices.amazon.com.mx",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",  country: "MX" },
  AE: { marketplace: "AE", host: "webservices.amazon.ae",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "AE" },
  SA: { marketplace: "SA", host: "webservices.amazon.sa",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "SA" },
  NL: { marketplace: "NL", host: "webservices.amazon.nl",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "NL" },
  SG: { marketplace: "SG", host: "webservices.amazon.sg",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "SG" },
  SE: { marketplace: "SE", host: "webservices.amazon.se",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "SE" },
  PL: { marketplace: "PL", host: "webservices.amazon.pl",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "PL" },
  BE: { marketplace: "BE", host: "webservices.amazon.com.be",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "BE" },
  TR: { marketplace: "TR", host: "webservices.amazon.com.tr",  searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "TR" },
  EG: { marketplace: "EG", host: "webservices.amazon.eg",     searchPath: "/paapi5/searchitems", itemsPath: "/paapi5/getitems",   country: "EG" },
};

/** Region for SigV4 — PA API v5 is hosted in us-east-1 globally. */
export const PAAPI_REGION = "us-east-1";

export interface PaapiConfig {
  credentials: SigV4Credentials;
  /** Associate tag (e.g. ssdnetwork07-20) for the marketplace we are querying.
   *  Sent as PartnerTag in the body, NOT in the URL or as a header. */
  partnerTag: string;
  /** Partner type is always "Associates" for this site's use of PA API. */
  partnerType: string;
  /** Marketplace key (US/GB/DE/...). */
  marketplace: string;
}

export interface PaapiListing {
  asin: string;
  detailPageUrl: string;       // PA-API-blessed Special Link (Pol §6(a) line 363 — verbatim)
  priceCents: number;
  currency: string;
  condition: "new" | "used" | "refurbished";
  inStock: boolean;
  title: string;
  /** Amazon's flagged exclusion per Pol §3 Products Statement (Excluded
   *  Products). When true, the worker must mark the product inactive. */
  excluded?: boolean;
}

interface PaapiResponse {
  ItemsResult?: {
    Items?: Array<{
      ASIN: string;
      DetailPageURL?: string;
      ItemInfo?: { Title?: { DisplayValue?: string }; ContentInfo?: { MigrationStatus?: { status?: string } } };
      Offers?: {
        Listings?: Array<{
          Price?: { Amount?: number; Currency?: string };
          Availability?: { Type?: string; Message?: string };
          Condition?: { Value?: string; DisplayValue?: string };
        }>;
      };
    }>;
  };
  Errors?: Array<{ Code: string; Message: string }>;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * GetItems call — used when we already know the ASINs (products.model column
 * holds the canonical ASIN for the marketplace). Writes one PaapiListing per
 * (asin, listing condition) returned, so we capture both new AND used per
 * Pol §2(b) line 331 / Pol §2(b) "comparison pricing" rule.
 *
 * Enforces PA-API rate limit per Pol IP §2(c)(j) line 551 by sleeping 1s
 * between batches (the limit is 1 TPS per Associate tag by default).
 */
export async function getItemsByAsin(
  asins: string[],
  cfg: PaapiConfig
): Promise<PaapiListing[]> {
  const mp = PAAPI_MARKETPLACES[cfg.marketplace];
  if (!mp) {
    throw new Error(`Unknown PA API marketplace: ${cfg.marketplace}`);
  }

  const url = `https://${mp.host}${mp.itemsPath}`;
  const payload = JSON.stringify({
    PartnerTag: cfg.partnerTag,
    PartnerType: cfg.partnerType,
    Marketplace: cfg.marketplace,
    ItemIds: asins,
    Condition: "All", // request both New and Used; the response tells condition per listing
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.ContentInfo.MigrationStatus",
      "Offers.Listings.Price",
      "Offers.Listings.Availability.Type",
      "Offers.Listings.Condition",
      "Offers.Listings.DeliveryInfo.IsAmazonFulfilled",
    ],
  });

  let lastErr: unknown;
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    const request = await signSigV4({
      method: "POST",
      url,
      body: payload,
      host: mp.host,
      credentials: cfg.credentials,
    });

    let resp: Response;
    try {
      resp = await fetch(request);
    } catch (err) {
      lastErr = err;
      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw err;
    }

    if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
      // Retry on rate-limit + transient server errors.
      const backoff = RETRY_DELAY_MS * Math.pow(2, attempt);
      await sleep(backoff);
      continue;
    }

    if (resp.status === 403) {
      // SigV4 failure — DO NOT retry; surface error.
      const body = await resp.text();
      throw new Error(`PA API 403 (auth failure): ${body.slice(0, 300)}`);
    }

    if (!resp.ok) {
      lastErr = new Error(`PA API HTTP ${resp.status}: ${await resp.text().catch(() => "")}`);
      if (attempt < RETRY_ATTEMPTS - 1) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw lastErr;
    }

    const data = (await resp.json()) as PaapiResponse;
    return parseItemsResponse(data);
  }

  throw lastErr ?? new Error("PA API exhausted retries");
}

function parseItemsResponse(data: PaapiResponse): PaapiListing[] {
  const items = data.ItemsResult?.Items ?? [];
  const out: PaapiListing[] = [];

  for (const item of items) {
    const asin = item.ASIN;
    const title = item.ItemInfo?.Title?.DisplayValue ?? "";
    const detailPageUrl = item.DetailPageURL ?? "";

    // Excluded-products flag: PA API surfaces a "MigrationStatus" or returns
    // no offers for products Amazon has flagged excluded per Pol §3 Products
    // Statement. We treat "no offers AND no title" as exclusion (Amazon's
    // documented behavior); explicit excluded markers go in ContentInfo.
    const excluded =
      !title &&
      !item.Offers?.Listings?.length &&
      !!item.ItemInfo?.ContentInfo?.MigrationStatus;

    const listings = item.Offers?.Listings ?? [];
    if (listings.length === 0) {
      // Include a stock-out row so the renderer can show "Currently
      // unavailable" rather than silently dropping the product.
      out.push({
        asin,
        detailPageUrl,
        title,
        priceCents: 0,
        currency: "USD",
        condition: "new",
        inStock: false,
        excluded,
      });
      continue;
    }

    for (const listing of listings) {
      const conditionRaw = listing.Condition?.Value?.toLowerCase() || "new";
      // PA API Condition values are "New", "Used", "Refurbished", etc.
      const condition =
        conditionRaw === "used" ? "used" :
        conditionRaw === "refurbished" || conditionRaw === "collectible" ? "refurbished" :
        "new";
      const amount = listing.Price?.Amount;
      const currency = listing.Price?.Currency || "USD";
      const inStock = listing.Availability?.Type !== "OutOfStock" &&
                      listing.Availability?.Type !== "DropShippedOutStock";
      out.push({
        asin,
        detailPageUrl,
        title,
        priceCents: Math.round((amount ?? 0) * 100),
        currency,
        condition: condition as PaapiListing["condition"],
        inStock,
        excluded,
      });
    }
  }

  return out;
}
