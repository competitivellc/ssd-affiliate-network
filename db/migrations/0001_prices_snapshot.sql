-- Migration 0001: prices becomes a snapshot table
-- One row per (product_id, retailer, marketplace, condition) — the latest fetch.
-- Historical time series remains in price_history.
--
-- Satisfies:
--   - Plan A1 / D2 (stale-row fix)
--   - Amazon Pol §2(b): prices must be accurate + refreshed reasonably often
--   - Amazon Pol IP §2(c)(h) line 541: 24h cache clock enforcement at read time
--
-- Strategy: build prices_new with the expanded schema, copy existing rows
-- (defaulting marketplace='US', condition='new', url_source='manual'), dedupe
-- to keep the row with MAX(fetched_at) per (product_id, retailer, marketplace, condition),
-- then swap.

CREATE TABLE IF NOT EXISTS prices_new (
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

-- Copy existing rows, applying safe defaults. fetched_at had a default of
-- datetime('now') in the old schema, which means seed/legacy rows carry the
-- insert timestamp rather than NULL; preserve as-is.
INSERT INTO prices_new (
  id, product_id, retailer, marketplace, condition, price_cents,
  currency, affiliate_url, url_source, in_stock, fetched_at
)
SELECT
  id, product_id, retailer, 'US', 'new', price_cents,
  currency, affiliate_url, 'manual', in_stock, fetched_at
FROM prices
WHERE id IN (
  SELECT id FROM prices p1
  WHERE NOT EXISTS (
    SELECT 1 FROM prices p2
    WHERE p2.product_id = p1.product_id
      AND p2.retailer   = p1.retailer
      AND (p2.fetched_at > p1.fetched_at OR (p2.fetched_at = p1.fetched_at AND p2.id > p1.id))
  )
);

-- Drop the append-only table and swap in the snapshot.
DROP TABLE prices;
ALTER TABLE prices_new RENAME TO prices;

CREATE INDEX IF NOT EXISTS idx_prices_pmc ON prices(product_id, marketplace, condition);
CREATE INDEX IF NOT EXISTS idx_prices_retailer ON prices(retailer);
CREATE INDEX IF NOT EXISTS idx_prices_fresh ON prices(product_id, marketplace, fetched_at);
