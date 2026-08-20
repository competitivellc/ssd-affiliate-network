#!/usr/bin/env node
// affiliate_clicks_report.js — per-page/per-product click attribution report.
//
// Reads the affiliate_clicks D1 table (populated by the server-side beacon in
// BaseLayout.astro -> /api/affiliate-click) and prints 30d totals, daily
// counts, top pages, top products, and retailer split. Use to cross-check the
// Amazon Associates dashboard "Clicks" figure and to see WHICH pages convert
// (the dashboard buckets ASINs as "others", so this table is the only
// per-URL attribution source).
//
// Requires wrangler auth (OAuth token, as used for all D1 commands).
// Run: node scripts/affiliate_clicks_report.js

import { execSync } from "node:child_process";

const DB_NAME = "ssd-affiliate-db";

const QUERIES = [
  {
    title: "30d totals",
    sql: `SELECT COUNT(*) AS total_clicks,
                 COUNT(DISTINCT product_slug) AS distinct_products,
                 COUNT(DISTINCT page_path) AS distinct_pages,
                 SUM(CASE WHEN product_slug IS NOT NULL AND product_slug != '' THEN 1 ELSE 0 END) AS with_product
          FROM affiliate_clicks
          WHERE created_at >= datetime('now','-30 days');`,
  },
  {
    title: "Last 7d total (cross-check vs Associates dashboard)",
    sql: `SELECT COUNT(*) AS clicks_7d FROM affiliate_clicks WHERE created_at >= datetime('now','-7 days');`,
  },
  {
    title: "Clicks by day (14d)",
    sql: `SELECT date(created_at) AS day, COUNT(*) AS clicks
          FROM affiliate_clicks
          GROUP BY day ORDER BY day DESC LIMIT 14;`,
  },
  {
    title: "Top pages (30d)",
    sql: `SELECT page_path, COUNT(*) AS clicks
          FROM affiliate_clicks
          WHERE created_at >= datetime('now','-30 days')
          GROUP BY page_path ORDER BY clicks DESC LIMIT 20;`,
  },
  {
    title: "Top products by slug (30d)",
    sql: `SELECT product_slug, COUNT(*) AS clicks
          FROM affiliate_clicks
          WHERE created_at >= datetime('now','-30 days') AND product_slug IS NOT NULL AND product_slug != ''
          GROUP BY product_slug ORDER BY clicks DESC LIMIT 20;`,
  },
  {
    title: "By retailer (30d)",
    sql: `SELECT COALESCE(NULLIF(retailer,''),'(none)') AS retailer, COUNT(*) AS clicks
          FROM affiliate_clicks
          WHERE created_at >= datetime('now','-30 days')
          GROUP BY retailer ORDER BY clicks DESC;`,
  },
];

function runQuery(sql) {
  const flat = sql.replace(/\s+/g, " ").trim();
  let raw;
  try {
    raw = execSync(`npx wrangler d1 execute ${DB_NAME} --remote --command="${flat.replace(/"/g, '\\"')}" --json`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      shell: "cmd.exe",
    });
  } catch (err) {
    const msg = String(err && err.stderr ? err.stderr : err);
    if (/no such table: affiliate_clicks/i.test(msg)) {
      console.log("affiliate_clicks table not found — schema not deployed yet.");
      process.exit(0);
    }
    throw err;
  }
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) {
    console.log("Unexpected wrangler output; raw was:");
    console.log(raw);
    return [];
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  return (parsed && parsed[0] && parsed[0].results) || [];
}

for (const q of QUERIES) {
  console.log(`\n=== ${q.title} ===`);
  const rows = runQuery(q.sql);
  if (!rows.length) {
    console.log("(no rows)");
    continue;
  }
  console.table(rows);
}
console.log("");