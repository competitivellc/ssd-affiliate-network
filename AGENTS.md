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

---

## ⚠️ IMPORTANT: Google Analytics 4 Access (READ THIS)

**🚨 CRITICAL FOR ALL AI AGENTS — DO NOT SKIP 🚨**

**Any AI agent working on this project CAN and SHOULD read live Google Analytics 4 (GA4) data for BOTH `externalssds.com` AND `portablessds.com` when doing traffic, engagement, conversion, audience, or performance analysis. You do NOT need to ask the user for permission or credentials — everything required is already available to you locally.**

This is non-negotiable: you have direct read access to live GA4 data for both tenants. **Always use it** rather than asking the user to look things up, guessing about traffic, or speculating about user behavior. Treat GA4 data as authoritative for any analytics decision.

> **Note on naming**: The env vars are named `*_GSC_SERVICE_ACCOUNT` for historical reasons, but the same JSON key files also grant access to Google Analytics 4 for the matching domain. The GSC scope (`webmasters.readonly`) is NOT sufficient on its own — you must request GA4 scopes when building the JWT client (see below).

---

### `externalssds.com` GA4 Access

- **Service account JSON key path**: read it from the local environment variable `EXTERNALSSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a service account JSON key file — NOT a JSON string itself. Read the file at that path to get the credentials.
- **GA4 Property**: the numeric GA4 property ID for `externalssds.com`. Read it from the local environment variable `EXTERNALSSDS_GA4_PROPERTY_ID` (e.g. `123456789` — pure digits, no `properties/` prefix when used in the API). Falls back to the convention of looking up the property whose `name` matches `properties/<id>` and whose linked stream is for `externalssds.com` if the env var is not set.
- **Service account email**: the `client_email` field inside the JSON key file. This email must be granted **Viewer** access on the GA4 property in the Google Analytics admin UI (Admin → Property access management).

### `portablessds.com` GA4 Access

- **Service account JSON key path**: read it from the local environment variable `PORTABLESSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.PORTABLESSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:PORTABLESSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a service account JSON key file — NOT a JSON string itself. Read the file at that path to get the credentials.
- **GA4 Property**: the numeric GA4 property ID for `portablessds.com`. Read it from the local environment variable `PORTABLESSDS_GA4_PROPERTY_ID`. Falls back to discovery by linked stream if the env var is not set.
- **Service account email**: the `client_email` field inside the JSON key file. This email must be granted **Viewer** access on the GA4 property in the Google Analytics admin UI.

### How To Read GA4 Data

- **API**: Google Analytics Data API v1 (`analyticsdata.googleapis.com`) via the `googleapis` npm package — use `google.analyticsdata({ version: 'v1beta' }).properties.runReport(...)` or the v1 equivalent. Authenticate with a JWT per-domain using the `client_email` and `private_key` from that domain's JSON key, scope `https://www.googleapis.com/auth/analytics.readonly`. The two domains use SEPARATE service account JSON files and SEPARATE env vars — do not mix them.
- **Alternative**: the Google Analytics Admin API (`analyticsadmin.googleapis.com`) for metadata (property info, account summaries, linked streams). Scope `https://www.googleapis.com/auth/analytics.readonly` covers both Data and Admin APIs.
- **What you can query** (Data API):
  - Report metrics: `sessions`, `totalUsers`, `newUsers`, `engagedSessions`, `engagementRate`, `averageSessionDuration`, `bounceRate`, `screenPageViews`, `conversions`, `eventCount`, `totalRevenue`, etc.
  - Dimensions: `date`, `sessionDefaultChannelGroup`, `sessionSource`, `sessionMedium`, `sessionCampaignName`, `country`, `city`, `deviceCategory`, `browser`, `pagePath`, `pageTitle`, `landingPage`, `hostName`, `newVsReturning`, `language`, etc.
  - Filters: date ranges, dimension/metric filters, orderings, limits, offsets.
  - Realtime API for last-30-min activity (`runRealtimeReport`).
- **Do NOT**: commit any JSON key file, print its contents to output, write any path into committed code, or share it. The env vars exist only in the user's local shell environment. Reference them via `process.env` / `$env:` at runtime.
- **Suggested helper location**: if you build a reusable GA4 client, put it at `src/lib/ga4.ts` (or `scripts/ga4.ts` for one-off pulls). The client should accept a domain (`'externalssds.com'` or `'portablessds.com'`) and pick the matching env vars — never hardcode any path or property ID.

### When To Use GA4 (Mandatory for Both Domains)

When the user asks anything involving traffic, sessions, users, pageviews, engagement, bounce rate, session duration, conversions, revenue, channel/source attribution, top pages by traffic, top countries, device split, new vs returning users, landing pages, or "how is [domain] doing" in terms of audience behavior, **use the Analytics Data API directly** rather than asking the user to look it up manually. This applies to **both** `externalssds.com` **and** `portablessds.com` — pick the right env vars for whichever domain the user asked about (or query both if the request is generic).

### GA4 Re-Run Cadence (MANDATORY for Analytics Work)

A live GA4 data-pull script should exist at `scripts/ga4_pull_traffic.js` (create it if it doesn't exist yet). It queries the Analytics Data API for both `externalssds.com` and `portablessds.com` across sessions/users/pageviews/engagement, channel breakdown, top pages, top countries, device split, and 28-day trends. Run it with:

```bash
node scripts/ga4_pull_traffic.js
```

When a new AI agent makes changes that could affect traffic (SEO, content, UX, ads, internal linking) and deploys them, the changes need time to materialize in GA4. The agent MUST re-run `node scripts/ga4_pull_traffic.js` **7-14 days after the deploy date** to measure session/pageview/engagement deltas on the affected URLs and channels, then compare against the baseline captured at deploy time.

---

## ⚠️ CRITICAL: Amazon Associates Compliance (ALL AI AGENTS MUST READ)

**🚨 ANY AI AGENT TOUCHING THIS PROJECT MUST READ AND FOLLOW THIS SECTION. VIOLATIONS CAN CAUSE IMMEDIATE ACCOUNT TERMINATION WITH NO WARNING. 🚨**

These sites (`externalssds.com` and `portablessds.com`) earn revenue through the **Amazon Associates Program**. Amazon does NOT warn before terminating accounts — any violation is treated as a "material breach" and triggers immediate closure + forfeiture of all earned commissions. Every AI agent working on this codebase MUST ensure all code and content remains compliant with the [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) and [Program Policies](https://affiliate-program.amazon.com/help/operating/policies) (last updated April 14, 2026).

### Mandatory Disclosure (DO NOT REMOVE OR MODIFY)

Every page that contains affiliate links MUST display the following exact Amazon-required disclosure text. It must appear **clearly and conspicuously** — not hidden in small print, not buried in a footer-only, not behind a "show more" toggle. The current implementation places it in the Footer component AND inline on each page template. **Do not remove either placement.**

**Required verbatim text**: `As an Amazon Associate I earn from qualifying purchases.`

Current disclosure locations (if Amazon changes its required wording, update ALL of these):
- `src/components/Footer.astro` — site-wide footer disclosure (line ~86)
- Every page template (`index.astro`, `products/[slug].astro`, `compare.astro`, `hubs/[slug].astro`, `best/[slug].astro`, `brands/[slug].astro`, `category/[slug].astro`, `compare/[slug].astro`, `products/[slug]/[retailer].astro`) — inline disclosure block

### Content Rules (AI-Generated Content Must Comply)

1. **Original content required**: Amazon's April 2026 update added a definition requiring original content to contain "commentary, analysis, or transformation for additional value." AI-generated product descriptions, pros/cons, and hub editorial MUST include genuine analysis — never just copy or rephrase Amazon's product listing text. Every product page and hub page must have substantial original editorial content.

2. **No misleading claims**: Never write exaggerated, inaccurate, or deceptive claims about products. No guaranteed performance claims. No fake urgency ("buy now before it's gone!"). No misleading price information.

3. **No customer reviews/ratings from Amazon**: Do NOT scrape, display, or reference Amazon customer reviews or star ratings on the site unless obtained through the PA API / Creators API and in compliance with those APIs' terms. The site's own editorial ratings (our `overall_score`) are fine.

4. **Remove expired promotions**: If any page references a limited-time Amazon promotion (e.g., "15% off"), that content must be removed as soon as the promotion ends. Do not hardcode promotional references.

### Link Rules

1. **Special Links must use Associates ID**: All Amazon affiliate links must contain the correct Associates tag (format: `XXXXX-##`). The `GeoAffiliateLink.astro` component handles this via `affiliate_configs` table. Never hardcode Amazon URLs without the tag.

2. **No cloaking or redirecting**: Links must not obscure the Amazon URL. No hidden iframes, no JS-based redirects that hide the destination. Links should clearly go to Amazon.

3. **No pop-ups/pop-unders**: Special Links must not open in pop-up or pop-under windows (except narrow product-related promotions).

4. **No incentivized clicks**: Never offer rewards, rebates, points, or any incentive for clicking affiliate links. No "loyalty programs" tied to Amazon links.

5. **No software/browser extensions**: Never create browser extensions, toolbars, or client-side apps that inject Amazon affiliate links.

6. **Links must be on YOUR site**: Amazon links must be accessed directly from the site pages. No posting them on Amazon itself, no posting them on social media in ways that violate the agreement.

### Price Display Rules

1. **No price tracking/alerting**: Amazon's Program Policies explicitly state: "your Site must not have price tracking and/or price alerting functionality." The current price history chart shows historical pricing for informational purposes — this is different from a price alerting feature. **Do NOT add features like**: price drop alerts, email notifications when prices change, user-configurable price thresholds, or any mechanism that tracks prices over time and notifies users. If in doubt, ask before implementing any price-related feature.

2. **Price accuracy**: If you display prices, they must be accurate and sourced from Amazon's API (PA API/Creators API) or served via Amazon's own link tools. Never hardcode or guess prices. The site currently syncs prices via `worker/price-sync.ts` from PA API — this is compliant as long as prices are refreshed reasonably often.

3. **If showing price comparisons** with non-Amazon retailers: you must display both the lowest "new" price and, if available, the lowest "used" price on the Amazon listing.

### Paid Advertising Restrictions

1. **No paid ads linking to Amazon**: Amazon's April 2026 update expanded disqualified purchases to include products purchased by customers referred through **any** paid or boosted advertisement linking to Amazon, with limited exceptions. Do NOT run Google Ads, Facebook ads, or any paid traffic campaigns that link directly to Amazon product pages.

2. **No bidding on Amazon keywords**: Never bid on keywords containing "amazon", "kindle", or any Amazon trademark in paid search advertising.

3. **Organic search is fine**: Publishing content that ranks organically in Google and links to Amazon is the core business model — this is fully allowed.

### Prohibited Activities (DO NOT IMPLEMENT)

- Do NOT allow users to purchase products through your own affiliate links (self-referral is banned)
- Do NOT create fake or misleading content about Amazon or its policies
- Do NOT intercept, record, or redirect user form submissions to Amazon
- Do NOT modify Amazon page behavior (buttons, links, features)
- Do NOT use Amazon's customer reviews or ratings without PA API compliance
- Do NOT sell, resell, or redistribute Amazon product data/API content
- Do NOT use Amazon trademarks in domain names, subdomains, or social media handles
- Do NOT attempt to circumvent the commission tracking system
- Do NOT artificially generate clicks or sessions
- Do NOT frame Amazon pages within the site

### FTC Disclosure (Separate from Amazon)

In addition to Amazon's required disclosure, the FTC requires clear disclosure of material connections. The current "As an Amazon Associate I earn from qualifying purchases" text satisfies both Amazon and FTC requirements. If you add any other affiliate programs (B&H, Newegg, etc.), their disclosures must also be included.

### Compliance Checklist for AI Agents

Before committing ANY change, verify:
- [ ] Disclosure text is present and visible on any new/modified page
- [ ] No Amazon customer reviews/ratings are displayed without PA API compliance
- [ ] No price alerting/tracking features are added
- [ ] No paid advertising campaigns link to Amazon
- [ ] Product descriptions contain original editorial commentary (not just rephrased Amazon text)
- [ ] No Amazon trademarks are used in domains, handles, or identifiers
- [ ] Links are not cloaked, hidden, or opened in pop-ups
- [ ] No incentives are offered for clicking affiliate links

**Reference**: [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) | [Program Policies](https://affiliate-program.amazon.com/help/operating/policies) | [April 2026 Changes](https://affiliate-program.amazon.com/help/operating/compare)

---

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

## GSC Re-Run Cadence (MANDATORY for SEO Work)

A live GSC data-pull script exists at `scripts/gsc_pull_revenue.js`. It queries the Search Console API for both `externalssds.com` and `portablessds.com` across clicks, impressions, CTR, position, top pages, top queries, page→query mappings, and 7-day trends. Run it with:

```bash
node scripts/gsc_pull_revenue.js
```

**When a new AI agent makes SEO changes and deploys them, the changes need time to take effect in Google's index before their impact can be measured.** The agent MUST re-run `node scripts/gsc_pull_revenue.js` **7-14 days after the deploy date** to measure position/click deltas on the affected URLs and queries, then compare against the baseline captured at deploy time.

The baseline from the most recent SEO work (deployed 2026-07-29 — CTR-optimized titles/meta on `/compare` and product pages) is:

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 1 |
| 90d impressions | 309 | 351 |
| Avg position | 37.9 | 33.9 |
| 90d CTR | 0.32% | 0.28% |

Target URLs to track (the four URLs whose titles/meta were rewritten on 2026-07-29 — these are the ones the re-run is measuring):
- `externalssds.com/compare` — pre-deploy: 1c / 70i / pos 27.9 / CTR 1.43%
- `externalssds.com/products/samsung-t7-shield` — pre-deploy: 0c / 155i / pos 37.6 / CTR 0%
- `portablessds.com/compare` — pre-deploy: 1c / 97i / pos 26.7 / CTR 1.03%
- `portablessds.com/products/sandisk-extreme-pro-portable` — pre-deploy: 0c / 96i / pos 38.1 / CTR 0%
- `portablessds.com/products/samsung-t7-shield-portable` — pre-deploy: 0c / 43i / pos 29.5 / CTR 0%

Target queries to watch: `samsung t7 shield 4tb portable ssd amazon.com price` (was pos 7.5, routed to `/compare`), `1 tb portable ssd price` (pos 27.7), `portable ssd comparison` (pos 14.3 on portablessds home, pos 29 on `/compare`), `rugged external ssd` (8i/pos 50.1), `shockproof portable ssd` / `shockproof portable ssds` / `shockproof ssds for travel` (collectively ~22i to the rugged-travel hub).

### ⚠️ PENDING RE-RUN — DO THIS FIRST (2026-08-05 → 2026-08-12)

**The 2026-07-29 CTR-fix deploy is awaiting measurement.** Any AI agent opening this repo between **2026-08-05 and 2026-08-12** (or later, until this block is replaced/removed) MUST:

1. Run `node scripts/gsc_pull_revenue.js` immediately at the start of the session.
2. Compare the 5 target URLs above against their pre-deploy numbers (compare the *same* 7-day or 90-day window — GSC numbers roll forward daily, so use whichever window the script outputs).
3. Decide:
   - **CTR moved up** (target: CTR ≥ 1.5% on the 5 URLs, vs ~0.31% pre-deploy) → the title/meta rewrite worked. Update the baseline table above with fresh numbers, delete this "PENDING RE-RUN" block, and note the result. Then look at the next revenue lever: internal-link equity to lift the hub pages (`/hubs/best-rugged-portable-ssd-for-travel`, `/hubs/cheapest-1tb-portable-ssd`) from pos 47-56 up to page 2.
   - **CTR did not move** → the bottleneck is ranking position, not snippet copy. Skip further title/meta iteration. Go straight to ranking work: internal links from home + nav into the hub pages, and consider consolidating the `/products/samsung-t7-shield` page (pos 37.6) with the `/compare` page that's already ranking pos 7.5 for the buyer query `samsung t7 shield 4tb portable ssd amazon.com price`.
4. Update this `AGENTS.md` section with the result so the *next* agent doesn't re-measure the same deploy. Either replace this "PENDING RE-RUN" block with a "RESULT (date): ..." block, or remove it if the baseline block above already reflects the measured numbers.
5. After measuring, also note the current date as the new deploy-baseline for any SEO work *you* do this session.

**Any future AI agent doing SEO work on this repo MUST, at the start of its session, re-run `node scripts/gsc_pull_revenue.js` to get a fresh baseline, and note the current date as the deploy-baseline for the next agent. Update the baseline table above with fresh numbers when you do.**

For traffic/engagement analytics work, agents have the same direct GA4 access (see "Google Analytics 4 Access" section above) and should re-run `node scripts/ga4_pull_traffic.js` 7-14 days after deploys that affect UX, content, internal linking, or ad placement.

### ⚠️ PENDING RE-RUN — DO THIS FIRST (2026-08-12 → 2026-08-19)

**The 2026-07-29 cannibalization consolidation deploy is awaiting measurement.** Commit `8f14782` added `<link rel="canonical">` on all `/category/{slug}` and `/best/{slug}` pages pointing at the matching `/hubs/{slug}`. This tells Google to treat the hub page as the authoritative URL for "best X for Y" queries. URLs stay live — no redirects, no 410s. Google consolidates naturally over 4-8 weeks.

Any AI agent opening this repo between **2026-08-12 and 2026-08-19** (or later, until this block is replaced/removed) MUST:

1. Run `node scripts/gsc_pull_revenue.js` immediately at the start of the session.
2. Look at the hub pages — these are the ones the canonical is pointing TO:
   - `externalssds.com/hubs/best-rugged-external-ssd` (was 0c / 18i / pos 38.3)
   - `externalssds.com/hubs/best-ssd-for-xbox` (was 0c / 8i / pos 22.1)
   - `externalssds.com/hubs/fastest-usb-3-2-gen-2x2` (was 0c / 4i / pos 9.5)
   - `portablessds.com/hubs/best-rugged-portable-ssd-for-travel` (was 0c / 55i / pos 47.9)
   - `portablessds.com/hubs/cheapest-1tb-portable-ssd` (was 0c / 17i / pos 29.3)
   - `portablessds.com/hubs/fastest-usb-c-portable-ssd` (was 0c / 11i / pos 32.2)
3. Look at `/category/{slug}` and `/best/{slug}` pages — these should show declining impressions as Google consolidates them onto the hubs.
4. Decide:
   - **Hub impressions went UP / hub position improved** → the canonical is working. Delete this block, update the baseline table, and move to the next lever: hub content depth (expand `hubs.ts` editorial blocks from 350-550 words to 1000-1500).
   - **Hub impressions stayed flat / no change** → Google hasn't consolidated yet. Wait 2 more weeks, then re-measure. If still flat after 6 weeks total, the issue is hub content thinness, not cannibalization.
   - **Hub impressions went DOWN** → the canonical is pointing at the wrong hub (wrong filter_criteria match). Investigate `getHubByCategory` in `db.ts` and fix the query.
5. Update this `AGENTS.md` section with the result so the *next* agent doesn't re-measure the same deploy.

**Any future AI agent doing SEO work on this repo MUST, at the start of its session, re-run `node scripts/gsc_pull_revenue.js` to get a fresh baseline, and note the current date as the deploy-baseline for the next agent. Update the baseline table above with fresh numbers when you do.**

## GA4 Script Note (read before running `ga4_pull_traffic.js`)

As of 2026-07-29 the script accepts the `EXTERNALSSDS_GA4_PROPERTY_ID` / `PORTABLESSDS_GA4_PROPERTY_ID` env vars in either format — bare numeric ID (`547488517`) or full resource name (`properties/547488517`). It strips a leading `properties/` prefix before passing to the Data API. If you change the env var format, no script edit is needed.

The script's fallback path (when those env vars are unset) calls the **Google Analytics Admin API** to discover the property ID by matching a linked web stream URL. That Admin API must be enabled on the service account's GCP project (`1061819200823`) or the fallback 403s. The env-var path bypasses the Admin API entirely, so prefer setting the env vars over enabling the Admin API.

**Known open issue (as of 2026-07-29):** even with the property IDs set correctly, `node scripts/ga4_pull_traffic.js` returns zero rows on a 365-day window for both properties. Either the property IDs point at the wrong GA4 properties (empty/abandoned ones, not the ones wired to the live sites), or the service account has not been granted **Viewer** on the actual GA4 properties in the Analytics admin UI, or the GA4 tags are not actually firing on the live sites. A future agent doing analytics/traffic work should resolve this before relying on GA4 numbers; GSC is authoritative for SEO work and does not require GA4.


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
- [x] Product page SEO: commercial query-anchored titles, AggregateRating/Offer/Review/BreadcrumbList JSON-LD, FAQ schema, "Price & Where to Buy" section, competitor spec comparison table, Most Popular homepage section for internal link equity
- [x] GSC live data pull script (scripts/gsc_pull_revenue.js) — queries both domains for clicks/impressions/CTR/position/top pages/top queries
- [x] GA4 live data pull script (scripts/ga4_pull_traffic.js) — queries both domains for sessions/users/pageviews/engagement/channel/country/device
- [x] Fix: removed `export async function getStaticPaths()` from `src/pages/products/[slug].astro` — the Astro compiler was emitting a duplicate `export` inside the component function body, causing esbuild to fail with "Unexpected export" once the frontmatter grew past a threshold. SSR pages don't need `getStaticPaths()` anyway (it's ignored with a warning).
- [x] CTR-fix: tenant-aware, query-anchored titles/meta on `/compare` and product pages (deployed 2026-07-29, commit `f0d3493`)
- [x] Bug fix: 500 on all product pages with no fresh price (TDZ regression from CTR-fix) + `${product.name}` literal-text bug in File Transfer Speeds section (deployed 2026-07-29, commit `af36102`)
- [x] Cannibalization consolidation: `/category/{slug}` and `/best/{slug}` canonicalized to matching `/hubs/{slug}` via BaseLayout `canonical` prop + `getHubByCategory()` DB query (deployed 2026-07-29, commit `8f14782`)

## What's Pending
- [ ] Cron price-sync worker not deployed (needs API keys → `npx wrangler deploy worker/price-sync.ts --name ssd-price-sync`)
- [ ] D1 + KV bindings need to be added to the cron worker in dashboard
- [ ] Real Amazon PAAPI, B&H Photo, Newegg API keys (set via `npx wrangler secret put`)
- [ ] Real affiliate tags (update `affiliate_configs` table)
- [ ] GitHub default branch still `master` on remote - should be changed to `main`

## New Session Boilerplate
Paste this at the start of a new conversation with any AI coding agent:

> I am building a multi-tenant SSD affiliate comparison network. The repo is at `github.com/competitivellc/ssd-affiliate-network` on branch `main`. It's an Astro 5 SSR site deployed on Cloudflare Pages with D1 (SQLite) and KV cache, serving `externalssds.com` and `portablessds.com`. The codebase is fully functional and deployed. Read `AGENTS.md` in the repo root for full context. **CRITICAL: This project earns revenue via Amazon Associates — any violation = immediate account termination with no warning. You MUST read and comply with the "Amazon Associates Compliance" section of AGENTS.md before writing ANY code or content.** You have direct read access to live Google Search Console data for `portablessds.com` via the service account JSON key at the path in the local env var `PORTABLESSDS_GSC_SERVICE_ACCOUNT` — use it for any SEO/performance work instead of asking me to look things up. I need you to help with [your specific task]. No global installs - use `npx` for all wrangler commands. After making code changes, commit and push - I won't do it. After pushing, run the Post-Deploy Checklist to submit IndexNow for both domains.

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
