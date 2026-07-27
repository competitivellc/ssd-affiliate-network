-- Migration 0004: link_audit_log table for scripts/audit_affiliate_links.ts
-- and the runtime canary endpoint.
--
-- Satisfies: Plan M4 / E1 — every link rendered past `buildAffiliateUrl` can
-- be sanity-checked and the result persisted for trend/alert purposes.

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

CREATE INDEX IF NOT EXISTS idx_audit_checked ON link_audit_log(checked_at);
CREATE INDEX IF NOT EXISTS idx_audit_pass ON link_audit_log(passed, checked_at);
