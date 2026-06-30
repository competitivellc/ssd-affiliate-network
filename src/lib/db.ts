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

export async function getLastUpdatedDate(db: D1Database, siteId: string): Promise<string | null> {
  const { results } = await db
    .prepare(
      `SELECT MAX(updated_at) as last_updated FROM products WHERE site_id = ? AND is_active = 1`
    )
    .bind(siteId)
    .all<{ last_updated: string }>();
  return results[0]?.last_updated || null;
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
