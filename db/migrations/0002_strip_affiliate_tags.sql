-- Migration 0002: strip any pre-baked affiliate tag from prices.affiliate_url
--
-- Satisfies:
--   - Plan A1 / fix for D1, D18
--   - Amazon Pol §2(a): "Special Links must use the Associates ID we have assigned"
--     (the assigned tag lives in affiliate_configs; baked tags in seed.sql
--     create a second source of truth and risk crediting the wrong Associates
--     account, or double-tagging on render).
--   - Amazon Pol Commission §5 (attribution-mixing rule): the URL stored in
--     prices must not carry a competing Associates tag.
--
-- After this migration, prices.affiliate_url should contain the canonical
-- Amazon product URL (e.g. https://www.amazon.com/dp/B09VLK9W3S) with NO tag
-- parameter. The rewriter (buildAffiliateUrl) injects the correct tag at
-- render time from affiliate_configs.

-- SQLite's replace() is character-based, not regex. Apply strip iteratively
-- for the patterns we actually seeded ("?tag=...&", "?tag=...", "&tag=...&",
-- "&tag=..."). A trailing dangling "?" or "&" may remain; the second pass
-- normalizes those.

UPDATE prices
SET affiliate_url = CASE
  -- "?tag=X&rest"  -> "?rest"
  WHEN affiliate_url LIKE '%?tag=%&%' AND instr(affiliate_url, '?tag=') < instr(affiliate_url, '&', substr(affiliate_url, instr(affiliate_url, '?tag=')))
    THEN substr(affiliate_url, 1, instr(affiliate_url, '?tag=') - 1) || '?' ||
         substr(affiliate_url, instr(affiliate_url, '?tag=') + length(substr(affiliate_url, instr(affiliate_url, '?tag='), instr(substr(affiliate_url, instr(affiliate_url, '?tag=') + 1), '&') + 1)) + 1)
  -- "?tag=X"      -> ""
  WHEN affiliate_url LIKE '%?tag=%' AND instr(affiliate_url, '&', substr(affiliate_url, instr(affiliate_url, '?tag='))) = 0
    THEN substr(affiliate_url, 1, instr(affiliate_url, '?tag=') - 1)
  -- "&tag=X"      -> ""
  WHEN affiliate_url LIKE '%&tag=%'
    THEN substr(affiliate_url, 1, instr(affiliate_url, '&tag=') - 1)
  ELSE affiliate_url
END
WHERE affiliate_url LIKE '%tag=%';

-- Normalise any dangling "?" with no params that result from the strip.
UPDATE prices SET affiliate_url = substr(affiliate_url, 1, length(affiliate_url) - 1)
WHERE affiliate_url LIKE '%?';

-- Normalise any trailing "&".
UPDATE prices SET affiliate_url = substr(affiliate_url, 1, length(affiliate_url) - 1)
WHERE affiliate_url LIKE '%&';

-- Validation: no row should carry a "tag=" parameter after this migration runs.
-- (Asserted by scripts/audit_affiliate_links.ts in CI; query output below
-- will be empty if successful.)
SELECT COUNT(*) AS rows_with_baked_tag FROM prices WHERE affiliate_url LIKE '%tag=%';
