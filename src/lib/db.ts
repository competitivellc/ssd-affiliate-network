import type { D1Database } from "@cloudflare/workers-types";

export interface Product {
  id: number;
  site_id: string;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  model: string;
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
}

export interface Price {
  id: number;
  product_id: number;
  retailer: string;
  price_cents: number;
  currency: string;
  affiliate_url: string | null;
  in_stock: number;
  fetched_at: string;
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

export async function getProductPrices(
  db: D1Database,
  productId: number
): Promise<Price[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM prices
       WHERE product_id = ?
       ORDER BY price_cents ASC`
    )
    .bind(productId)
    .all<Price>();
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
  countryCode: string
): Promise<string | null> {
  const { results } = await db
    .prepare(
      `SELECT affiliate_tag FROM affiliate_configs
       WHERE site_id = ? AND retailer = ? AND country_code = ?
       LIMIT 1`
    )
    .bind(siteId, retailer, countryCode)
    .all<{ affiliate_tag: string }>();

  if (results[0]) return results[0].affiliate_tag;

  const { results: fallback } = await db
    .prepare(
      `SELECT affiliate_tag FROM affiliate_configs
       WHERE site_id = ? AND retailer = ? AND country_code = '*'
       LIMIT 1`
    )
    .bind(siteId, retailer)
    .all<{ affiliate_tag: string }>();

  return fallback[0]?.affiliate_tag || null;
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
