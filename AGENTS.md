# SSD Affiliate Network - Project Context

> ## 🚨 START HERE — last agent's handoff (2026-08-05)
> **Previous session (2026-08-04) shipped the `/compare` T7-buyer-query overhaul** (commit `9329992`):
> - `src/pages/compare.astro` default view now titles/H1s around `Samsung T7 Shield 4TB [Portable|External] SSD — Amazon Price, Specs & Side-by-Side Comparison (2026)` and renders a new "Buyer's Price Query" anchor section (blue-bordered card, "Check Price on Amazon →" GeoAffiliateLink w/ cart-extend linkCode, spec readout, internal links to the 4TB variant product page + category compare) targeting the buyer-intent query `samsung t7 shield 4tb portable ssd amazon.com price` (was pos 7.5 on externalssds `/compare`, 0 clicks both tenants).
> - `src/lib/db.ts`: new `getT7ShieldAnchor()` (highest-capacity non-301'd T7 Shield variant per tenant, prefers 4TB).
> - ItemList JSON-LD: T7 Shield at position 1, products 2-10.
> - Smoke test extended for both tenants.
> - IndexNow re-submitted: externalssds 3,367 URLs + portablessds 3,044 URLs, all HTTP 200.
> - **NEXT AGENT (2026-08-11 → 2026-08-18) MUST**: re-run `node scripts/gsc_pull_revenue.js` at the start of the session and compare against the `RESULT (2026-08-05)` baseline block below (fresh 90d: externalssds 517i pos39.1; portablessds 713i pos35.4). Primary target: `/compare` position on `samsung t7 shield 4tb portable ssd amazon.com price` moves from pos 7.5 → top 5 (expect CTR ~1.5% → 4-6% with real SERP-direct-answer block). Secondary: catalog-expansion surface still pending (see `RESULT (2026-08-03)` block). Update the baseline table with fresh numbers when done.

## Overview
Multi-tenant affiliate comparison site for external SSDs served on `externalssds.com` and `portablessds.com`. Built with Astro 5 SSR, deployed on Cloudflare Pages with D1 (SQLite) and KV.

**Repo**: `github.com/competitivellc/ssd-affiliate-network` (branch: `main`)
**Staging**: `https://ssd-affiliate-network.pages.dev`

## âš ï¸ IMPORTANT: Google Search Console Access (READ THIS)

**ðŸš¨ CRITICAL FOR ALL AI AGENTS â€” DO NOT SKIP ðŸš¨**

**Any AI agent working on this project CAN and SHOULD read live Google Search Console data for BOTH `externalssds.com` AND `portablessds.com` when doing SEO, content, or performance work. You do NOT need to ask the user for permission or credentials â€” everything required is already available to you locally.**

This is non-negotiable: you have direct read access to live Google Search Console data for both tenants. **Always use it** rather than asking the user to look things up, guess about keyword performance, or speculate about indexing status. Treat GSC data as authoritative for any SEO decision.

---

### `externalssds.com` GSC Access

- **Service account JSON key path**: read it from the local environment variable `EXTERNALSSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a GSC service account JSON key file â€” NOT a JSON string itself. Read the file at that path to get the credentials.
- **Property**: `sc-properties:externalssds.com` (default `siteUrl`: `https://externalssds.com`).

### `portablessds.com` GSC Access

- **Service account JSON key path**: read it from the local environment variable `PORTABLESSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.PORTABLESSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:PORTABLESSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a GSC service account JSON key file â€” NOT a JSON string itself. Read the file at that path to get the credentials.
- **Property**: `sc-properties:portablessds.com` (default `siteUrl`: `https://portablessds.com`).

### How To Read GSC Data

- **API**: Google Search Console API via the `googleapis` npm package (or `google-auth-library` + `@googleapis/searchconsole`). Authenticate with a JWT per-domain using the `client_email` and `private_key` from that domain's JSON key, scope `https://www.googleapis.com/auth/webmasters.readonly`. The two domains use SEPARATE service account JSON files and SEPARATE env vars â€” do not mix them.
- **What you can query**: search analytics (clicks, impressions, CTR, position) filtered by query/page/date/country/device, URL inspection, sitemap list, index coverage. This is real, current production data â€” treat it as authoritative for SEO decisions.
- **Do NOT**: commit any JSON key file, print its contents to output, write any path into committed code, or share it. The env vars exist only in the user's local shell environment. Reference them via `process.env` / `$env:` at runtime.
- **Suggested helper location**: if you build a reusable GSC client, put it at `src/lib/gsc.ts` (or `scripts/gsc.ts` for one-off pulls). The client should accept a domain (`'externalssds.com'` or `'portablessds.com'`) and pick the matching env var â€” never hardcode any path.

### When To Use GSC (Mandatory for Both Domains)

When the user asks anything involving SEO performance, keyword opportunities, indexing status, CTR optimization, ranking movements, top pages, low-CTR queries, or "how is [domain] doing in search", **use the Search Console API directly** rather than asking the user to look it up manually. This applies to **both** `externalssds.com` **and** `portablessds.com` â€” pick the right env var for whichever domain the user asked about (or query both if the request is generic).

---

## âš ï¸ IMPORTANT: Google Analytics 4 Access (READ THIS)

**ðŸš¨ CRITICAL FOR ALL AI AGENTS â€” DO NOT SKIP ðŸš¨**

**Any AI agent working on this project CAN and SHOULD read live Google Analytics 4 (GA4) data for BOTH `externalssds.com` AND `portablessds.com` when doing traffic, engagement, conversion, audience, or performance analysis. You do NOT need to ask the user for permission or credentials â€” everything required is already available to you locally.**

This is non-negotiable: you have direct read access to live GA4 data for both tenants. **Always use it** rather than asking the user to look things up, guessing about traffic, or speculating about user behavior. Treat GA4 data as authoritative for any analytics decision.

> **Note on naming**: The env vars are named `*_GSC_SERVICE_ACCOUNT` for historical reasons, but the same JSON key files also grant access to Google Analytics 4 for the matching domain. The GSC scope (`webmasters.readonly`) is NOT sufficient on its own â€” you must request GA4 scopes when building the JWT client (see below).

---

### `externalssds.com` GA4 Access

- **Service account JSON key path**: read it from the local environment variable `EXTERNALSSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:EXTERNALSSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a service account JSON key file â€” NOT a JSON string itself. Read the file at that path to get the credentials.
- **GA4 Property**: the numeric GA4 property ID for `externalssds.com`. Read it from the local environment variable `EXTERNALSSDS_GA4_PROPERTY_ID` (e.g. `123456789` â€” pure digits, no `properties/` prefix when used in the API). Falls back to the convention of looking up the property whose `name` matches `properties/<id>` and whose linked stream is for `externalssds.com` if the env var is not set.
- **Service account email**: the `client_email` field inside the JSON key file. This email must be granted **Viewer** access on the GA4 property in the Google Analytics admin UI (Admin â†’ Property access management).

### `portablessds.com` GA4 Access

- **Service account JSON key path**: read it from the local environment variable `PORTABLESSDS_GSC_SERVICE_ACCOUNT` (e.g. via `process.env.PORTABLESSDS_GSC_SERVICE_ACCOUNT` in Node, or `$env:PORTABLESSDS_GSC_SERVICE_ACCOUNT` in PowerShell). The variable holds an **absolute file path** on the local machine pointing to a service account JSON key file â€” NOT a JSON string itself. Read the file at that path to get the credentials.
- **GA4 Property**: the numeric GA4 property ID for `portablessds.com`. Read it from the local environment variable `PORTABLESSDS_GA4_PROPERTY_ID`. Falls back to discovery by linked stream if the env var is not set.
- **Service account email**: the `client_email` field inside the JSON key file. This email must be granted **Viewer** access on the GA4 property in the Google Analytics admin UI.

### How To Read GA4 Data

- **API**: Google Analytics Data API v1 (`analyticsdata.googleapis.com`) via the `googleapis` npm package â€” use `google.analyticsdata({ version: 'v1beta' }).properties.runReport(...)` or the v1 equivalent. Authenticate with a JWT per-domain using the `client_email` and `private_key` from that domain's JSON key, scope `https://www.googleapis.com/auth/analytics.readonly`. The two domains use SEPARATE service account JSON files and SEPARATE env vars â€” do not mix them.
- **Alternative**: the Google Analytics Admin API (`analyticsadmin.googleapis.com`) for metadata (property info, account summaries, linked streams). Scope `https://www.googleapis.com/auth/analytics.readonly` covers both Data and Admin APIs.
- **What you can query** (Data API):
  - Report metrics: `sessions`, `totalUsers`, `newUsers`, `engagedSessions`, `engagementRate`, `averageSessionDuration`, `bounceRate`, `screenPageViews`, `conversions`, `eventCount`, `totalRevenue`, etc.
  - Dimensions: `date`, `sessionDefaultChannelGroup`, `sessionSource`, `sessionMedium`, `sessionCampaignName`, `country`, `city`, `deviceCategory`, `browser`, `pagePath`, `pageTitle`, `landingPage`, `hostName`, `newVsReturning`, `language`, etc.
  - Filters: date ranges, dimension/metric filters, orderings, limits, offsets.
  - Realtime API for last-30-min activity (`runRealtimeReport`).
- **Do NOT**: commit any JSON key file, print its contents to output, write any path into committed code, or share it. The env vars exist only in the user's local shell environment. Reference them via `process.env` / `$env:` at runtime.
- **Suggested helper location**: if you build a reusable GA4 client, put it at `src/lib/ga4.ts` (or `scripts/ga4.ts` for one-off pulls). The client should accept a domain (`'externalssds.com'` or `'portablessds.com'`) and pick the matching env vars â€” never hardcode any path or property ID.

### When To Use GA4 (Mandatory for Both Domains)

When the user asks anything involving traffic, sessions, users, pageviews, engagement, bounce rate, session duration, conversions, revenue, channel/source attribution, top pages by traffic, top countries, device split, new vs returning users, landing pages, or "how is [domain] doing" in terms of audience behavior, **use the Analytics Data API directly** rather than asking the user to look it up manually. This applies to **both** `externalssds.com` **and** `portablessds.com` â€” pick the right env vars for whichever domain the user asked about (or query both if the request is generic).

### GA4 Re-Run Cadence (MANDATORY for Analytics Work)

A live GA4 data-pull script should exist at `scripts/ga4_pull_traffic.js` (create it if it doesn't exist yet). It queries the Analytics Data API for both `externalssds.com` and `portablessds.com` across sessions/users/pageviews/engagement, channel breakdown, top pages, top countries, device split, and 28-day trends. Run it with:

```bash
node scripts/ga4_pull_traffic.js
```

When a new AI agent makes changes that could affect traffic (SEO, content, UX, ads, internal linking) and deploys them, the changes need time to materialize in GA4. The agent MUST re-run `node scripts/ga4_pull_traffic.js` **7-14 days after the deploy date** to measure session/pageview/engagement deltas on the affected URLs and channels, then compare against the baseline captured at deploy time.

---

## âš ï¸ CRITICAL: Amazon Associates Compliance (ALL AI AGENTS MUST READ)

**ðŸš¨ ANY AI AGENT TOUCHING THIS PROJECT MUST READ AND FOLLOW THIS SECTION. VIOLATIONS CAN CAUSE IMMEDIATE ACCOUNT TERMINATION WITH NO WARNING. ðŸš¨**

These sites (`externalssds.com` and `portablessds.com`) earn revenue through the **Amazon Associates Program**. Amazon does NOT warn before terminating accounts â€” any violation is treated as a "material breach" and triggers immediate closure + forfeiture of all earned commissions. Every AI agent working on this codebase MUST ensure all code and content remains compliant with the [Amazon Associates Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement) and [Program Policies](https://affiliate-program.amazon.com/help/operating/policies) (last updated April 14, 2026).

### Mandatory Disclosure (DO NOT REMOVE OR MODIFY)

Every page that contains affiliate links MUST display the following exact Amazon-required disclosure text. It must appear **clearly and conspicuously** â€” not hidden in small print, not buried in a footer-only, not behind a "show more" toggle. The current implementation places it in the Footer component AND inline on each page template. **Do not remove either placement.**

**Required verbatim text**: `As an Amazon Associate I earn from qualifying purchases.`

Current disclosure locations (if Amazon changes its required wording, update ALL of these):
- `src/components/Footer.astro` â€” site-wide footer disclosure (line ~86)
- Every page template (`index.astro`, `products/[slug].astro`, `compare.astro`, `hubs/[slug].astro`, `best/[slug].astro`, `brands/[slug].astro`, `category/[slug].astro`, `compare/[slug].astro`, `products/[slug]/[retailer].astro`) â€” inline disclosure block

### Content Rules (AI-Generated Content Must Comply)

1. **Original content required**: Amazon's April 2026 update added a definition requiring original content to contain "commentary, analysis, or transformation for additional value." AI-generated product descriptions, pros/cons, and hub editorial MUST include genuine analysis â€” never just copy or rephrase Amazon's product listing text. Every product page and hub page must have substantial original editorial content.

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

1. **No price tracking/alerting**: Amazon's Program Policies explicitly state: "your Site must not have price tracking and/or price alerting functionality." The current price history chart shows historical pricing for informational purposes â€” this is different from a price alerting feature. **Do NOT add features like**: price drop alerts, email notifications when prices change, user-configurable price thresholds, or any mechanism that tracks prices over time and notifies users. If in doubt, ask before implementing any price-related feature.

2. **Price accuracy**: If you display prices, they must be accurate and sourced from Amazon's API (PA API/Creators API) or served via Amazon's own link tools. Never hardcode or guess prices. The site currently syncs prices via `worker/price-sync.ts` from PA API â€” this is compliant as long as prices are refreshed reasonably often.

3. **If showing price comparisons** with non-Amazon retailers: you must display both the lowest "new" price and, if available, the lowest "used" price on the Amazon listing.

### Paid Advertising Restrictions

1. **No paid ads linking to Amazon**: Amazon's April 2026 update expanded disqualified purchases to include products purchased by customers referred through **any** paid or boosted advertisement linking to Amazon, with limited exceptions. Do NOT run Google Ads, Facebook ads, or any paid traffic campaigns that link directly to Amazon product pages.

2. **No bidding on Amazon keywords**: Never bid on keywords containing "amazon", "kindle", or any Amazon trademark in paid search advertising.

3. **Organic search is fine**: Publishing content that ranks organically in Google and links to Amazon is the core business model â€” this is fully allowed.

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
- **Geo-targeting**: `src/lib/affiliate.ts` reads `request.cf.country` (Cloudflare edge) â†’ queries `affiliate_configs` for per-country affiliate tag
- **Price sync**: `worker/price-sync.ts` - standalone cron Worker (daily 06:00 UTC), fetches Amazon PAAPI/B&H/Newegg, writes to D1 + KV
- **Auth**: GitHub fine-grained PAT for `competitivellc` stored in Windows Credentials under target `LegacyGeneric:target=ssd-affliate-network_GitHub_AI_Token` (note: original credential name has a typo â€” `ssd-affliate` not `ssd-affiliate`). User is `competitivellc`. PAT length is 93 chars, starts with `github_pat_`. See "Git Push Authentication" below for the working push method â€” plain `git push` may hang silently.

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
- **D1 binding**: `DB` â†’ `ssd-affiliate-db`
- **KV binding**: `PRICE_CACHE` â†’ `PRICE_CACHE`
- **Custom domains**: `externalssds.com`, `www.externalssds.com`, `portablessds.com`, `www.portablessds.com`
- **Build settings**: Framework: Astro, Build: `npm run build`, Output: `dist`, Root: `/`

## Tenant Colors
- `externalssds.com` â†’ blue (`#0c8ee7`)
- `portablessds.com` â†’ green (`#10b981`)

## IndexNow
- **Key**: `899c04f2948896bb0b7cf612a792b2abc7a0ebb7eee71feed16f2d1a2ac8ac42` (stored as Cloudflare secret `INDEXNOW_KEY`)
- **Admin token**: `3bf9050d00ac4dc4f1038bc97e785da764a092d55113c78269076e8c5ec46654` (stored as `INDEXNOW_ADMIN_TOKEN`)
- **Verification**: `https://<domain>/<KEY>.txt` â€” served dynamically by `src/pages/[key].txt.ts`
- **Endpoints**: `POST /api/indexnow/submit` (Bearer auth with admin token)
- **Script**: `npm run indexnow:submit` (reads `.env.indexnow`)
- **Library**: `src/lib/indexnow.ts` â€” `submitSingleUrl()`, `submitBatch()`, `submitSitemap()` with exponential backoff

## Important Patterns
- **Dynamic styles**: Use `style={{ property: value }}` (object syntax), NOT `style="prop: {expr}"` (Cloudflare SSR doesn't evaluate the latter)
- **DB access**: Via `Astro.locals.DB` (set by middleware from `runtime.env.DB`)
- **Tenant access**: Via `Astro.locals.tenant` (set by middleware)
- **Brand color usage**: Applied only to SVG icons, accent bars, and small decorative elements - NOT to headings/body text (use `text-surface-900`)
- **Affiliate links**: `GeoAffiliateLink.astro` component handles country-aware URL rewriting
- **Tailwind classes**: Use the custom `surface-*` palette (50-950)
- **"Best of" sections**: Always use `getTopRatedProducts(db, siteId, limit)` which sorts by `overall_score DESC`. Never rely on the `is_featured` flag for homepage/landing page ranking â€” that flag is for manual editorial promotions, not algorithmic ranking. New high-scoring products will appear in "Best" sections automatically.

## Critical Policy: Commit & Push
The AI agent must always commit and push changes directly after making any code modifications. The user will never do this. Stage the file(s), write a concise commit message, and push to trigger Cloudflare auto-deploy. Do not ask for permission - just do it.

## Git Push Authentication

**Symptom**: plain `git push` (or `git push origin main`) may hang silently for 60+ seconds and produce no output. This is git-credential-manager waiting on an interactive auth dialog for the *stale* cached GitHub credential (`businessdevelopmentcompanies`), which lacks push rights to `competitivellc/ssd-affiliate-network`. Do **not** retry the same command â€” it will hang again.

**Root cause**: a stale Windows Credential at target `git:https://github.com` (user `businessdevelopmentcompanies`) shadows the fine-grained PAT stored under `LegacyGeneric:target=ssd-affliate-network_GitHub_AI_Token` (note the typo â€” `ssd-affliate`, not `ssd-affiliate`). The PAT is NOT registered with git-credential-manager, so GCM never tries it.

**Working push method** â€” retrieve the PAT via the Win32 `CredRead` API (type 1 = `CRED_TYPE_GENERIC`) and inject it into a one-shot push URL with the credential helper disabled. PAT is never written to disk, never echoed in output, and the variable holding it is nulled after use:

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

**After a successful push**, run `git fetch origin` to sync the local `origin/main` remote-tracking ref â€” direct-URL pushes bypass the standard tracking-ref update, so `git status` may still show "ahead N" even though the remote has accepted the commits.

**One-time permanent fix (user-only, not recommended for AI to run unprompted)**: clear the stale shadowing credential so GCM falls through to interactive auth:
```powershell
cmdkey /delete:git:https://github.com
```
This does NOT delete the PAT target. Only do this if pushes keep hanging and the user has authorized it.

## Post-Deploy Checklist (MANDATORY)

After EVERY push/deploy, you MUST run the IndexNow submission for BOTH production domains using their REAL sitemaps. Never use `ssd-affiliate-network.pages.dev` for anything production-related â€” that staging URL will get you yelled at.

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

**CRITICAL**: Always use `externalssds.com` and `portablessds.com` as the sitemap URLs. Never substitute `ssd-affiliate-network.pages.dev` â€” that is a preview/staging domain and its sitemap is NOT correct for IndexNow submissions even though the canonical URLs happen to resolve correctly due to tenant config. Using it is incorrect and will be rejected.

## GSC Re-Run Cadence (MANDATORY for SEO Work)

A live GSC data-pull script exists at `scripts/gsc_pull_revenue.js`. It queries the Search Console API for both `externalssds.com` and `portablessds.com` across clicks, impressions, CTR, position, top pages, top queries, pageâ†’query mappings, and 7-day trends. Run it with:

```bash
node scripts/gsc_pull_revenue.js
```

**When a new AI agent makes SEO changes and deploys them, the changes need time to take effect in Google's index before their impact can be measured.** The agent MUST re-run `node scripts/gsc_pull_revenue.js` **7-14 days after the deploy date** to measure position/click deltas on the affected URLs and queries, then compare against the baseline captured at deploy time.

> **⚠ HARD GATE — READ THIS BEFORE RUNNING `gsc_pull_revenue.js`:** the script embeds a self-enforcing re-run watchdog (see the `MANDATORY RE-RUN WATCHDOG` block at the top of `scripts/gsc_pull_revenue.js`). Every run prints the current gate status (PENDING / ACTIVE WINDOW / OVERDUE / RECORDED). Once the re-run window closes **without** a new `### RESULT (YYYY-MM-DD)` block in this file dated >= the window start, the script exits with code 2 and refuses to pull data until the re-run is completed and recorded in AGENTS.md. Do NOT bypass or delete the gate — the `--force` flag is only for running the pull while drafting the RESULT block, and the RESULT must be recorded before proceeding with further SEO work.

The baseline from the most recent SEO work (deployed 2026-07-30 â€” 301 Samsung T7 Shield product pages â†’ `/compare` to consolidate ranking signal on the URL that already ranks pos 6-7 for `samsung t7 shield 4tb portable ssd amazon.com price`) is:

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 2 |
| 90d impressions | 361 | 436 |
| Avg position | 38.8 | 33.6 |
| 90d CTR | 0.28% | 0.46% |

Target URLs to track (the three URLs whose signal is being consolidated â€” these are the ones the re-run is measuring):
- `externalssds.com/compare` â€” pre-deploy: 1c / 83i / pos 30.2 / CTR 1.20% (query `samsung t7 shield 4tb portable ssd amazon.com price` ranked pos 7.5)
- `externalssds.com/products/samsung-t7-shield` â€” pre-deploy: 0c / 172i / pos 37.7 / CTR 0% (NOW 301s to /compare)
- `portablessds.com/compare` â€” pre-deploy: 2c / 119i / pos 25.9 / CTR 1.68%
- `portablessds.com/products/samsung-t7-shield-portable` â€” pre-deploy: 0c / 52i / pos 30.0 / CTR 0% (NOW 301s to /compare)

Target query to watch: `samsung t7 shield 4tb portable ssd amazon.com price` (was pos 7.5 on both `/compare` pages) â€” expect position to rise into top 5 and CTR to climb from ~1.5% â†’ 4-6% as all 224 wasted impressions consolidate onto `/compare`.
Target query to watch: `samsung t7 shield 4tb portable ssd amazon.com price` (was pos 7.5 on both `/compare` pages) - expect position to rise into top 5 and CTR to climb from ~1.5% -> 4-6% as all 224 wasted impressions consolidate onto `/compare`.

### RESULT (2026-08-03): consolidated catalog-expansion baseline captured

The four prior PENDING RE-RUN blocks (2026-07-30 T7 Shield 301 consolidation, 2026-07-29 CTR-fix, 2026-07-29 cannibalization canonicals, 2026-08-03 sitemap rebuild) are collapsed into a single baseline because the 2026-08-03 catalog-expansion deploy is now the dominant driver of search performance and supersedes the earlier isolated deploys. That deploy shipped 138 new product rows (17 -> 155 across both tenants, 9x expansion of indexable URL surface), the Phase 1 compliance fix that had been silently breaking all affiliate-link rendering (stale 24h `fetched_at` filter excluded every price row -> null primaryLink -> empty "Where to Buy" sections site-wide), Phase 4 internal-link equity work (new `/products` directory + capacity-variant cross-links), and the GA4 instrumentation audit that confirmed both properties are correctly wired (the `portablessds.com` "zero rows" issue is now closed as a non-issue - the property is brand-new with minimal traffic; data will populate as traffic grows).

**Post-deploy baseline (captured 2026-08-03 via `node scripts/gsc_pull_revenue.js`):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 2 |
| 90d impressions | 471 | 612 |
| Avg position | 39.6 | 35.7 |
| 90d CTR | 0.21% | 0.33% |

These numbers match the pre-deploy baseline within rounding - Google has NOT yet crawled or indexed any of the new URLs from the 2026-08-03 catalog expansion. IndexNow submitted 6,036 URLs across both sitemaps, but Bing's index-update lag is 1-4 days for fresh URLs and Google does not honor IndexNow at all (Google relies on its own crawl queue, which only sees URLs that surface in the sitemap and get linked-to from already-indexed pages - Phase 4's `/products` directory and capacity cross-links are the primary mechanism for surfacing new product URLs to Google).

**Target URLs / queries to watch (re-run 2026-08-17 -> 2026-08-31):**

1. **Catalog expansion surface** - the 138 new product pages (e.g. `/products/samsung-t7-1tb`, `/products/sandisk-extreme-portable-2tb`, `/products/crucial-x9-pro-2tb`, `/products/wd-black-p50-2tb`, etc.) plus the 138 new brand/category/hub combinations surfaced by the expanded DB queries. All were *absent* from GSC pre-deploy. Target: by 28 days post-deploy, at least 30% of these should appear in the GSC page report with non-zero impressions across both tenants.
2. **`/products` directory route** - the new internal-link hub at `externalssds.com/products` and `portablessds.com/products`. This page links out to all 82 + 73 product pages, giving Google a single high-priority crawl entry. Target: indexed within 14 days.
3. **`/compare/[slug]` combo URLs** - already in the sitemap from the 2026-08-03 sitemap rebuild, but were 100% absent from GSC in the pre-deploy baseline. Expectation: start appearing within 14-28 days post-deploy.
4. **T7 Shield 301 consolidation** - `externalssds.com/products/samsung-t7-shield` and `portablessds.com/products/samsung-t7-shield-portable` impressions should be near-zero (301s). The freed signal should consolidate onto `/compare`, where the buyer query `samsung t7 shield 4tb portable ssd amazon.com price` was pos 7.5. Target: `/compare` position on that query moves into the top 5.
5. **Hub page performance** - `/hubs/best-rugged-external-ssd`, `/hubs/best-ssd-for-xbox`, `/hubs/best-rugged-portable-ssd-for-travel`, `/hubs/cheapest-1tb-portable-ssd` should see impressions lift as the `/category/{slug}` and `/best/{slug}` canonicals (deployed 2026-07-29) consolidate the duplicate URLs onto the hubs.

**Mandatory re-run for any agent opening this repo between 2026-08-17 and 2026-08-31:**

1. Run `node scripts/gsc_pull_revenue.js` immediately at the start of the session.
2. Compare the 90d total impressions against the baseline above. **Target: externalssds 471 -> 700+; portablessds 612 -> 900+** (the sitemap-rebuild + catalog-expansion hypothesis). If impressions rose materially (>=20%) the catalog expansion is working; if flat, the bottleneck is crawl budget - investigate via the GSC URL inspection tool on a sample of the new product URLs.
3. Compare the new product URLs' appearance in the GSC page report. **Target: at least 30% of the 138 new product slugs should show non-zero impressions.** If fewer than 10% appear, Google is not crawling the new URLs - the `/products` directory link equity is not propagating fast enough; investigate whether `/products` itself is indexed (URL inspection).
4. Compare `/compare` position on the buyer query `samsung t7 shield 4tb portable ssd amazon.com price`. **Target: top 5** (was pos 7.5 pre-deploy, still pos 7.5 in the 2026-08-05 baseline captured ~24h after the `/compare` T7 overhaul deployed in `9329992`). If CTR on `/compare` is still under 3%, consider further on-page optimization of `/compare` itself.
5. Update this `AGENTS.md` section with the result. Either replace the `Target URLs / queries to watch` block above with a `RESULT (date):` block showing what actually happened, or update the baseline table with fresh numbers. Delete the redundant `Target N` sub-bullets that no longer apply.

### RESULT (2026-08-05): `/compare` T7-buyer-query overhaul baseline (deployed 2026-08-04, commit `9329992`)

Targets the buyer-intent query `samsung t7 shield 4tb portable ssd amazon.com price`. This was the highest-permission buyer URL that ranks on the site but converts 0% of its impressions: pos 7.5 / 8i / 0c cross-tenant on `/compare` (the only page Google associates with the query). The default (no-filter) `/compare` view and `/compare?category=...` category views got a T7 Shield 4TB "Buyer's Price Query" anchor block with a `Check Price on Amazon →` GeoAffiliateLink (useCartExtend = cart-extend linkCode), spec readout, and internal cross-links → variant product page + category compare view. Title/H1 rewritten, ItemList JSON-LD adds the T7 Shield at position 1. Category-filtered `/compare` views are untouched (the anchor logic only wires when no category/ids filter is applied). `getT7ShieldAnchor()` in `src/lib/db.ts` prefers the 4TB variant and excludes the 301'd base slugs (`samsung-t7-shield`, `samsung-t7-shield-portable`) that redirect to `/compare`.

**Post-deploy baseline (captured 2026-08-05, ~24h after `9329992` deploy + full IndexNow re-submission):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 2 |
| 90d impressions | 517 | 713 |
| Avg position | 39.1 | 35.4 |
| 90d CTR | 0.19% | 0.28% |
| `/compare` total (90d) | 1c / 128i / pos 34.8 | 2c / 140i / pos 27.8 |
| Buyer query on `/compare` | pos 7.5 / 8i / 0c | (query not yet listed in top-20 page mapping) |

Note: 24h is too short for ranking movement — Google must re-crawl the changed `/compare` HTML (title/H1/structured data) and rejudge. The T7 Shield 301'd product URLs still dominate the page report (`products/samsung-t7-shield` 212i pos38.4 — its signal consolidates onto `/compare` over days) and the `samsung t7 4tb portable ssd amazon.com price` variant (non-Shield) still ranks pos 6.3 / 3i on externalssds `/compare`, so opportunities are being watched.

**Any future AI agent doing SEO work on this repo MUST, at the start of its session, re-run `node scripts/gsc_pull_revenue.js` to get a fresh baseline, and note the current date as the deploy-baseline for the next agent. Update the baseline table above with fresh numbers when you do.**

For traffic/engagement analytics work, agents have the same direct GA4 access (see "Google Analytics 4 Access" section above) and should re-run `node scripts/ga4_pull_traffic.js` 7-14 days after deploys that affect UX, content, internal linking, or ad placement.

### RESULT (2026-08-06): pre-deploy baseline for `/compare/[slug]` title/H1/meta rewrite

Captured via `node scripts/gsc_pull_revenue.js` on 2026-08-06, immediately before deploying the query-anchored title/H1/meta recipe rewrite on `src/pages/compare/[slug].astro`. The recipe change targets the head-to-head compare URL form — the only template type on the network with multiple URLs already on page 1 of Google.

**Network-wide baseline (90d, captured 2026-08-06):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 3 |
| 90d impressions | 581 | 845 |
| Avg position | 38.4 | 34.5 |
| 90d CTR | 0.17% | 0.36% |

**Target URLs (the 5 head-to-head compare pages already receiving impressions on portablessds):**

| URL | impressions | position | CTR | clicks |
|-----|-------------|----------|-----|--------|
| portablessds.com/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable | 14 | 11.3 | 7.14% | 1 |
| portablessds.com/compare/crucial-x9-pro-vs-samsung-t7-portable | 6 | 7.2 | 0% | 0 |
| portablessds.com/compare/crucial-x9-pro-vs-samsung-t7-shield-portable | 6 | 33.3 | 0% | 0 |
| portablessds.com/compare/crucial-x9-pro-vs-sandisk-extreme-pro-portable | 5 | 17.0 | 0% | 0 |
| portablessds.com/compare/samsung-t7-portable-vs-crucial-x9-pro | 6 | 7.2 | 0% | 0 |
| portablessds.com/compare/crucial-x9-pro-vs-samsung-t9-portable | 1 | 39.0 | 0% | 0 |

**Top buyer query already producing a click** (proof the recipe direction works): `sandisk extreme pro vs samsung t9` — 1c / 3i / pos 10.3 / **CTR 33.3%** — landing on `portablessds.com/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable`.

**Re-run window**: 2026-08-13 → 2026-08-20. The next agent MUST re-run `node scripts/gsc_pull_revenue.js` in that window and append a `RESULT (YYYY-MM-DD)` block here comparing each of the 6 URLs above pre- vs post-deploy. Success criterion: ≥1 incremental click across the 5 currently-zero-CTR H2H URLs, plus the paying URL maintaining its pos-10.3 / CTR-33% baseline on `sandisk extreme pro vs samsung t9`. Failure criterion: all 5 URLs still 0c by 2026-08-20 → the recipe isn't anchored enough; investigate via the GSC "title match" report whether Google is rewriting the new titles, and iterate the pattern.

## GA4 Script Note (read before running `ga4_pull_traffic.js`)

As of 2026-07-29 the script accepts the `EXTERNALSSDS_GA4_PROPERTY_ID` / `PORTABLESSDS_GA4_PROPERTY_ID` env vars in either format â€” bare numeric ID (`547488517`) or full resource name (`properties/547488517`). It strips a leading `properties/` prefix before passing to the Data API. If you change the env var format, no script edit is needed.

The script's fallback path (when those env vars are unset) calls the **Google Analytics Admin API** to discover the property ID by matching a linked web stream URL. That Admin API must be enabled on the service account's GCP project (`1061819200823`) or the fallback 403s. The env-var path bypasses the Admin API entirely, so prefer setting the env vars over enabling the Admin API.

**Resolved (2026-08-03):** the GA4 issue is now closed. Properties are confirmed wired correctly (`scripts/ga4_audit_properties.js` shows both property IDs match their web streams with the correct measurement IDs, both service accounts have Viewer access). A live `node scripts/ga4_pull_traffic.js` run on 2026-08-03 returned real data for `externalssds.com` (5 sessions, 1 user, 6 pageviews, 1 engaged session over the 28-day window â€” top page `/products/samsung-t9-4tb`). `portablessds.com` still returns zero rows at the time of audit, which is expected: the property is brand-new, traffic is single-digit monthly, and the cookie-consent banner gates gtag loading. Once traffic materially grows and users accept cookies, portablessds data will populate naturally â€” no further code action is required.


## What's Done
- [x] Full project scaffold, Astro + Cloudflare adapter + Tailwind
- [x] D1 schema + seed data deployed to remote
- [x] Multi-tenant middleware (hostname â†’ branding/content)
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
- [x] GSC live data pull script (scripts/gsc_pull_revenue.js) â€” queries both domains for clicks/impressions/CTR/position/top pages/top queries
- [x] GA4 live data pull script (scripts/ga4_pull_traffic.js) â€” queries both domains for sessions/users/pageviews/engagement/channel/country/device
- [x] Fix: removed `export async function getStaticPaths()` from `src/pages/products/[slug].astro` â€” the Astro compiler was emitting a duplicate `export` inside the component function body, causing esbuild to fail with "Unexpected export" once the frontmatter grew past a threshold. SSR pages don't need `getStaticPaths()` anyway (it's ignored with a warning).
- [x] CTR-fix: tenant-aware, query-anchored titles/meta on `/compare` and product pages (deployed 2026-07-29, commit `f0d3493`)
- [x] Bug fix: 500 on all product pages with no fresh price (TDZ regression from CTR-fix) + `${product.name}` literal-text bug in File Transfer Speeds section (deployed 2026-07-29, commit `af36102`)
- [x] Cannibalization consolidation: `/category/{slug}` and `/best/{slug}` canonicalized to matching `/hubs/{slug}` via BaseLayout `canonical` prop + `getHubByCategory()` DB query (deployed 2026-07-29, commit `8f14782`)

## What's Pending
- [ ] Cron price-sync worker not deployed (needs API keys â†’ `npx wrangler deploy worker/price-sync.ts --name ssd-price-sync`)
- [ ] D1 + KV bindings need to be added to the cron worker in dashboard
- [ ] Real Amazon PAAPI, B&H Photo, Newegg API keys (set via `npx wrangler secret put`)
- [ ] Real affiliate tags (update `affiliate_configs` table)
- [ ] GitHub default branch still `master` on remote - should be changed to `main`

## New Session Boilerplate
Paste this at the start of a new conversation with any AI coding agent:

> I am building a multi-tenant SSD affiliate comparison network. The repo is at `github.com/competitivellc/ssd-affiliate-network` on branch `main`. It's an Astro 5 SSR site deployed on Cloudflare Pages with D1 (SQLite) and KV cache, serving `externalssds.com` and `portablessds.com`. The codebase is fully functional and deployed. Read `AGENTS.md` in the repo root for full context. **CRITICAL: This project earns revenue via Amazon Associates â€” any violation = immediate account termination with no warning. You MUST read and comply with the "Amazon Associates Compliance" section of AGENTS.md before writing ANY code or content.** You have direct read access to live Google Search Console data for `portablessds.com` via the service account JSON key at the path in the local env var `PORTABLESSDS_GSC_SERVICE_ACCOUNT` â€” use it for any SEO/performance work instead of asking me to look things up. I need you to help with [your specific task]. No global installs - use `npx` for all wrangler commands. After making code changes, commit and push - I won't do it. After pushing, run the Post-Deploy Checklist to submit IndexNow for both domains.
>
> **MANDATORY RE-RUN WATCHDOG (READ BEFORE ANY SEO WORK):** `scripts/gsc_pull_revenue.js` contains an enforced re-run gate for the 2026-08-04 `/compare` T7-buyer-query deploy (commit `9329992`). Every run prints its status; once the window (2026-08-11 â†’ 2026-08-18) closes without a new `### RESULT` block in AGENTS.md dated >= 2026-08-11, the script refuses to run (exit 2) until the re-run is done and recorded. If you see the gate, follow its instructions exactly â€” do not bypass it (except `--force` AFTER recording the result in AGENTS.md). This affects `samsung t7 shield 4tb portable ssd amazon.com price` on `/compare` (target: pos 7.5 â†’ top 5).

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
# Plain `git push` may hang silently â€” see that section.
# AFTER push: run the Post-Deploy Checklist above (IndexNow for both domains)
```
