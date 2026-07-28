-- Migration 0002 (rewrite v2): strip any pre-baked affiliate tag from prices.affiliate_url
--
-- Strategy: rely on the structure of the seeded data — every baked tag
-- appears as "?tag=<value>" with NO other query parameters. We strip the
-- entire "?tag=..." suffix when present. This is robust and uses only
-- 2-arg instr() / substr() — which is what Cloudflare D1's SQLite build
-- supports.
--
-- After this migration, prices.affiliate_url should contain the canonical
-- Amazon product URL (e.g. https://www.amazon.com/dp/B09VLK9W3S) with NO tag
-- parameter. The rewriter (buildAffiliateUrl) injects the correct tag at
-- render time from affiliate_configs.
--
-- Satisfies:
--   - Plan A1 / fix for D1, D18
--   - Amazon Pol §2(a): "Special Links must use the Associates ID we have assigned"
--     (the assigned tag lives in affiliate_configs; baked tags in seed.sql
--     create a second source of truth and risk crediting the wrong Associates
--     account, or double-tagging on render).
--   - Amazon Pol Commission §5 (attribution-mixing rule): the URL stored in
--     prices must not carry a competing Associates tag.

-- Stage 1: strip a trailing "?tag=..." suffix (no other query string
-- parameters). The seeded URLs follow this pattern: "https://...?tag=xxxx".
-- If there's any "&" AFTER the "?tag=", the seed pattern wouldn't match.
UPDATE prices
SET affiliate_url = substr(affiliate_url, 1, instr(affiliate_url, '?tag=') - 1)
WHERE affiliate_url LIKE '%?tag=%'
  AND instr(affiliate_url, '&') < instr(affiliate_url, '?tag=');

-- Stage 2: trim any dangling "?" or "&" left by the strip.
UPDATE prices SET affiliate_url = substr(affiliate_url, 1, length(affiliate_url) - 1)
WHERE affiliate_url LIKE '%?' OR affiliate_url LIKE '%&';

-- Validation: zero rows should carry a "tag=" parameter after this migration.
-- (Asserted by scripts/audit_affiliate_links.ts in CI.)
SELECT COUNT(*) AS rows_with_baked_tag FROM prices WHERE affiliate_url LIKE '%tag=%';
