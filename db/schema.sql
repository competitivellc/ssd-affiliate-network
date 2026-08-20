-- Multi-tenant affiliate network schema
-- Cloudflare D1 (SQLite-compatible)
-- Reflects final state after migrations 0001–0004.

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0c8ee7',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  category_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  model TEXT,
  asin TEXT,
  model_family TEXT,
  image_url TEXT,
  gtin13 TEXT,
  capacity_gb INTEGER,
  form_factor TEXT CHECK(form_factor IN ('M.2 2280','M.2 2230','2.5" SATA','mSATA','U.2','External')),
  interface TEXT CHECK(interface IN ('NVMe PCIe 5.0','NVMe PCIe 4.0','NVMe PCIe 3.0','SATA III','USB 3.2 Gen 2','USB 3.2 Gen 2x2','Thunderbolt 3','Thunderbolt 4','USB4')),
  read_speed_mbps INTEGER,
  write_speed_mbps INTEGER,
  tbw INTEGER,
  warranty_years INTEGER,
  description TEXT,
  specifications TEXT,
  pros TEXT,
  cons TEXT,
  overall_score REAL CHECK(overall_score >= 0 AND overall_score <= 10),
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

-- Snapshot table: one row per (product_id, retailer, marketplace, condition).
-- Updated by price-sync worker; historical time series lives in price_history.
CREATE TABLE IF NOT EXISTS prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  retailer TEXT NOT NULL CHECK(retailer IN ('Amazon','B&H Photo','Newegg')),
  marketplace TEXT NOT NULL DEFAULT 'US',
  condition TEXT NOT NULL DEFAULT 'new' CHECK(condition IN ('new','used','refurbished')),
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  affiliate_url TEXT,
  url_source TEXT NOT NULL DEFAULT 'manual' CHECK(url_source IN ('paapi','seed','manual','vendor')),
  in_stock INTEGER DEFAULT 1,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(product_id, retailer, marketplace, condition)
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  retailer TEXT NOT NULL,
  marketplace TEXT NOT NULL DEFAULT 'US',
  condition TEXT NOT NULL DEFAULT 'new',
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  recorded_at TEXT DEFAULT (datetime('now'))
);

-- One tag per (site, retailer, marketplace, country_code).
-- getAffiliateTag() and getAffiliateTagsBatch() rely on this lookup contract.
CREATE TABLE IF NOT EXISTS affiliate_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  retailer TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '*',
  affiliate_tag TEXT NOT NULL,
  marketplace TEXT DEFAULT 'US',
  link_code TEXT,
  link_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site_id, retailer, marketplace, country_code)
);

CREATE TABLE IF NOT EXISTS hubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  hub_type TEXT NOT NULL CHECK(hub_type IN ('use-case', 'performance', 'value')),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meta_description TEXT,
  h1 TEXT,
  intro_html TEXT,
  filter_criteria TEXT NOT NULL DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS link_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checked_at TEXT NOT NULL DEFAULT (datetime('now')),
  url TEXT NOT NULL,
  site_id TEXT NOT NULL,
  product_id INTEGER,
  retailer TEXT,
  marketplace TEXT,
  condition TEXT,
  passed INTEGER NOT NULL,
  failure_reason TEXT
);

-- Server-side affiliate-click attribution beacon (independent of cookie
-- consent). One row per affiliate Special Link click, captured via a passive
-- sendBeacon POST from the client listener in BaseLayout.astro. No PII (no
-- IP, no UA, no cookies) — first-party analytics only, Amazon-compliant.
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  page_path TEXT NOT NULL,
  product_slug TEXT,
  retailer TEXT,
  cta_label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_site_category ON products(site_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_model_family ON products(model_family);
CREATE INDEX IF NOT EXISTS idx_prices_pmc ON prices(product_id, marketplace, condition);
CREATE INDEX IF NOT EXISTS idx_prices_retailer ON prices(retailer);
CREATE INDEX IF NOT EXISTS idx_prices_fresh ON prices(product_id, marketplace, fetched_at);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, recorded_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_lookup ON affiliate_configs(site_id, retailer, marketplace, country_code);
CREATE INDEX IF NOT EXISTS idx_hubs_site_active ON hubs(site_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_checked ON link_audit_log(checked_at);
CREATE INDEX IF NOT EXISTS idx_audit_pass ON link_audit_log(passed, checked_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_site_created ON affiliate_clicks(site_id, created_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_slug ON affiliate_clicks(product_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_page ON affiliate_clicks(page_path);
