-- Multi-tenant affiliate network schema
-- Cloudflare D1 (SQLite-compatible)

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

CREATE TABLE IF NOT EXISTS prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  retailer TEXT NOT NULL CHECK(retailer IN ('Amazon','B&H Photo','Newegg')),
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  affiliate_url TEXT,
  in_stock INTEGER DEFAULT 1,
  fetched_at TEXT DEFAULT (datetime('now')),
  UNIQUE(product_id, retailer, fetched_at)
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  retailer TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id),
  retailer TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT '*',
  affiliate_tag TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site_id, retailer, country_code)
);

CREATE INDEX IF NOT EXISTS idx_products_site_category ON products(site_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_lookup ON affiliate_configs(site_id, retailer, country_code);
