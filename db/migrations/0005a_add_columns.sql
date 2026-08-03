-- Migration 0005 retry: Add columns + backfill (no UNIQUE constraint on asin).

-- 1. New columns (skip if already exists)
-- D1/SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so use try/catch via individual commands.
ALTER TABLE products ADD COLUMN asin TEXT;
ALTER TABLE products ADD COLUMN model_family TEXT;
ALTER TABLE products ADD COLUMN image_url TEXT;
