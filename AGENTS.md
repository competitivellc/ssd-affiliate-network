# SSD Affiliate Network - Project Context

## Overview
Multi-tenant affiliate comparison site for external SSDs served on `externalssds.com` and `portablessds.com`. Built with Astro 5 SSR, deployed on Cloudflare Pages with D1 (SQLite) and KV.

**Repo**: `github.com/competitivellc/ssd-affiliate-network` (branch: `main`)
**Staging**: `https://ssd-affiliate-network.pages.dev`

## ⚠️ IMPORTANT: Google Search Console Access (READ THIS)

**🚨 CRITICAL FOR ALL AI AGENTS — DO NOT SKIP 🚨**

**Any AI agent working on this project CAN and SHOULD read live Google Search Console data for BOTH `externalssds.com` AND `portablessds.com` when doing SEO, content, or performance work. You do NOT need to ask the user for permission or credentials — everything required is already available to you locally.**

This is non-negotiable: you have direct read access to live Google Search Console data for both tenants. **Always use it** rather than asking the user to look things up, guess about keyword performance, or speculate about indexing status. Treat GSC data as authoritative for any SEO decision.

---

### `externalssds.com` GSC Access

- **Service account JSON key path**: read it from the local environment variable `EXTERNALSSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a GSC service account JSON key file — NOT a JSON string itself. Read the file at that path to get the credentials.
- **Property**: `sc-properties:externalssds.com` (default `siteUrl`: `https://externalssds.com`).

### `portablessds.com` GSC Access

- **Service account JSON key path**: read it from the local environment variable `PORTABLESSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.PORTABLESSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:PORTABLESSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a GSC service account JSON key file — NOT a JSON string itself. Read the file at that path to get the credentials.
- **Property**: `sc-properties:portablessds.com` (default `siteUrl`: `https://portablessds.com`).

### How To Read GSC Data

- **API**: Google Search Console API via the `googleapis` npm package (or `google-auth-library` + `@googleapis/searchconsole`). Authenticate with a JWT per-domain using the `client_email` and `private_key` from that domain's JSON key, scope `https://www.googleapis.com/auth/webmasters.readonly`. The two domains use SEPARATE service account JSON files and SEPARATE env vars — do not mix them.
- **What you can query**: search analytics (clicks, impressions, CTR, position) filtered by query/page/date/country/device, URL inspection, sitemap list, index coverage. This is real, current production data — treat it as authoritative for SEO decisions.
- **Do NOT**: commit any JSON key file, print its contents to output, write any path into committed code, or share it. The env vars exist only in the user's local shell environment. Reference them via `process.env` / `$env:` at runtime.
- **Suggested helper location**: if you build a reusable GSC client, put it at `src/lib/gsc.ts` (or `scripts/gsc.ts` for one-off pulls). The client should accept a domain (`'externalssds.com'` or `'portablessds.com'`) and pick the matching env var — never hardcode any path.

### When To Use GSC (Mandatory for Both Domains)

When the user asks anything involving SEO performance, keyword opportunities, indexing status, CTR optimization, ranking movements, top pages, low-CTR queries, or "how is [domain] doing in search", **use the Search Console API directly** rather than asking the user to look it up manually. This applies to **both** `externalssds.com` **and** `portablessds.com` — pick the right env var for whichever domain the user asked about (or query both if the request is generic).

## Architecture
- **Framework**: Astro 5 (`output: "server"`) with `@astrojs/cloudflare` adapter
- **Styling**: Tailwind CSS v3 with `@astrojs/tailwind`
- **Data**: Cloudflare D1 (SQLite) - 8 tables: `sites`, `categories`, `brands`, `products`, `prices`, `price_history`, `affiliate_configs`, `hubs`
- **Cache**: Cloudflare KV (`PRICE_CACHE`)
- **Multi-tenancy**: `src/middleware.ts` detects `Host` header, resolves tenant config, populates `Astro.locals`
- **Geo-targeting**: `src/lib/affiliate.ts` reads `request.cf.country` (Cloudflare edge) → queries `affiliate_configs` for per-country affiliate tag
- **Price sync**: `worker/price-sync.ts` - standalone cron Worker (daily 06:00 UTC), fetches Amazon PAAPI/B&H/Newegg, writes to D1 + KV
- **Auth**: GitHub fine-grained PAT for `competitivellc` stored in Windows Credentials under target `LegacyGeneric:target=ssd-affliate-network_GitHub_AI_Token` (note: original credential name has a typo — `ssd-affliate` not `ssd-affiliate`). User is `competitivellc`. PAT length is 93 chars, starts with `github_pat_`. See "Git Push Authentication" below for the working push method — plain `git push` may hang silently.

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Multi-tenant detection, Cloudflare binding propagation (incl. INDEXNOW_KEY) |
| `src/config/tenants.ts` | Tenant definitions (2 domains + pages.dev preview) |
| `src/lib/db.ts` | All D1 queries: products, prices, categories, affiliates, search, price history |
| `src/lib/affiliate.ts` | Country detection, affiliate URL rewriting |
| `src/lib/pricing.ts` | Price formatting, lowest price, savings calculation |
| `src/lib/kv.ts` | KV cache read/write helpers |
| `src/lib/hubs.ts` | Hub editorial content generation (use-case, performance, value) |
| `src/lib/indexnow.ts` | IndexNow submission: batch, retry with exponential backoff, sitemap |
| `src/pages/index.astro` | Home: hero, featured picks, categories, all products, hub navigation |
| `src/pages/compare.astro` | Spec comparison table with category filtering |
| `src/pages/products/[slug].astro` | Product detail: specs, pros/cons, price history, buy buttons |
| `src/pages/hubs/[slug].astro` | Programmatic hub page: use-case/performance/value drives with editorial |
| `src/pages/hubs/index.astro` | Hub directory listing all hub pages grouped by type |
| `src/pages/api/prices.ts` | JSON endpoint: `/api/prices?slug=X&retailer=Y` |
| `worker/price-sync.ts` | Cron trigger for daily price sync |
| `db/schema.sql` | D1 table definitions (8 tables: +hubs) |
| `db/seed.sql` | Sample data: 2 sites, 6 categories, 10 brands, 12 products, 21 prices, 10 affiliate configs, 15 hubs |
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

## IndexNow
- **Key**: `899c04f2948896bb0b7cf612a792b2abc7a0ebb7eee71feed16f2d1a2ac8ac42` (stored as Cloudflare secret `INDEXNOW_KEY`)
- **Admin token**: `3bf9050d00ac4dc4f1038bc97e785da764a092d55113c78269076e8c5ec46654` (stored as `INDEXNOW_ADMIN_TOKEN`)
- **Verification**: `https://<domain>/<KEY>.txt` — served dynamically by `src/pages/[key].txt.ts`
- **Endpoints**: `POST /api/indexnow/submit` (Bearer auth with admin token)
- **Script**: `npm run indexnow:submit` (reads `.env.indexnow`)
- **Library**: `src/lib/indexnow.ts` — `submitSingleUrl()`, `submitBatch()`, `submitSitemap()` with exponential backoff

## Important Patterns
- **Dynamic styles**: Use `style={{ property: value }}` (object syntax), NOT `style="prop: {expr}"` (Cloudflare SSR doesn't evaluate the latter)
- **DB access**: Via `Astro.locals.DB` (set by middleware from `runtime.env.DB`)
- **Tenant access**: Via `Astro.locals.tenant` (set by middleware)
- **Brand color usage**: Applied only to SVG icons, accent bars, and small decorative elements - NOT to headings/body text (use `text-surface-900`)
- **Affiliate links**: `GeoAffiliateLink.astro` component handles country-aware URL rewriting
- **Tailwind classes**: Use the custom `surface-*` palette (50-950)
- **"Best of" sections**: Always use `getTopRatedProducts(db, siteId, limit)` which sorts by `overall_score DESC`. Never rely on the `is_featured` flag for homepage/landing page ranking — that flag is for manual editorial promotions, not algorithmic ranking. New high-scoring products will appear in "Best" sections automatically.

## Critical Policy: Commit & Push
The AI agent must always commit and push changes directly after making any code modifications. The user will never do this. Stage the file(s), write a concise commit message, and push to trigger Cloudflare auto-deploy. Do not ask for permission - just do it.

## Git Push Authentication

**Symptom**: plain `git push` (or `git push origin main`) may hang silently for 60+ seconds and produce no output. This is git-credential-manager waiting on an interactive auth dialog for the *stale* cached GitHub credential (`businessdevelopmentcompanies`), which lacks push rights to `competitivellc/ssd-affiliate-network`. Do **not** retry the same command — it will hang again.

**Root cause**: a stale Windows Credential at target `git:https://github.com` (user `businessdevelopmentcompanies`) shadows the fine-grained PAT stored under `LegacyGeneric:target=ssd-affliate-network_GitHub_AI_Token` (note the typo — `ssd-affliate`, not `ssd-affiliate`). The PAT is NOT registered with git-credential-manager, so GCM never tries it.

**Working push method** — retrieve the PAT via the Win32 `CredRead` API (type 1 = `CRED_TYPE_GENERIC`) and inject it into a one-shot push URL with the credential helper disabled. PAT is never written to disk, never echoed in output, and the variable holding it is nulled after use:

```powershell
Add-Type -ErrorAction Stop @"
using System;
using System.Runtime.InteropServices;
public static class CredRead2 {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public uint Flags; public uint Type; public string TargetName; public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist;
        public uint AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName;
    }
    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, uint type, uint flags, out IntPtr cred);
    [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr cred);
    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (!CredRead(target, 1, 0, out credPtr))
            throw new System.ComponentModel.Win32Exception(System.Runtime.InteropServices.Marshal.GetLastWin32Error());
        try {
            CREDENTIAL cred = (CREDENTIAL)System.Runtime.InteropServices.Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            if (cred.CredentialBlobSize == 0) return "";
            byte[] blob = new byte[cred.CredentialBlobSize];
            System.Runtime.InteropServices.Marshal.Copy(cred.CredentialBlob, blob, 0, (int)cred.CredentialBlobSize);
            return System.Text.Encoding.Unicode.GetString(blob).TrimEnd('\0');
        } finally { CredFree(credPtr); }
    }
}
"@
$pat = [CredRead2]::GetPassword("LegacyGeneric:target=ssd-affliate-network_GitHub_AI_Token")
$url  = "https://competitivellc:" + [Uri]::EscapeDataString($pat) + "@github.com/competitivellc/ssd-affiliate-network.git"
git -c credential.helper= push $url main 2>&1
$pat = $null; [GC]::Collect()
# Then sync local remote-tracking refs:
git fetch origin
```

Push output (e.g. `837a4b1..19775a6  main -> main`) confirms success even though PowerShell wraps git's stderr as a RemoteException. The exit=0 and ref-update line are what matter.

**After a successful push**, run `git fetch origin` to sync the local `origin/main` remote-tracking ref — direct-URL pushes bypass the standard tracking-ref update, so `git status` may still show "ahead N" even though the remote has accepted the commits.

**One-time permanent fix (user-only, not recommended for AI to run unprompted)**: clear the stale shadowing credential so GCM falls through to interactive auth:
```powershell
cmdkey /delete:git:https://github.com
```
This does NOT delete the PAT target. Only do this if pushes keep hanging and the user has authorized it.

## Post-Deploy Checklist (MANDATORY)

After EVERY push/deploy, you MUST run the IndexNow submission for BOTH production domains using their REAL sitemaps. Never use `ssd-affiliate-network.pages.dev` for anything production-related — that staging URL will get you yelled at.

```bash
# 1. Submit externalssds.com
Set-Content -Path ".env.indexnow" -Value @"
INDEXNOW_KEY=899c04f2948896bb0b7cf612a792b2abc7a0ebb7eee71feed16f2d1a2ac8ac42
INDEXNOW_HOST=externalssds.com
INDEXNOW_SITEMAP=https://externalssds.com/sitemap.xml
"@
npm run indexnow:submit

# 2. Submit portablessds.com
Set-Content -Path ".env.indexnow" -Value @"
INDEXNOW_KEY=899c04f2948896bb0b7cf612a792b2abc7a0ebb7eee71feed16f2d1a2ac8ac42
INDEXNOW_HOST=portablessds.com
INDEXNOW_SITEMAP=https://portablessds.com/sitemap.xml
"@
npm run indexnow:submit

# 3. Clean up
Remove-Item -Force ".env.indexnow" -ErrorAction SilentlyContinue
```

**CRITICAL**: Always use `externalssds.com` and `portablessds.com` as the sitemap URLs. Never substitute `ssd-affiliate-network.pages.dev` — that is a preview/staging domain and its sitemap is NOT correct for IndexNow submissions even though the canonical URLs happen to resolve correctly due to tenant config. Using it is incorrect and will be rejected.

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
- [x] Taxonomy hub pages: use-case, performance, value with editorial content
- [x] Hub directory listing all programmatic hub pages
- [x] Hub navigation on homepage (buying guides + rankings)
- [x] IndexNow verification key file served dynamically (`/[key].txt.ts`)
- [x] IndexNow batch submission library with retry/exponential backoff
- [x] Admin submission API endpoint (Bearer auth)
- [x] Post-deploy submission script (npm run indexnow:submit)

## What's Pending
- [ ] Cron price-sync worker not deployed (needs API keys → `npx wrangler deploy worker/price-sync.ts --name ssd-price-sync`)
- [ ] D1 + KV bindings need to be added to the cron worker in dashboard
- [ ] Real Amazon PAAPI, B&H Photo, Newegg API keys (set via `npx wrangler secret put`)
- [ ] Real affiliate tags (update `affiliate_configs` table)
- [ ] GitHub default branch still `master` on remote - should be changed to `main`

## New Session Boilerplate
Paste this at the start of a new conversation with any AI coding agent:

> I am building a multi-tenant SSD affiliate comparison network. The repo is at `github.com/competitivellc/ssd-affiliate-network` on branch `main`. It's an Astro 5 SSR site deployed on Cloudflare Pages with D1 (SQLite) and KV cache, serving `externalssds.com` and `portablessds.com`. The codebase is fully functional and deployed. Read `AGENTS.md` in the repo root for full context. You have direct read access to live Google Search Console data for `portablessds.com` via the service account JSON key at the path in the local env var `PORTABLESSDS_GSC_SERVICE_ACCOUNT` — use it for any SEO/performance work instead of asking me to look things up. I need you to help with [your specific task]. No global installs - use `npx` for all wrangler commands. After making code changes, commit and push - I won't do it. After pushing, run the Post-Deploy Checklist to submit IndexNow for both domains.

## D1 CLI Commands
```bash
npx wrangler d1 execute ssd-affiliate-db --remote --command="SQL"
npx wrangler d1 execute ssd-affiliate-db --file=./db/schema.sql --remote
npx wrangler d1 execute ssd-affiliate-db --file=./db/seed.sql --remote
```

## Build & Deploy
```bash
npm run build         # Build Astro locally
# Then push using the PAT-injection method in "Git Push Authentication" above.
# Plain `git push` may hang silently — see that section.
# AFTER push: run the Post-Deploy Checklist above (IndexNow for both domains)
```
