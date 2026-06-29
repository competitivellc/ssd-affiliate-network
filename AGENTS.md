# SSD Affiliate Network — Project Context

## Overview
Multi-tenant affiliate comparison site for external SSDs served on `externalssds.com` and `portablessds.com`. Built with Astro 5 SSR, deployed on Cloudflare Pages with D1 (SQLite) and KV.

**Repo**: `github.com/competitivellc/ssd-affiliate-network` (branch: `main`)
**Staging**: `https://ssd-affiliate-network.pages.dev`

## Architecture
- **Framework**: Astro 5 (`output: "server"`) with `@astrojs/cloudflare` adapter
- **Styling**: Tailwind CSS v3 with `@astrojs/tailwind`
- **Data**: Cloudflare D1 (SQLite) — 7 tables: `sites`, `categories`, `brands`, `products`, `prices`, `price_history`, `affiliate_configs`
- **Cache**: Cloudflare KV (`PRICE_CACHE`)
- **Multi-tenancy**: `src/middleware.ts` detects `Host` header, resolves tenant config, populates `Astro.locals`
- **Geo-targeting**: `src/lib/affiliate.ts` reads `request.cf.country` (Cloudflare edge) → queries `affiliate_configs` for per-country affiliate tag
- **Price sync**: `worker/price-sync.ts` — standalone cron Worker (daily 06:00 UTC), fetches Amazon PAAPI/B&H/Newegg, writes to D1 + KV
- **Auth**: GitHub fine-grained PAT stored in Windows Credentials (`ssd-affliate-network_GitHub_AI_Token`)

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Multi-tenant detection, Cloudflare binding propagation |
| `src/config/tenants.ts` | Tenant definitions (2 domains + pages.dev preview) |
| `src/lib/db.ts` | All D1 queries: products, prices, categories, affiliates, search, price history |
| `src/lib/affiliate.ts` | Country detection, affiliate URL rewriting |
| `src/lib/pricing.ts` | Price formatting, lowest price, savings calculation |
| `src/lib/kv.ts` | KV cache read/write helpers |
| `src/pages/index.astro` | Home: hero, featured picks, categories, all products |
| `src/pages/compare.astro` | Spec comparison table with category filtering |
| `src/pages/products/[slug].astro` | Product detail: specs, pros/cons, price history, buy buttons |
| `src/pages/api/prices.ts` | JSON endpoint: `/api/prices?slug=X&retailer=Y` |
| `worker/price-sync.ts` | Cron trigger for daily price sync |
| `db/schema.sql` | D1 table definitions (7 tables) |
| `db/seed.sql` | Sample data: 2 sites, 6 categories, 10 brands, 12 products, 21 prices, 10 affiliate configs |
| `wrangler.toml` | Cloudflare config with D1/KV bindings |

## Cloudflare Resources
- **D1 database**: `ssd-affiliate-db` (ID: `c3915552-b3e5-4f59-a9f2-736070adba03`)
- **KV namespace**: `PRICE_CACHE` (ID: `68b4b1e79ec8441f86764b16f5b5957a`)
- **Pages project**: `ssd-affiliate-network` (connected to GitHub repo)
- **D1 binding**: `DB` → `ssd-affiliate-db`
- **KV binding**: `PRICE_CACHE` → `PRICE_CACHE`
- **Custom domains**: `externalssds.com`, `www.externalssds.com`, `portablessds.com`, `www.portablessds.com`
- **Build settings**: Framework: Astro, Build: `npm run build`, Output: `dist`, Root: `/`

## Tenant Colors
- `externalssds.com` → blue (`#0c8ee7`)
- `portablessds.com` → green (`#10b981`)

## Important Patterns
- **Dynamic styles**: Use `style={{ property: value }}` (object syntax), NOT `style="prop: {expr}"` (Cloudflare SSR doesn't evaluate the latter)
- **DB access**: Via `Astro.locals.DB` (set by middleware from `runtime.env.DB`)
- **Tenant access**: Via `Astro.locals.tenant` (set by middleware)
- **Brand color usage**: Applied only to SVG icons, accent bars, and small decorative elements — NOT to headings/body text (use `text-surface-900`)
- **Affiliate links**: `GeoAffiliateLink.astro` component handles country-aware URL rewriting
- **Tailwind classes**: Use the custom `surface-*` palette (50–950)

## What's Done
- [x] Full project scaffold, Astro + Cloudflare adapter + Tailwind
- [x] D1 schema + seed data deployed to remote
- [x] Multi-tenant middleware (hostname → branding/content)
- [x] All pages: home, product detail, compare, API, 404
- [x] Product comparison table with spec comparison
- [x] Geo-targeted affiliate link rewriting
- [x] Price history (30-day) on product pages
- [x] Brand colors deployed (accent-only usage)
- [x] Per-domain favicons (blue/green SSD chip)
- [x] Custom domains (all 4) with SSL
- [x] Git repo connected to Cloudflare Pages (auto-deploy on push)

## What's Pending
- [ ] Cron price-sync worker not deployed (needs API keys → `npx wrangler deploy worker/price-sync.ts --name ssd-price-sync`)
- [ ] D1 + KV bindings need to be added to the cron worker in dashboard
- [ ] Real Amazon PAAPI, B&H Photo, Newegg API keys (set via `npx wrangler secret put`)
- [ ] Real affiliate tags (update `affiliate_configs` table)
- [ ] GitHub default branch still `master` on remote — should be changed to `main`

## New Session Boilerplate
Paste this at the start of a new conversation with any AI coding agent:

> I am building a multi-tenant SSD affiliate comparison network. The repo is at `github.com/competitivellc/ssd-affiliate-network` on branch `main`. It's an Astro 5 SSR site deployed on Cloudflare Pages with D1 (SQLite) and KV cache, serving `externalssds.com` and `portablessds.com`. The codebase is fully functional and deployed. Read `AGENTS.md` in the repo root for full context. I need you to help with [your specific task]. No global installs — use `npx` for all wrangler commands.

## D1 CLI Commands
```bash
npx wrangler d1 execute ssd-affiliate-db --remote --command="SQL"
npx wrangler d1 execute ssd-affiliate-db --file=./db/schema.sql --remote
npx wrangler d1 execute ssd-affiliate-db --file=./db/seed.sql --remote
```

## Build & Deploy
```bash
npm run build         # Build Astro locally
git push              # Triggers Cloudflare auto-deploy
```
