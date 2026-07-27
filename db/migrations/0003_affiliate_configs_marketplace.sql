-- Migration 0003: affiliate_configs learns about marketplace + link_code/link_id
--
-- Satisfies:
--   - Plan B2 / B3: locale-aware tag lookup, linkCode=ll1 cart-extend option
--   - Amazon Pol §1(c)(i) line 128: 89-day cart grace depends on cart-extend
--     linkCode on the Special Link for high-intent CTAs.

ALTER TABLE affiliate_configs ADD COLUMN marketplace TEXT DEFAULT 'US';
ALTER TABLE affiliate_configs ADD COLUMN link_code  TEXT;
ALTER TABLE affiliate_configs ADD COLUMN link_id    TEXT;

-- The existing rows used country_code to discriminate locales. Mirror that
-- mapping onto marketplace so Amazon tag lookup can be keyed by visitor
-- marketplace (which middleware derives from country code). For Amazon the
-- marketplace IS the storefront region, so country_code -> marketplace is a
-- 1:1 mapping for the locales we resell to.
UPDATE affiliate_configs SET marketplace = country_code WHERE retailer = 'Amazon';

-- Non-Amazon retailers don't have storefront-locale split today; default 'US'.
UPDATE affiliate_configs SET marketplace = 'US' WHERE retailer != 'Amazon';

-- Cart-extend linkCode for Amazon high-intent CTAs (product page / ProductCard
-- primary button). Set 'll1' on all existing Amazon configs — they all map to
-- the same Associate tag, all get the cart-extend benefit. The rewriter chooses
-- whether to actually apply linkCode per call-site intent.
UPDATE affiliate_configs SET link_code = 'll1' WHERE retailer = 'Amazon';

-- Unique index enforcing the lookup contract: one tag per (site, retailer,
-- marketplace, country). getAffiliateTag() relies on this for a deterministic
-- single-row result.
DROP INDEX IF EXISTS idx_affiliate_lookup;
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_lookup
  ON affiliate_configs(site_id, retailer, marketplace, country_code);
