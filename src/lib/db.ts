import type { D1Database } from "@cloudflare/workers-types";

export interface Product {
  id: number;
  site_id: string;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  model: string;
  asin: string | null;
  model_family: string | null;
  image_url: string | null;
  gtin13: string | null;
  capacity_gb: number;
  form_factor: string;
  interface: string;
  read_speed_mbps: number;
  write_speed_mbps: number;
  tbw: number;
  warranty_years: number;
  description: string;
  specifications: string | null;
  pros: string | null;
  cons: string | null;
  overall_score: number;
  is_featured: number;
  is_active: number;
  brand_name?: string;
  brand_slug?: string;
  category_name?: string;
  category_slug?: string;
  updated_at?: string;
  _lowestPrice?: number;
}

export type PriceCondition = "new" | "used" | "refurbished";
export type UrlSource = "paapi" | "seed" | "manual" | "vendor";

export interface Price {
  id: number;
  product_id: number;
  retailer: string;
  marketplace?: string;
  condition?: PriceCondition;
  price_cents: number;
  currency: string;
  affiliate_url: string | null;
  url_source?: UrlSource;
  in_stock: number;
  fetched_at: string;
}

export interface GetProductPricesFreshQuery {
  marketplace?: string;
  inStockOnly?: boolean;
  maxAgeHours?: number;
  conditions?: PriceCondition[];
  retailer?: string;
}

export interface Category {
  id: number;
  site_id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
}

export interface Site {
  id: string;
  domain: string;
  name: string;
  tagline: string;
  primary_color: string;
}

export async function getSiteByDomain(db: D1Database, domain: string): Promise<Site | null> {
  const { results } = await db
    .prepare("SELECT * FROM sites WHERE domain = ?")
    .bind(domain)
    .all<Site>();
  return results[0] || null;
}

export async function getFeaturedProducts(db: D1Database, siteId: string): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.is_featured = 1 AND p.is_active = 1
       ORDER BY p.overall_score DESC`
    )
    .bind(siteId)
    .all<Product>();
  return results;
}

export async function getProductsByCategory(
  db: D1Database,
  siteId: string,
  categorySlug: string
): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND c.slug = ? AND p.is_active = 1
       ORDER BY p.overall_score DESC`
    )
    .bind(siteId, categorySlug)
    .all<Product>();
  return results;
}

export async function getProductBySlug(
  db: D1Database,
  siteId: string,
  slug: string
): Promise<Product | null> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.slug = ? AND p.is_active = 1`
    )
    .bind(siteId, slug)
    .all<Product>();
  return results[0] || null;
}

/**
 * @deprecated Use `getProductPricesFresh()` for any render path that displays
 * a price or buy button. This legacy function returns the latest snapshot
 * row per retailer for the US marketplace without freshness, in-stock, or
 * condition filters; do NOT call from new code.
 *
 * Retained only as a soft fallback during the Phase D rollout.
 */
export async function getProductPrices(
  db: D1Database,
  productId: number
): Promise<Price[]> {
  // Deprecated: returns the latest snapshot row per retailer for the default
  // marketplace, regardless of freshness. Use getProductPricesFresh() for any
  // render path that displays a buy button or price.
  const { results } = await db
    .prepare(
      `SELECT * FROM prices
       WHERE product_id = ? AND marketplace = 'US'
       ORDER BY price_cents ASC`
    )
    .bind(productId)
    .all<Price>();
  return results;
}

export async function getProductPricesFresh(
  db: D1Database,
  productId: number,
  query: GetProductPricesFreshQuery = {}
): Promise<Price[]> {
  // One row per (retailer, condition) at the most recent fetched_at, filtered
  // to the visitor's marketplace and within the freshness TTL (default 24h,
  // matching Amazon Pol IP §2(c)(h) line 541).
  const marketplace = query.marketplace || "US";
  const maxAgeHours = query.maxAgeHours ?? 24;
  const conditions = query.conditions || ["new", "used"];
  const inStockOnly = query.inStockOnly ?? true;
  const placeholders = conditions.map(() => "?").join(",");

  let sql = `SELECT * FROM prices
             WHERE product_id = ?
               AND marketplace = ?
               AND fetched_at >= datetime('now', ?)
               AND condition IN (${placeholders})`;
  const params: unknown[] = [productId, marketplace, `-${maxAgeHours} hours`, ...conditions];
  if (inStockOnly) sql += ` AND in_stock = 1`;
  if (query.retailer) {
    sql += ` AND retailer = ?`;
    params.push(query.retailer);
  }
  sql += ` ORDER BY price_cents ASC`;

  const { results } = await db.prepare(sql).bind(...params).all<Price>();
  return results;
}

export async function getAllProducts(db: D1Database, siteId: string): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.is_active = 1
       ORDER BY p.overall_score DESC`
    )
    .bind(siteId)
    .all<Product>();
  return results;
}

export async function getCategoriesBySite(
  db: D1Database,
  siteId: string
): Promise<Category[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM categories WHERE site_id = ? ORDER BY display_order ASC"
    )
    .bind(siteId)
    .all<Category>();
  return results;
}

export async function searchProducts(
  db: D1Database,
  siteId: string,
  query: string
): Promise<Product[]> {
  const search = `%${query}%`;
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.is_active = 1
       AND (p.name LIKE ? OR b.name LIKE ? OR p.description LIKE ?)
       ORDER BY p.overall_score DESC
       LIMIT 20`
    )
    .bind(siteId, search, search, search)
    .all<Product>();
  return results;
}

export async function getAffiliateTag(
  db: D1Database,
  siteId: string,
  retailer: string,
  countryCode: string,
  marketplace?: string
): Promise<{ tag: string; linkCode: string | null; linkId: string | null } | null> {
  const mp = marketplace || countryCode;
  const { results } = await db
    .prepare(
      `SELECT affiliate_tag AS tag, link_code AS linkCode, link_id AS linkId FROM affiliate_configs
       WHERE site_id = ? AND retailer = ? AND marketplace = ? AND country_code = ?
       LIMIT 1`
    )
    .bind(siteId, retailer, mp, countryCode)
    .all<{ tag: string; linkCode: string | null; linkId: string | null }>();

  if (results[0]) return results[0];

  const { results: fallback } = await db
    .prepare(
      `SELECT affiliate_tag AS tag, link_code AS linkCode, link_id AS linkId FROM affiliate_configs
       WHERE site_id = ? AND retailer = ? AND marketplace = ? AND country_code = '*'
       LIMIT 1`
    )
    .bind(siteId, retailer, mp)
    .all<{ tag: string; linkCode: string | null; linkId: string | null }>();

  if (fallback[0]) return fallback[0];

  // Global fallback (marketplace='*', country='*') — last resort.
  const { results: globalFallback } = await db
    .prepare(
      `SELECT affiliate_tag AS tag, link_code AS linkCode, link_id AS linkId FROM affiliate_configs
       WHERE site_id = ? AND retailer = ? AND marketplace = '*' AND country_code = '*'
       LIMIT 1`
    )
    .bind(siteId, retailer)
    .all<{ tag: string; linkCode: string | null; linkId: string | null }>();

  return globalFallback[0] || null;
}

export async function getAffiliateTagsBatch(
  db: D1Database,
  siteId: string,
  retailers: string[],
  countryCode: string,
  marketplace?: string
): Promise<Map<string, { tag: string; linkCode: string | null; linkId: string | null } | null>> {
  // One query resolves tags for every retailer on a page, killing the N+1 the
  // old getAffiliateTag-per-GeoAffiliateLink pattern created on listing pages.
  const mp = marketplace || countryCode;
  const placeholders = retailers.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT retailer, affiliate_tag AS tag, link_code AS linkCode, link_id AS linkId,
              country_code, marketplace
       FROM affiliate_configs
       WHERE site_id = ? AND retailer IN (${placeholders})`
    )
    .bind(siteId, ...retailers)
    .all<{ retailer: string; tag: string; linkCode: string | null; linkId: string | null; country_code: string; marketplace: string }>();

  const out = new Map<string, { tag: string; linkCode: string | null; linkId: string | null } | null>();
  for (const r of retailers) {
    const exact = results.find((x) => x.retailer === r && x.marketplace === mp && x.country_code === countryCode);
    const mpFallback = results.find((x) => x.retailer === r && x.marketplace === mp && x.country_code === "*");
    const globalFallback = results.find((x) => x.retailer === r && x.marketplace === "*" && x.country_code === "*");
    const chosen = exact || mpFallback || globalFallback || null;
    out.set(r, chosen ? { tag: chosen.tag, linkCode: chosen.linkCode, linkId: chosen.linkId } : null);
  }
  return out;
}

export async function getTopRatedProducts(
  db: D1Database,
  siteId: string,
  limit: number = 6
): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.is_active = 1
       ORDER BY p.overall_score DESC
       LIMIT ?`
    )
    .bind(siteId, limit)
    .all<Product>();
  return results;
}

export async function getLastUpdatedDate(db: D1Database, siteId: string): Promise<string | null> {
  const { results } = await db
    .prepare(
      `SELECT MAX(updated_at) as last_updated FROM products WHERE site_id = ? AND is_active = 1`
    )
    .bind(siteId)
    .all<{ last_updated: string }>();
  return results[0]?.last_updated || null;
}

export async function getProductsByBrand(
  db: D1Database,
  siteId: string,
  brandId: number,
  excludeProductId: number
): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.brand_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY p.overall_score DESC
       LIMIT 4`
    )
    .bind(siteId, brandId, excludeProductId)
    .all<Product>();
  return results;
}

export async function getRelatedProducts(
  db: D1Database,
  siteId: string,
  categoryId: number,
  excludeProductId: number
): Promise<Product[]> {
  const { results } = await db
    .prepare(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.site_id = ? AND p.category_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY p.overall_score DESC
       LIMIT 4`
    )
    .bind(siteId, categoryId, excludeProductId)
    .all<Product>();
  return results;
}

export interface Hub {
  id: number;
  site_id: string;
  hub_type: "use-case" | "performance" | "value";
  slug: string;
  name: string;
  description: string | null;
  meta_description: string | null;
  h1: string | null;
  intro_html: string | null;
  filter_criteria: string;
  display_order: number;
  is_active: number;
}

export interface FilterCriteria {
  category_slug?: string | string[];
  interface?: string | string[];
  min_read_speed?: number;
  max_read_speed?: number;
  min_write_speed?: number;
  max_write_speed?: number;
  capacity_gb?: number;
  min_capacity?: number;
  max_capacity?: number;
  form_factor?: string | string[];
  brand_slug?: string | string[];
  keywords?: string[];
  sort?: string;
  limit?: number;
  min_score?: number;
}

export async function getHubsBySite(
  db: D1Database,
  siteId: string
): Promise<Hub[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM hubs WHERE site_id = ? AND is_active = 1 ORDER BY display_order ASC"
    )
    .bind(siteId)
    .all<Hub>();
  return results;
}

export async function getHubsByType(
  db: D1Database,
  siteId: string,
  hubType: string
): Promise<Hub[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM hubs WHERE site_id = ? AND hub_type = ? AND is_active = 1 ORDER BY display_order ASC"
    )
    .bind(siteId, hubType)
    .all<Hub>();
  return results;
}

export async function getHubBySlug(
  db: D1Database,
  siteId: string,
  slug: string
): Promise<Hub | null> {
  const { results } = await db
    .prepare(
      "SELECT * FROM hubs WHERE site_id = ? AND slug = ? AND is_active = 1"
    )
    .bind(siteId, slug)
    .all<Hub>();
  return results[0] || null;
}

export async function getHubProducts(
  db: D1Database,
  siteId: string,
  filterCriteria: FilterCriteria
): Promise<Product[]> {
  const conditions: string[] = ["p.site_id = ?", "p.is_active = 1"];
  const params: unknown[] = [siteId];

  if (filterCriteria.category_slug) {
    const slugs = Array.isArray(filterCriteria.category_slug)
      ? filterCriteria.category_slug
      : [filterCriteria.category_slug];
    const placeholders = slugs.map(() => "?").join(",");
    conditions.push(`c.slug IN (${placeholders})`);
    params.push(...slugs);
  }

  if (filterCriteria.interface) {
    const ifaces = Array.isArray(filterCriteria.interface)
      ? filterCriteria.interface
      : [filterCriteria.interface];
    const placeholders = ifaces.map(() => "?").join(",");
    conditions.push(`p.interface IN (${placeholders})`);
    params.push(...ifaces);
  }

  if (filterCriteria.min_read_speed !== undefined) {
    conditions.push("p.read_speed_mbps >= ?");
    params.push(filterCriteria.min_read_speed);
  }

  if (filterCriteria.max_read_speed !== undefined) {
    conditions.push("p.read_speed_mbps <= ?");
    params.push(filterCriteria.max_read_speed);
  }

  if (filterCriteria.min_write_speed !== undefined) {
    conditions.push("p.write_speed_mbps >= ?");
    params.push(filterCriteria.min_write_speed);
  }

  if (filterCriteria.max_write_speed !== undefined) {
    conditions.push("p.write_speed_mbps <= ?");
    params.push(filterCriteria.max_write_speed);
  }

  if (filterCriteria.capacity_gb !== undefined) {
    conditions.push("p.capacity_gb = ?");
    params.push(filterCriteria.capacity_gb);
  }

  if (filterCriteria.min_capacity !== undefined) {
    conditions.push("p.capacity_gb >= ?");
    params.push(filterCriteria.min_capacity);
  }

  if (filterCriteria.max_capacity !== undefined) {
    conditions.push("p.capacity_gb <= ?");
    params.push(filterCriteria.max_capacity);
  }

  if (filterCriteria.form_factor) {
    const factors = Array.isArray(filterCriteria.form_factor)
      ? filterCriteria.form_factor
      : [filterCriteria.form_factor];
    const placeholders = factors.map(() => "?").join(",");
    conditions.push(`p.form_factor IN (${placeholders})`);
    params.push(...factors);
  }

  if (filterCriteria.brand_slug) {
    const slugs = Array.isArray(filterCriteria.brand_slug)
      ? filterCriteria.brand_slug
      : [filterCriteria.brand_slug];
    const placeholders = slugs.map(() => "?").join(",");
    conditions.push(`b.slug IN (${placeholders})`);
    params.push(...slugs);
  }

  if (filterCriteria.min_score !== undefined) {
    conditions.push("p.overall_score >= ?");
    params.push(filterCriteria.min_score);
  }

  if (filterCriteria.keywords && filterCriteria.keywords.length > 0) {
    const keywordConditions = filterCriteria.keywords.map(() => {
      return "(p.name LIKE ? OR p.description LIKE ?)";
    });
    conditions.push(`(${keywordConditions.join(" OR ")})`);
    for (const kw of filterCriteria.keywords) {
      const like = `%${kw}%`;
      params.push(like, like);
    }
  }

  const orderBy = filterCriteria.sort || "p.overall_score DESC";
  const limit = filterCriteria.limit || 20;

  const sql = `
    SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT ?
  `;
  params.push(limit);

  const { results } = await db.prepare(sql).bind(...params).all<Product>();
  return results;
}

export async function getRelatedHubs(
  db: D1Database,
  siteId: string,
  currentSlug: string,
  maxResults: number = 4
): Promise<Hub[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM hubs
       WHERE site_id = ? AND slug != ? AND is_active = 1
       ORDER BY display_order ASC`
    )
    .bind(siteId, currentSlug)
    .all<Hub>();

  // Deterministic rotation per hub slug so every page gets a unique set
  // of related hubs. This ensures broad reciprocal linking across the graph
  // instead of every page linking to the same subset.
  const seed = currentSlug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offset = seed % Math.max(results.length, 1);
  const rotated = [...results.slice(offset), ...results.slice(0, offset)];

  return rotated.slice(0, maxResults);
}

function productMatchesFilter(product: Product, criteria: FilterCriteria): boolean {
  const { category_slug, interface: iface, min_read_speed, max_read_speed,
          min_write_speed, max_write_speed, capacity_gb, min_capacity, max_capacity,
          form_factor, brand_slug, keywords, min_score, _sort, _limit } = criteria;
  if (category_slug) {
    const slugs = Array.isArray(category_slug) ? category_slug : [category_slug];
    if (!product.category_slug || !slugs.includes(product.category_slug)) return false;
  }
  if (iface) {
    const ifaces = Array.isArray(iface) ? iface : [iface];
    if (!ifaces.includes(product.interface)) return false;
  }
  if (min_read_speed !== undefined && (product.read_speed_mbps < min_read_speed)) return false;
  if (max_read_speed !== undefined && (product.read_speed_mbps > max_read_speed)) return false;
  if (min_write_speed !== undefined && (product.write_speed_mbps < min_write_speed)) return false;
  if (max_write_speed !== undefined && (product.write_speed_mbps > max_write_speed)) return false;
  if (capacity_gb !== undefined && product.capacity_gb !== capacity_gb) return false;
  if (min_capacity !== undefined && product.capacity_gb < min_capacity) return false;
  if (max_capacity !== undefined && product.capacity_gb > max_capacity) return false;
  if (form_factor) {
    const factors = Array.isArray(form_factor) ? form_factor : [form_factor];
    if (!factors.includes(product.form_factor)) return false;
  }
  if (brand_slug) {
    const slugs = Array.isArray(brand_slug) ? brand_slug : [brand_slug];
    if (!product.brand_slug || !slugs.includes(product.brand_slug)) return false;
  }
  if (min_score !== undefined && product.overall_score < min_score) return false;
  if (keywords && keywords.length > 0) {
    const haystack = `${product.name} ${product.description || ""}`.toLowerCase();
    const matches = keywords.some((kw) => haystack.includes(kw.toLowerCase()));
    if (!matches) return false;
  }
  return true;
}

export async function getHubsForProduct(
  db: D1Database,
  siteId: string,
  product: Product,
  maxResults: number = 4
): Promise<Hub[]> {
  const hubs = await getHubsBySite(db, siteId);
  const matching: Hub[] = [];
  for (const hub of hubs) {
    if (matching.length >= maxResults) break;
    try {
      const criteria: FilterCriteria = JSON.parse(hub.filter_criteria || "{}");
      if (productMatchesFilter(product, criteria)) {
        matching.push(hub);
      }
    } catch {
      // skip malformed filter_criteria
    }
  }
  return matching;
}

export async function getHubByCategory(
  db: D1Database,
  siteId: string,
  categorySlug: string
): Promise<Hub | null> {
  const { results } = await db
    .prepare(
      `SELECT * FROM hubs
       WHERE site_id = ? AND is_active = 1
         AND filter_criteria LIKE ?
       ORDER BY display_order ASC
       LIMIT 1`
    )
    .bind(siteId, `%"category_slug":%${categorySlug}%`)
    .all<Hub>();
  return results[0] || null;
}

export async function getPriceHistory(
  db: D1Database,
  productId: number,
  retailer: string,
  days: number = 30
): Promise<{ recorded_at: string; price_cents: number }[]> {
  const { results } = await db
    .prepare(
      `SELECT recorded_at, price_cents FROM price_history
       WHERE product_id = ? AND retailer = ?
       AND recorded_at >= datetime('now', ?)
       ORDER BY recorded_at ASC`
    )
    .bind(productId, retailer, `-${days} days`)
    .all<{ recorded_at: string; price_cents: number }>();
  return results;
}
