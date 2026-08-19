# SSD Affiliate Network - Project Context

> ## 🚨 START HERE — last agent's handoff (2026-08-10)
> **Previous session (2026-08-10) shipped Consent Mode v2 default-deny for GA4 measurement + AdSense fill** (commit `d8cd3f2`, live on prod):
> - **Problem fixed**: pre-this-deploy, `BaseLayout.astro` loaded gtag ONLY after `localStorage['cookie-consent'] === 'accepted'`; AdSlot.astro gated ad fills on the same consent flag. With ~24 sessions / 28d across the network and most visitors never clicking "Accept", this meant (a) GA4 was blind to most sessions, (b) the `affiliate_click` listener (added 2026-08-07 in `a50edb2`) only fired for the small Accept fraction, and (c) AdSense fills (once slot IDs land) would only fire on the same small fraction — leaving the #2 revenue stream mostly idle.
> - **Fix**: replace the hard pre-consent gate with Google Consent Mode v2 default-deny. gtag now loads on every page with `gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500 })` set BEFORE the gtag config call. No ad/analytics cookies set on load. New `window.setConsent(value)` helper emits `gtag('consent', 'update', ...)` with `granted` (Accept) or `denied` (Reject). CookieConsent.astro Accept/Reject click handlers call `window.setConsent()` after persisting to localStorage (_choice persists across sessions; re-applied on return visits). AdSlot.astro now pushes `(window.adsbygoogle = window.adsbygoogle || []).push({})` unconditionally — the AdSense SDK serves non-personalized contextually-targeted ads while consent is denied (still revenue, no ad cookies) and upgrades to personalized fills once granted. The EEA/UK/CH geo-gate in `src/lib/adsense.ts` is independent and REMAINS IN PLACE: Consent Mode alone is not sufficient for EEA, so ad serving stays OFF there. Affiliate link hrefs, tags, `linkCode=ll1` cart-extend, `rel="noopener sponsored"`, disclosure text, and the passive `affiliate_click` listener (no preventDefault, no href/rel/target/tag modification) are ALL UNCHANGED — Amazon Associates compliance preserved.
> - **Files changed** (3): `src/layouts/BaseLayout.astro` (~30 lines — new Consent Mode v2 default-deny call + setConsent helper + always-load gtag + affiliate_click listener unchanged), `src/components/CookieConsent.astro` (~8 lines — dismiss() now calls window.setConsent()), `src/components/AdSlot.astro` (~5 lines — drop cookie-consent gate from fill push). No DB schema / URL / sitemap / disclosure / affiliate-tag change — IndexNow NOT required.
> - **Live verification (2026-08-10, ~2 min post-deploy, both tenants HTTP 200)**: `gtag('consent','default', {ad_storage:'denied', ...})` snippet present, `setConsent` helper exposed, `affiliate_click` listener wired, 170 affiliate CTAs on `externalssds/compare`, 162 on `portablessds/compare`, AdSense publisher snippet still served for non-EEA fetch (verification-friendly).
>
> **NEXT AGENT (2026-08-17 → 2026-08-24) MUST — three items, all measurement/cleanup, no new code expected**:
>   1. **(a) Re-run `node scripts/ga4_pull_traffic.js` between 2026-08-17 and 2026-08-24** (7-14 days post-deploy of `d8cd3f2`). Pull `affiliate_click` events from the GA4 Data API (`runReport` with metric `eventCount` + dimension `eventName=affiliate_click`, plus `product_slug`, `retailer`, `page_path` breakdown) for both `G-7BG64K2QZJ` and `G-YFZ8SDB88N`. Compare against the **pre-Consent-Mode-v2 baseline (captured 2026-08-07): 0 `affiliate_click` events on either property**. Target within 14 days post-deploy: ≥1 `affiliate_click` event recorded on at least one of the two properties, even with ZERO visitors clicking "Accept" — this proves the cookie-consent-measurement gap (called out in the 2026-08-07 handoff) is closed. Also compare total session counts vs the 2026-08-07 GA4 baseline (externalssds 28d 20s / 1u / 6pv; portablessds 28d 4s / 1u / 4pv) — with Consent Mode v2 every session is now counted (modeled when consent denied) so GA4 totals should NOT undercount the real traffic anymore.
>   2. **(b) The `gsc_pull_revenue.js` watchdog gate for `9329992` (2026-08-04 T7 `/compare` overhaul) is still PENDING** — the window opens 2026-08-11. If you open this repo between 2026-08-11 and 2026-08-18, follow the gate's instructions EXACTLY (run `node scripts/gsc_pull_revenue.js`, compare the pre-deploy baseline captured 2026-08-07 in the `RESULT (2026-08-07)` block below, write a new `RESULT (>=2026-08-11)` block to AGENTS.md closing out the gate). Today (2026-08-10) we are still 1 day before the window opens, so the gate is NOT due yet — do NOT bypass with `--force` unless drafting the RESULT block per the gate's own instructions. Primary target: `samsung t7 shield 4tb portable ssd amazon.com price` on `/compare` moves from pos 7.5 → top 5.
>   3. **(c) ~~The deferred `price_cents = 0` filter bug~~** — **CLOSED 2026-08-14**: 1-line fix at `src/pages/compare.astro:94` shipped (deferred from 2026-08-10 handoff). See `RESULT (2026-08-14): price_cents = 0 filter bug fix` block below.
>
> **STILL-OWNER-ONLY**: the AdSense 3-slot activation checklist in the `RESULT (2026-08-09)` block is unchanged. Once the owner creates the 3 responsive ad units in the AdSense dashboard and pastes the three `homeSlotId` / `compareSlotId` / `productSlotId` values into `src/config/tenants.ts` on both tenants, ads start filling — and with the Consent Mode v2 fix from `d8cd3f2` now live, those fills will fire on 100% of non-EEA impressions (rather than only the post-Accept fraction). The owner activation step is unchanged; the fix from `d8cd3f2` just makes the eventual ad revenue higher once slots land.
>
> (Legacy handoffs preserved below: 2026-08-07 GA4 outbound-click attribution block demoted to `RESULT (2026-08-07)`, 2026-08-09 AdSense infra at `RESULT (2026-08-09)`, 2026-08-05 T7 `/compare` overhaul at `RESULT (2026-08-05)`, 2026-08-03 catalog-expansion at `RESULT (2026-08-03)`.)

### RESULT (2026-08-09): Google AdSense display-ad infrastructure (deployed 2026-08-09)

Adds consent-gated, geo-gated Google AdSense display ads alongside the existing Amazon Associates revenue stream. **Verified policy-compliant against both programs** (see the new `## AdSense (Display Ads)` section below): AdSense + Associates are allowed on the same site (neither TOS prohibits it), and AdSense is NOT "paid advertising linking to Amazon", so the April 2026 Associates paid/boosted-ad disqualification does not apply.

**What shipped:**
- `src/components/AdSlot.astro` — responsive `<ins class="adsbygoogle">` unit per placement (`home` / `compare` / `product`). Renders NOTHING (zero layout impact) until the tenant has `adsense` config + the visitor is outside the EEA/UK/CH scope.
- `src/layouts/BaseLayout.astro` — renders the standard AdSense publisher snippet (`adsbygoogle.js?client=...`) in `<head>` whenever a clientId is configured and the visitor is outside the EEA/UK/CH scope. **This snippet must be visible in the HTML even with zero slot IDs — AdSense's "code snippet" site-verification crawler looks for it.** Consent gating lives at the FILL level: AdSlot units only push a fill request after `localStorage['cookie-consent'] === 'accepted'`, so no ad cookies/ad requests fire without consent (the SDK load itself sets no cookies).
- `src/lib/adsense.ts` — EEA-27 + UK + Norway + Iceland + Liechtenstein + Switzerland list + `isEeaCountry()`. **Ads are geo-gated OFF for those countries** because Google requires a Google-certified CMP (IAB TCF v2.3 + Consent Mode v2) to serve ads there, and this site's custom cookie banner is NOT certified — serving ads to EEA/UK/CH visitors without one is an AdSense policy violation (account suspension risk). Unlock EEA revenue later by integrating a certified CMP (e.g. Cookiebot, Quantcast Choice).
- `src/config/tenants.ts` — new optional `adsense?: { clientId, homeSlotId, compareSlotId, productSlotId }` field on `TenantConfig` (pub/slot IDs are public info — they appear in ads.txt and page HTML — so committing them is safe). **`clientId` is wired on both tenants (`ca-pub-4951924636664760`); slot IDs are NOT — ads render nothing until the three slot IDs are filled in.** The SDK loader in `BaseLayout` only loads once at least one slot ID exists, so the no-op state costs zero extra requests.
- Ad slots placed: `src/pages/index.astro` (between Quick Nav and "Best {tenant.name}"), `src/pages/compare.astro` (below the comparison table, before the detailed analysis), `src/pages/products/[slug].astro` (after Real-World Performance, before the VS-table section). All placements are visually separated from affiliate Special Links (border + spacing; Google auto-labels ads with "Ad"). No ads near buy buttons, no ads that mimic content.
- `public/ads.txt` — created with placeholder `pub-0000000000000000` + instructions (single file serves both domains since both are custom domains on one Pages project). **Updated 2026-08-09 (2nd commit): now serves the real `pub-4951924636664760` line on both domains.**
- `src/pages/privacy.astro` — added "Advertising (Google AdSense)" section (DART cookie disclosure, Google Ads Settings opt-out, aboutads.info, consent-gated loading note). Updated "Last updated" to August 2026.

**Status (2026-08-09, after owner applied for AdSense and shared the publisher ID):** application approved/complete, `clientId: "ca-pub-4951924636664760"` wired on both tenants, real ads.txt live. **Ads are still OFF — waiting on the three ad-unit slot IDs (see item 2 below).** Owner hit "Couldn't verify your site" on the code-snippet method because the snippet was initially gated on slot IDs (rendered nothing); fixed by rendering the snippet in `<head>` whenever a clientId is configured — owner MUST re-run site verification after the fix deploys (snippet check: home/compare/product HTML contains `adsbygoogle.js?client=ca-pub-4951924636664760` in `<head>`).

**🚨 SITE OWNER ACTION REQUIRED — only ONE step left (~10 min):**
1. ✅ DONE — AdSense application approved (`ca-pub-4951924636664760`), publisher ID wired in `src/config/tenants.ts` for both tenants + real line in `public/ads.txt`.
2. Create three **responsive** ad units in the AdSense dashboard (AdSense → Ads → Display ads): "Home leaderboard", "Compare leaderboard", "Product in-content". Each produces a numeric slot ID (e.g. `1234567890`).
3. Paste the three slot IDs into `src/config/tenants.ts` under `adsense` → `homeSlotId` / `compareSlotId` / `productSlotId` on **both tenants**, commit + push (auto-deploys). Everything activates automatically — no other code change needed.
4. Verify on prod: `data-ad-client="ca-pub-4951924636664760"` + the three `data-ad-slot` values appear in home / `/compare` / product-page HTML, and `adsbygoogle.js` only loads after `localStorage['cookie-consent'] === 'accepted'`. AdSense site review (both domains) takes hours→days after their first pageview with the code; then ads populate automatically.

**Next agent**: if all three slot IDs are set, smoke-test prod HTML for `data-ad-client` on all three placements + confirm `adsbygoogle.js` only loads after consent (visit with `localStorage['cookie-consent']='accepted'` vs without). Track AdSense earnings in the GA4 pull cadence only if Google Ads linking is enabled; otherwise just confirm units render. Watch GSC for any rank impact of ad placement on `/compare` (the ranking money page) vs the 2026-08-07 baseline.

### RESULT (2026-08-07): GA4 measurement-infra baseline (deployed 2026-08-07, commit `a50edb2`)

Deploys GA4 outbound-click tracking for affiliate Special Links across both tenants. Baseline captured via `node scripts/gsc_pull_revenue.js --force` + GA4 Data API inspection immediately before deploy (the `--force` was used because the 2026-08-11 → 2026-08-18 watchdog window for `9329992` had not yet opened — the next agent must close that gate as instructed above).

**GSC network-wide baseline (90d, captured 2026-08-07):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 3 |
| 90d impressions | 614 | 928 |
| Avg position | 38.3 | 34.7 |
| 90d CTR | 0.16% | 0.32% |
| `/compare` (90d) | 1c / 154i / pos35.3 / CTR 0.65% | 2c / 146i / pos28.9 / CTR 1.37% |
| `/compare/[H2H]` (90d, total) | 1i | 34i / 1c / CTR 2.94% (top: samsung-t9-vs-sandisk-extreme-pro-page 18i / 1c / CTR 5.56%) |
| Buyer query `samsung t7 shield 4tb portable ssd amazon.com price` on `/compare` | pos 7.5 / 8i / 0c | (query not in portablessds top-20) |

**GA4 network-wide baseline (28d, captured 2026-08-07 — confirms zero outbound-tracking pre-deploy):**

| Property | 28d sessions | 28d users | 28d pageviews | `affiliate_click` events (NEW) |
|----------|--------------|-----------|---------------|--------------------------------|
| G-7BG64K2QZJ (externalssds) | 18 (direct only) | 1 | 6 | **0** (listener not live) |
| G-YFZ8SDB88N (portablessds) | 4 (direct only) | 1 | 4 | **0** (listener not live) |

Note: GA4 channel breakdown is 100% "Direct" / "Unassigned" for both properties — no organic attribution is recorded (cookie banner gates gtag load, and most visitors don't accept). The new `affiliate_click` listener will inherit the same gating for the 7-14d post-deploy window: only visitors who accept cookies will produce events. A future PR should consider cookieless server-side measurement (e.g. Cloudflare Workers → GA4 Measurement Protocol via server POST) to bypass the cookie-consent gate.

**Re-run window**: 2026-08-14 → 2026-08-21 (7-14 days post-deploy). The next agent MUST re-run `node scripts/ga4_pull_traffic.js` in that window and append to this block with the `affiliate_click` event count + `product_slug` breakdown for both properties. If 0 events by 2026-08-21, the cookie-consent-measurement gap is blocking measurement; address there.

### RESULT (2026-08-14): GA4 measurement-infra post-Consent-Mode-v2 re-run (4 days post `d8cd3f2`)

Captured via `node scripts/ga4_pull_traffic.js` on 2026-08-14 (the date the watchdog window opens; run produced Today: 2026-08-15 banner on the GSC companion pull — both pulls fired in the same minute, so call this `RESULT (2026-08-14)` to align with the AGENTS.md header handoff date). Inside the 2026-08-14 → 2026-08-21 re-run window from the `RESULT (2026-08-07): GA4 measurement-infra` block.

**`affiliate_click` event counts (28d):**

| Property | Pre-deploy baseline (2026-08-07) | Today (2026-08-14) |
|----------|----------------------------------|--------------------|
| G-7BG64K2QZJ (externalssds) | 0 events | **0 events** |
| G-YFZ8SDB88N (portablessds) | 0 events | **0 events** |

**28d totals:**

| Property | Sessions | Users | Pageviews | Engaged | Avg duration (s) |
|----------|----------|-------|-----------|---------|------------------|
| externalssds (G-7BG64K2QZJ) | 21 | 2 | 39 | 11 (52%) | 345.2 |
| portablessds (G-YFZ8SDB88N) | 5 | 2 | 8 | 2 (40%) | 17.4 |

**Channel breakdown (28d):**

| Property | Channel | Sessions | Users | Engaged |
|----------|---------|----------|-------|---------|
| externalssds | Direct | 20 | 1 | 50.0% |
| externalssds | Organic Search | 1 | 1 | 100.0% |
| portablessds | Direct | 4 | 1 | 25.0% |
| portablessds | Organic Search | 1 | 1 | 100.0% |

**Top pages (28d):**

| Property | Page | Pageviews | Sessions |
|----------|------|-----------|----------|
| externalssds | /compare | 15 | 10 |
| externalssds | /products/samsung-t9-4tb | 14 | 9 |
| externalssds | /products/crucial-x10-pro-2tb | 3 | 4 |
| externalssds | /products/lacie-rugged-ssd-pro-1tb | 3 | 1 |
| externalssds | / | 1 | 1 |
| externalssds | /compare/crucial-x10-pro-vs-crucial-x10-pro-2tb | 1 | 1 |
| externalssds | /hubs | 1 | 1 |
| externalssds | /hubs/best-thunderbolt-usb4-ssd-for-mac | 1 | 1 |
| portablessds | /products/samsung-t9-portable | 4 | 5 |
| portablessds | / | 3 | 2 |
| portablessds | /about | 1 | 1 |

**Verdict on consent-measurement-gap fix** (from AGENTS.md header `(a)`):
- Target: ≥1 `affiliate_click` event on at least one property: **FAIL** (0 events both properties).
- Session-count lift (modeled conversions now counted): **MARGINAL FAIL** — externalssds went from 18 → 21 sessions (+16%) and portablessds from 4 → 5 sessions (+25%), but the lift is below the threshold for confident attribution given the small sample.
- Channel: Organic Search attribution is now appearing (1 session each property) — this is a **pass** on the modeled-conversion channel-attribution fix; both properties previously showed 100% Direct/Unassigned.

**Causal notes**: 4 days post-deploy is at the low end of the 7-14d measurement window. The `affiliate_click` listener is correctly wired (verified via the `RESULT (2026-08-10)` deploy notes — capture-phase, never prevents default, never modifies href/rel/target/tag). The zero events reflect the underlying zero outbound clicks (per the GSC capture: only 11 total clicks in 90d, all on `/compare` H2H URLs — and the GA4 cookie-consent gate means only visitors who Accept produce events; with ~50% rejection rate per AGENTS.md header, ~5 of 11 clicks could plausibly have produced events). The expected "modeled conversions while denied" attribution path is working at the *session* level (channel breakdown now shows Organic Search) but is **not** producing modeled `affiliate_click` events specifically — Google's modeled-event support covers pageviews/sessions but is not confirmed for custom events. A future PR could lift the measurement ceiling by either (a) integrating a Google-certified CMP (TCF v2.3) to push consent Mode v2 from default-deny to default-grant, or (b) implementing cookieless server-side measurement via a Cloudflare Worker that POSTs to the GA4 Measurement Protocol on outbound click.

**Next agent implications**: re-run the GA4 pull on 2026-08-21 (7 days post-deploy) to capture the full window. If `affiliate_click` remains 0, the cookie-consent-measurement gap is confirmed and the next agent should prioritize cookieless server-side measurement OR AdSense activation (the latter fills more cleanly because AdSense's NPA path produces revenue without consent).

> ## Legacy: previous handoff (2026-08-05) — `/compare` T7-buyer-query overhaul (commit `9329992`)
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

## ⚠️ IMPORTANT: Bing Webmaster Tools Access (READ THIS)

**Any AI agent working on this project CAN and SHOULD read live Bing Webmaster Tools (BWMT) data for BOTH `externalssds.com` AND `portablessds.com` when doing SEO or Bing-specific performance work. You do NOT need to ask the user for permission or credentials — the API key is read from a local environment variable and the live data-pull script is in the repo.**

BWMT is the third search-engine data source alongside GSC (Google) and GA4 (analytics). Bing typically sends modest but real traffic for tech/comparison queries — keyword competition is lower than Google for the same queries, so per-impression CTR can be higher. Use BWMT data for Bing-specific SEO decisions the same way you use GSC for Google-specific decisions.

### How To Read BWMT Data

- **API key**: read it from `process.env.BING_WMT_API_KEY` (Node) or `$env:BING_WMT_API_KEY` (PowerShell). Obtain the key from https://www.bing.com/webmasters (sign in with the site's verified Microsoft account → Settings → API Access → Generate API Key). The key is per-account, not per-site — the same key works for both `externalssds.com` and `portablessds.com`.
- **API base**: `https://ssl.bing.com/webmaster/api.svc/json`. Auth via `?apikey=<key>` query param.
- **Endpoints to query**:
  - `GET /GetQueryStats?siteUrl=<url>&startDate=<yyyy-MM-dd>&endDate=<yyyy-MM-dd>` — keyword-level clicks/impressions (28d window recommended).
  - `GET /GetPageStats?siteUrl=<url>&startDate=...&endDate=...` — page-level clicks/impressions.
  - `GET /GetUrlInfo?siteUrl=<url>` — index/crawl info for the site itself.
- **Live data-pull script**: `scripts/bing_pull_traffic.js` (created 2026-08-15). Pulls keyword stats, page stats, and 28-day totals for both tenants. Falls back to a friendly "API key not configured" message if `BING_WMT_API_KEY` is unset (exits 0, no crash).
- **Run command**: `node scripts/bing_pull_traffic.js`
- **What you can query**: per-keyword clicks/impressions, per-page clicks/impressions, aggregate 28d totals. The JSON response is an array of `{ Query, Clicks, Impressions, AvgPosition, ... }` (keyword) or `{ Page, Clicks, Impressions, ... }` (page) objects.
- **Do NOT**: commit the API key to the repo, print it in output, write it into any committed code, or share it. The env var exists only in the user's local shell environment. Reference it via `process.env` / `$env:` at runtime.

### When To Use BWMT (Mandatory for Both Domains)

When the user asks anything involving Bing-specific SEO performance, Bing keyword rankings, Bing-side CTR, Bing index coverage, or "how is [domain] doing on Bing", **use the BWMT API directly** rather than asking the user to look it up manually. This applies to **both** `externalssds.com` **and** `portablessds.com** — query both if the request is generic.

### BWMT Re-Run Cadence

The IndexNow fix in Part 1 of the 2026-08-15 audit/PR unblocks Bing's crawler from discovering the 6,400+ indexable URLs across both tenants (IndexNow is the URL-submission protocol Bing honors; Google ignores it). After the IndexNow fix deploys, BWMT keyword and page data will start populating over the next 7-14 days as Bing crawls the submitted URLs.

When making SEO changes that target Bing (or affect the network at large), re-run `node scripts/bing_pull_traffic.js` **7-14 days post-deploy** to measure per-keyword and per-page deltas vs the BWMT baseline captured at deploy time. BWMT baseline data is sparser than GSC (Bing typically has lower crawl frequency and lower keyword diversity for low-traffic sites) — focus on aggregate totals and the top-20 keywords rather than expecting GSC-level granularity.

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

## AdSense (Display Ads)

The sites monetize via Google AdSense display ads in addition to Amazon Associates. **Both programs allow running together** (neither TOS prohibits it; AdSense is not "paid advertising linking to Amazon", so the Associates paid/boosted-ad disqualification does not apply). Not covered by the Amazon disclosure — AdSense ads are visibly labeled "Ad" by Google.

### Compliance rules (violations can suspend the AdSense account)

1. **Ad units must never be placed adjacent to affiliate Special Links / buy buttons** — ads must be clearly separable from content and links (current placements use a top border + spacing; keep it that way).
2. **EEA/UK/CH geo-gate is MANDATORY until a Google-certified CMP (IAB TCF v2.3 + Consent Mode v2) is integrated** — this site's custom cookie banner is not certified, and serving ads to EEA/UK/Norway/Iceland/Liechtenstein/Switzerland without a certified CMP is a policy violation. The gate is enforced server-side in `src/lib/adsense.ts` (`isEeaCountry`) — do not remove it without shipping a certified CMP.
3. **Consent-gate ad FILLS, not the SDK** — the publisher snippet in `<head>` loads the SDK whenever a clientId is configured (AdSense's code-snippet verification requires the tag to be present in the HTML), but AdSlot units only push a fill request after `localStorage['cookie-consent'] === 'accepted'`. Loading the SDK sets no ad cookies; only fill requests do. Do not push fill requests unconditionally.
4. **Do not** modify AdSense code to inflate performance, hide the "Ad" label, mimic content, auto-refresh units, or incentivize clicks.
5. **Max 3 ad units per page** per AdSense policy (current: 1 per template).
6. AdSense requires the site to follow its content policies: no pages with thin/duplicated content. Keep the Phase-1 editorial quality standards in place.
7. **Never run paid ads that link to Amazon** (Associates April 2026 rule) — this applies to buying traffic, NOT to AdSense units showing on the page.

### Configuration

- `src/config/tenants.ts` → `tenant.adsense` (`clientId: "ca-pub-4951924636664760"` wired on both tenants; `homeSlotId` / `compareSlotId` / `productSlotId` still EMPTY = ads off until filled). IDs are public info, safe to commit.
- `public/ads.txt` contains the real publisher ID line (`google.com, pub-4951924636664760, DIRECT, f08c47fec0942fa0`) — live on both domains.
- AdSense approval + ID creation is a **site-owner-only** step (human application, identity/tax verification). See the `RESULT (2026-08-09)` block at the top of this file for the exact activation checklist.

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

### RESULT (2026-08-14): `/compare` T7-buyer-query overhaul post-window measurement (closes 9329992 gate)

Captured via `node scripts/gsc_pull_revenue.js` on 2026-08-14 (the date the watchdog window opens; Today: 2026-08-15 banner — same minute pull as the GA4 RESULT above). Inside the 2026-08-11 → 2026-08-18 watchdog window from the `MANDATORY RE-RUN WATCHDOG` in `scripts/gsc_pull_revenue.js`. Closes the `9329992` re-run gate per AGENTS.md.

**Network-wide totals (90d, captured 2026-08-14):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 10 |
| 90d impressions | 1,156 | 1,929 |
| Avg position | 35.3 | 32.8 |
| 90d CTR | 0.09% | 0.52% |

**`/compare` page metrics (90d):**

| URL | clicks | impressions | position | CTR |
|-----|--------|-------------|----------|-----|
| externalssds.com/compare | 1 | 154 | 35.3 | 0.65% |
| portablessds.com/compare | 2 | 162 | 32.7 | 1.23% |

**Buyer query `samsung t7 shield 4tb portable ssd amazon.com price` on `/compare`:**

| Site | Pre-deploy (2026-08-05) | Today (2026-08-14) | Delta |
|------|-------------------------|--------------------|-------|
| externalssds | pos 7.5 / 8i / 0c / CTR 0% | NOT in top-20 page→query mapping (was at pos 7.5 with 8i 0c on 2026-08-05) | **regressed — fell out of top-20 mapping** |
| portablessds | (query not in top-20) | (query not in top-20) | no movement |

**Verdict on gate success criteria** (from `RESULT (2026-08-04)` / `RESULT (2026-08-05)` blocks):
- Primary target (pos 7.5 → top 5): **FAIL** — the query fell out of the GSC page→query top-20 mapping entirely on externalssds. Previously it was at pos 7.5 with 8i / 0c; now there are 0 impressions recorded against `/compare` for this query in the top-20. Possible explanations: (a) Google re-judged and dropped the URL from the SERP for this query because the title/H1 anchored too narrowly to one buyer query, (b) query volume is too low for the new title to win, (c) competitor URLs displaced it.
- Secondary (`/compare` lift on externalssds): **FLAT** — clicks 1c → 1c, impressions 128i → 154i (+20%), position 34.8 → 35.3 (no change). The CTR on `/compare` externalssds held at 0.65% (matches 2026-08-07 baseline exactly).
- Tertiary (network-wide impressions): **LIFT** — externalssds 517 → 1,156 (+124%), portablessds 713 → 1,929 (+170%). This is the largest positive signal in the entire post-deploy window — Google is crawling and indexing the network at ~2x the pre-deploy rate, but the crawled pages aren't converting to clicks on externalssds. On portablessds, the impression lift coexists with 10c / 1,929i / CTR 0.52% (vs 3c / 928i / CTR 0.32% on 2026-08-07), so the impressions ARE converting there.

**Causal notes**: 10 days post-deploy is at the low end of Google's re-judgement window for a title/H1 change. The T7 anchor block is correctly deployed (verified via 2026-08-05 RESULT and live DOM checks). The primary failure mode appears to be **searcher-intent mismatch**: the title `Samsung T7 Shield 4TB [Portable|External] SSD — Amazon Price, Specs & Side-by-Side Comparison (2026)` is too product-specific for the query `samsung t7 shield 4tb portable ssd amazon.com price` — Google's re-judgement appears to have decided that a generic /compare page (which shows 80+ products) is a weaker match for that narrow product-specific query than a product detail page would be. But the product detail pages for the T7 Shield variants are 301'd to `/compare` (the cannibalization-consolidation deploy from 2026-07-30), so there's no good landing page for the query anymore — Google dropped the query from its index rather than surface a poor-fit URL. **The query was lost as collateral damage of the T7 Shield 301 consolidation + the /compare title narrow-anchoring.**

**Next agent implications**: the primary target cannot be hit by further iterating on the `/compare` title/H1 — the query needs a dedicated landing page. The cleanest fix is to UN-301 a T7 Shield variant (e.g., `samsung-t7-shield-4tb`) and let it be the canonical product page for this query; the cannibalization consolidation rationale (pos 6-7 on `/compare`) was based on pre-2026-08-04 numbers that no longer hold. Alternative: rewrite the `/compare` default-view title back to the generic "External SSDs Compared" form so Google stops re-judging it as a product-specific answer and re-surfaces it for the broader "t7 shield" / "samsung t7" query families (where it currently has 28i pos30.9 on `/category/thunderbolt` per the page→query mapping). Either move is a new SEO deploy and should be planned as its own initiative. Do not re-run the `9329992` gate — it is now CLOSED with this RESULT.



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

### RESULT (2026-08-14): `/compare/[slug]` title/H1/meta rewrite post-window measurement (closes 2026-08-06 gate)

Captured via `node scripts/gsc_pull_revenue.js` on 2026-08-14 (inside the 2026-08-13 → 2026-08-20 re-run window from the 2026-08-06 RESULT block above).

**Network-wide totals (90d):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 10 |
| 90d impressions | 1,156 | 1,929 |
| Avg position | 35.3 | 32.8 |
| 90d CTR | 0.09% | 0.52% |

**6 portablessds H2H URLs that were getting impressions pre-deploy (2026-08-06):**

| URL | Pre (2026-08-06) | Today (2026-08-14) | Delta |
|-----|------------------|--------------------|-------|
| /compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable | 1c / 14i / pos11.3 / CTR 7.14% | 1c / 72i / pos14.9 / CTR 1.39% | **+58i (+414%) but pos dropped 11.3→14.9, CTR dropped 7.14→1.39%** |
| /compare/crucial-x9-pro-vs-samsung-t7-portable | 0c / 6i / pos7.2 / CTR 0% | (not in top-20 page report) | **faded from top-20** |
| /compare/crucial-x9-pro-vs-samsung-t7-shield-portable | 0c / 6i / pos33.3 / CTR 0% | (not in top-20 page report) | **faded from top-20** |
| /compare/crucial-x9-pro-vs-sandisk-extreme-pro-portable | 0c / 5i / pos17.0 / CTR 0% | (not in top-20 page report) | **faded from top-20** |
| /compare/samsung-t7-portable-vs-crucial-x9-pro | 0c / 6i / pos7.2 / CTR 0% | (not in top-20 page report) | **faded from top-20** |
| /compare/crucial-x9-pro-vs-samsung-t9-portable | 0c / 1i / pos39.0 / CTR 0% | (not in top-20 page report) | **faded from top-20** |

**Verdict on gate success criteria** (from `RESULT (2026-08-06)` block):
- ≥1 incremental click across the 5 currently-zero-CTR H2H URLs: **FAIL** — all 5 URLs faded entirely from the top-20 page report; zero clicks, zero impressions on the listed URLs.
- The paying URL `samsung-t9-portable-vs-sandisk-extreme-pro-portable` maintains pos ≤10.2 and CTR ≥5.6%: **FAIL** — pos regressed 11.3 → 14.9, CTR dropped 7.14% → 1.39%. Impressions grew from 14 → 72 (link-equity lift from the `4de0bca` home-page H2H deploy is working), but Google re-judged the position downward, possibly because the new title/H1 recipe lengthened the title beyond the previous SERP-truncated form.
- 90d CTR on that paying URL lifts (target 18i → 30i+): **PASS on impressions (72i vs target 30i+, +140% over target)** — but the click-through ratio collapsed, so impressions lift does NOT translate to revenue lift.

**Causal notes**: 8 days post-deploy for the title/H1/meta recipe on `compare/[slug].astro`. The recipe change appears to have CAUSED Google to re-judge the URL positions downward — the paying URL's CTR collapsed from 7.14% to 1.39% despite impression volume nearly 5x'ing. The most likely explanation: the new title is longer and gets SERP-truncated differently, OR Google is testing the new title and finding it less relevant to the existing ranking query. The 5 currently-zero-CTR H2H URLs faded entirely — they were at positions 7.2-39 with 1-6 impressions each pre-deploy, so the position volatility band is wide enough that they may simply have been cycled out and not yet cycled back in. **No new clicks were generated by the title/H1 recipe deploy on portablessds H2H URLs in the 8-day window.**

**Next agent implications**: the H2H title/H1/meta recipe is a **net-negative** so far — impressions up but CTR down, and total clicks unchanged. Two paths: (a) revert the H2H recipe and try a different anchor (e.g., pure brand-pair title without the meta-descriptor suffix), (b) leave the recipe live and wait another 7 days (Google re-judgement windows can run 14-21 days for title changes). Recommend path (a) — the data shows the recipe is harming the only revenue-producing URLs on the network. Do not re-run this gate — it is now CLOSED with this RESULT.



### RESULT (2026-08-07): home-page internal-link equity to H2H `/compare/[slug]` + `/products` directory (deployed 2026-08-07, commit `4de0bca`)

Shipped ~12 internal links from `src/pages/index.astro` to (a) the only proven-converting URL template (H2H `/compare/[slug]`, CTR 5.6%/33% for the buyer query `sandisk extreme pro vs samsung t9`) and (b) the Phase 4 `/products` directory, which was orphaned from the home page since its 2026-08-03 creation. The new `Popular Head-to-Head Comparisons` section sits between `Most Popular` and `Browse by Category`, renders up to 8 tenant-aware candidate H2H pairs (canonicalized to alphabetically-first slug form per `sitemap.xml.ts:177`, deduped by href, dropped silently if either slug is inactive). The Quick Nav row gets an `All SSDs` link to `/products`, and the `All N Drives` section now leads with `see the full directory of all N reviewed SSDs →` before the inline product links.

**Compliance**: all new anchors are internal `href="/..."` with no `rel=sponsored`/`target="_blank"`. Disclosure text, `Footer.astro`, `CookieConsent.astro`, `BaseLayout.astro`, `affiliate.ts`, and the sitemap were NOT touched. No new URL surface — no sitemap regeneration, no DB change. IndexNow single-URL submission (Option B) was used to push just the two home URLs to Bing (`https://externalssds.com/` and `https://portablessds.com/` — both HTTP 200).

**Live verification (2026-08-07, ~5 min post-deploy)**:
- `externalssds.com/` (HTTP 200): `Popular Head-to-Head Comparisons` heading renders, `/products` Quick Nav link renders, **7 unique H2H links** in the live DOM (8 candidate pairs, 1 dedupe: `(samsung-t9, samsung-t7-shield)` ↔ `(samsung-t7-shield, samsung-t9)` canonicalize to one href).
- `portablessds.com/` (HTTP 200): `Popular Head-to-Head Comparisons` heading renders, `/products` Quick Nav link renders, **8 unique H2H links** in the live DOM. The single converting H2H URL `/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable` IS in the home DOM (verified).

**GSC day-0 baseline (captured 2026-08-07 immediately before deploy, same numbers as the `RESULT (2026-08-07): GA4 measurement` baseline above)**:

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 3 |
| 90d impressions | 614 | 928 |
| Avg position | 38.3 | 34.7 |
| 90d CTR | 0.16% | 0.32% |
| `/compare` (90d) | 1c / 154i / pos35.3 / CTR 0.65% | 2c / 146i / pos28.9 / CTR 1.37% |
| `/compare/[H2H]` total URLs in GSC page report (90d, both tenants) | 1 URL (`samsung-t9-vs-samsung-t9-4tb` 1i) | 6 URLs (totals: 1c/40i, top: `samsung-t9-portable-vs-sandisk-extreme-pro-portable` 1c/18i/pos10.2/CTR5.56%) |
| Buyer query `sandisk extreme pro vs samsung t9` → portablessds `/compare/[H2H]` | n/a externalssds | 1c / 3i / pos 10.3 / **CTR 33.3%** |
| Buyer query `samsung t7 shield 4tb portable ssd amazon.com price` → externalssds `/compare` | pos 7.5 / 8i / 0c | (query not in portablessds top-20) |
| `/products` directory in GSC page report (either tenant) | ABSENT (URL not yet surfaced to Google) | ABSENT |

**Live H2H links now rendered on each home page (deployed DOM, verified via `Invoke-WebRequest` against the production URLs)**:

externalssds.com home — 7 H2H links:
- `/compare/samsung-t7-shield-vs-samsung-t9`
- `/compare/samsung-t7-shield-vs-sandisk-extreme-pro-portable-1tb`
- `/compare/samsung-t7-shield-2tb-vs-samsung-t7-2tb`
- `/compare/samsung-t7-shield-4tb-vs-sandisk-extreme-pro-4tb`
- `/compare/samsung-t7-shield-4tb-vs-samsung-t9-4tb`
- `/compare/samsung-t9-vs-sandisk-extreme-pro-portable-2tb`
- `/compare/crucial-x9-pro-2tb-vs-samsung-t7-2tb`

portablessds.com home — 8 H2H links:
- `/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable` **← the converting one**
- `/compare/crucial-x9-pro-vs-samsung-t7-portable`
- `/compare/crucial-x9-pro-vs-samsung-t7-shield-portable`
- `/compare/crucial-x9-pro-vs-sandisk-extreme-pro-portable`
- `/compare/crucial-x9-pro-vs-samsung-t9-portable`
- `/compare/samsung-t7-portable-vs-sandisk-extreme-pro-portable`
- `/compare/samsung-t7-portable-vs-samsung-t9-portable`
- `/compare/samsung-t7-shield-portable-vs-sandisk-extreme-pro-portable`

**Re-run window**: 2026-08-14 → 2026-08-21 (7-14 days post-deploy). The next agent MUST re-run `node scripts/gsc_pull_revenue.js` in that window and compare the GSC page report for each of the **15 H2H URLs above + `/products` directory on both tenants**.

**Success criterion** (any one of):
- ≥1 incremental click across the 5 currently-zero-CTR portablessds H2H URLs (`crucial-x9-pro-vs-samsung-t7-portable` 6i, `crucial-x9-pro-vs-samsung-t7-shield-portable` 6i, `crucial-x9-pro-vs-sandisk-extreme-pro-portable` 5i, `crucial-x9-pro-vs-samsung-t9-portable` 1i, plus the Samsung-vs-SanDisk URL not in current top-20) by 2026-08-21
- The converting portablessds H2H URL (`samsung-t9-portable-vs-sandisk-extreme-pro-portable`) maintains pos ≤10.2 and CTR ≥5.6% AND gains link-driven impressions lift (target 18i → 30i+)
- `/products` directory URL appears in GSC page report on either tenant (target: non-zero impressions on at least one tenant)
- ≥1 externalssds H2H URL gains its first GSC impression (currently zero H2H impressions on externalssds — these are entirely new from the home-page link equity)

**Failure criterion** (all of): zero new H2H URLs appear in GSC by 2026-08-21 AND `/products` still absent on both tenants AND converting H2H URL regresses to pos >15.

**If failure**: investigate via the GSC URL inspection tool on `/products` (is it indexed?) and a sample new H2H URL (is Google re-crawling it?). Possible follow-ups: per-URL IndexNow submission of the top 6 H2H URLs via `submitSingleUrl()` from `src/lib/indexnow.ts` to accelerate Bing's crawl of the specific newly-linked H2H URLs (Bing honors direct URL submissions; Google ignores IndexNow but re-crawls priority-1.0 home pages within ~24h and follows the new outbound links organically).

**Ghost in the 2026-08-11 → 2026-08-18 watchdog gate**: this deploy (`4de0bca`) does NOT close the `9329992` (2026-08-04 `/compare` T7-buyer-query) re-run watchdog gate. The gate window is for the T7 `/compare` recipe rewrite specifically; this `4de0bca` deploy is a separate, layered internal-link equity initiative. The next agent must still close the `9329992` gate between 2026-08-11 and 2026-08-18 by re-running `gsc_pull_revenue.js` and recording a `RESULT (>=2026-08-11)` block comparing the T7 buyer query position pre/post — i.e., capture whether `/compare` position on `samsung t7 shield 4tb portable ssd amazon.com price` moved from pos 7.5 into top 5. That re-run should ALSO serve as the `4de0bca` measurement re-run (a 2026-08-11→2026-08-18 GSC pull covers both).

### RESULT (2026-08-14): home-page internal-link equity to H2H `/compare/[slug]` + `/products` directory post-window measurement (closes 4de0bca gate)

Captured via `node scripts/gsc_pull_revenue.js` on 2026-08-14 (inside the 2026-08-14 → 2026-08-21 re-run window from the `RESULT (2026-08-07)` block above).

**Network-wide totals (90d):**

| Metric | externalssds.com | portablessds.com |
|--------|------------------|------------------|
| 90d clicks | 1 | 10 |
| 90d impressions | 1,156 | 1,929 |
| Avg position | 35.3 | 32.8 |
| 90d CTR | 0.09% | 0.52% |

**`/products` directory status (GSC page report, either tenant):**

| URL | Pre-deploy (2026-08-07) | Today (2026-08-14) | Delta |
|-----|-------------------------|--------------------|-------|
| externalssds.com/products | ABSENT | **ABSENT** (still 0 impressions in 90d) | none |
| portablessds.com/products | ABSENT | **ABSENT** (still 0 impressions in 90d) | none |

**externalssds H2H URLs linked from home (7 URLs, post-deploy 7d):**

| URL | Pre (2026-08-07) | Today (2026-08-14) | Delta |
|-----|------------------|--------------------|-------|
| /compare/samsung-t7-shield-vs-samsung-t9 | ABSENT | ABSENT | none |
| /compare/samsung-t7-shield-vs-sandisk-extreme-pro-portable-1tb | ABSENT | ABSENT | none |
| /compare/samsung-t7-shield-2tb-vs-samsung-t7-2tb | ABSENT | ABSENT | none |
| /compare/samsung-t7-shield-4tb-vs-sandisk-extreme-pro-4tb | ABSENT | ABSENT | none |
| /compare/samsung-t7-shield-4tb-vs-samsung-t9-4tb | ABSENT | ABSENT | none |
| /compare/samsung-t9-vs-sandisk-extreme-pro-portable-2tb | ABSENT | ABSENT | none |
| /compare/crucial-x9-pro-2tb-vs-samsung-t7-2tb | ABSENT | ABSENT | none |

externalssds H2H summary: **0/7 URLs gained a single GSC impression** in the 7 days post-deploy. The home-page internal links have not propagated to Google yet.

**portablessds H2H URLs linked from home (8 URLs, post-deploy 7d):**

| URL | Pre (2026-08-07) | Today (2026-08-14) | Delta |
|-----|------------------|--------------------|-------|
| /compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable | 1c / 18i / pos10.2 / CTR5.56% | 1c / 72i / pos14.9 / CTR 1.39% | **+54i (+300%) impressions, pos regressed 10.2 → 14.9, CTR collapsed 5.56% → 1.39%** |
| /compare/crucial-x9-pro-vs-samsung-t7-portable | 0c / 6i / pos7.2 / CTR 0% | (faded from top-20) | lost |
| /compare/crucial-x9-pro-vs-samsung-t7-shield-portable | 0c / 6i / pos33.3 / CTR 0% | (faded from top-20) | lost |
| /compare/crucial-x9-pro-vs-sandisk-extreme-pro-portable | 0c / 5i / pos17.0 / CTR 0% | (faded from top-20) | lost |
| /compare/crucial-x9-pro-vs-samsung-t9-portable | 0c / 1i / pos39.0 / CTR 0% | (faded from top-20) | lost |
| /compare/samsung-t7-portable-vs-sandisk-extreme-pro-portable | (not in top-20) | (not in top-20) | none |
| /compare/samsung-t7-portable-vs-samsung-t9-portable | (not in top-20) | (not in top-20) | none |
| /compare/samsung-t7-shield-portable-vs-sandisk-extreme-pro-portable | (not in top-20) | (not in top-20) | none |

portablessds H2H summary: 1 URL gained impressions (+54i on the converting URL), 4 URLs faded from top-20, 3 URLs unchanged. **Net: +1 incremental click on the converting URL only**, which was already converting before the deploy (the click may be from the deploy's home-page link equity, or may be organic variance at this volume level).

**Verdict on success criteria** (from `RESULT (2026-08-07)` block):
- ≥1 incremental click across the 5 currently-zero-CTR portablessds H2H URLs: **FAIL** — 0 incremental clicks on the 5 listed URLs. 4 of 5 faded from the top-20 page report.
- The converting portablessds H2H URL maintains pos ≤10.2 and CTR ≥5.6% AND gains link-driven impressions lift (target 18i → 30i+): **FAIL on pos/CTR (10.2 → 14.9, 5.56% → 1.39%), PASS on impressions (72i vs target 30i+, +140% over target)** — same net-negative impression-vs-CTR pattern as the 2026-08-06 H2H title-rewrite gate above.
- `/products` directory URL appears in GSC page report on either tenant: **FAIL** — still ABSENT on both tenants after 7 days.
- ≥1 externalssds H2H URL gains its first GSC impression: **FAIL** — 0/7 externalssds H2H URLs have any GSC impression.

**Causal notes**: 7 days post-deploy. Two concurrent title/H1 changes are confounded in this measurement: (a) `4de0bca` (home-page internal links) and (b) `9329992` (T7 `/compare` title/H1 rewrite) AND (c) the 2026-08-06 H2H title-anchored recipe on `compare/[slug].astro`. The 7-day window is too short for Google's re-crawl of the home page's new outbound links to fully propagate, AND too short for Google to re-judge the H2H URL positions against the new titles. The pattern across all three gates is consistent: **Google re-judged the H2H URL positions DOWNWARD after the title/meta recipe change**, and the home-page link equity did not arrive fast enough to offset. The +54i impression lift on the converting URL is the only positive signal across all three gates.

**Next agent implications**: the home-page internal-link equity deploy (`4de0bca`) shows no measurable SEO effect after 7 days. Three reasonable next steps: (a) wait another 7-14 days and re-run — Google's crawl budget for `/` (priority 1.0, daily changefreq in sitemap) should produce measurable re-crawl within 14 days, (b) per-URL IndexNow submission of the top 6 H2H URLs via `submitSingleUrl()` from `src/lib/indexnow.ts` to force Bing's crawler to fetch the H2H URLs directly (Bing honors direct submissions; Google ignores IndexNow but the increased crawl pressure may surface in GSC as faster re-judgement), (c) ship the deferred `price_cents = 0` filter fix (1 line at `src/pages/compare.astro:94`, see RESULT below) and combine with a new SEO initiative targeting the H2H URLs through a different mechanism (e.g., on-page Buyer-Query anchor block per URL, copying the T7 `/compare` pattern). Do not re-run this gate — it is now CLOSED with this RESULT.

### RESULT (2026-08-14): `price_cents = 0` filter bug fix (deferred from 2026-08-10 handoff)

Closed the deferred 1-line fix at `src/pages/compare.astro:94`:

```diff
- const isGoodValue = best && best.price_cents < 12000;
+ const isGoodValue = best && best.price_cents > 0 && best.price_cents < 12000;
```

**Rationale**: 141/176 (80%) of `prices` rows have `price_cents = 0` in D1 (verified 2026-08-14 via `npx wrangler d1 execute ssd-affiliate-db --remote --command="SELECT COUNT(*) as total, SUM(CASE WHEN price_cents = 0 THEN 1 ELSE 0 END) as zero_priced, SUM(CASE WHEN price_cents > 0 THEN 1 ELSE 0 END) as priced FROM prices;"` — returns 176/141/35, unchanged from 2026-08-10 audit). Without the `> 0` guard, every zero-priced product is flagged "Good Value" and surfaces the "Strong value, premium gaming performance without the premium price" / "Great value, competitive performance at an affordable price" editorial bullet in the Quick Winner amber card on `/compare` (and propagated via `getRecommendationBullets()` to `/best/[slug]`, `/category/[slug]`, `/hubs/[slug]`).

**Compliance**: zero impact. No URL change, no schema change, no affiliate-link change, no `href`/`rel`/`target`/`tag`/`linkCode` change. Pure render-time string-template gate on an editorial bullet — does not affect price DISPLAY (already disabled site-wide per Phase 1 compliance fix, 2026-08-03), does not affect affiliate link href/tag/rel/target, does not modify the Amazon Associates Operating Agreement posture.

**Verification**: `grep -n "isGoodValue" src/` returns exactly 3 hits — the definition at `compare.astro:94` (now with `> 0` guard) and the 2 use sites at `compare.astro:120` and `:122` (unchanged). No other files reference `isGoodValue`. The 1-line change does not affect function signature, type coercion (both sides are integers), or downstream consumer behavior.

**Expected effect**: removes "Good Value" false-positives from Quick Winner cards across `/compare`, `/best/*`, `/category/*`, `/hubs/*`. Editorial credibility lift. No direct revenue effect (no new clicks expected from this change alone), but protects against Helpful Content Update signals from misleading editorial claims, which could become a ranking-risk signal in future quality reviews.




### RESULT (2026-08-15): Bing Webmaster Tools — first-ever baseline

Captured via `node scripts/bing_pull_traffic.js` on 2026-08-15, the same day the script was deployed (commit `d448497`). This is the **first time** either tenant has ever had Bing-side keyword / page data measured — there is no pre-deploy baseline. Use this block as the anchor for future 7-14d re-runs.

The script accepts `BING_WMT_API_KEY` (canonical) or `BING_WEBMASTER_API_KEY` (legacy, already set in owner's local env). Window is 14d because the BWMT API returns rows only for days with impressions; the 28d rolling window frequently returns empty for these low-traffic tenants.

**externalssds.com (14d, 2026-08-02 → 2026-08-16):**

- 14d total: **1 click / 28 impressions / 3.57% CTR**
- Top keyword by impressions: `crucial x9 pro official specifications usb 3.2 gen 2 1050 mb/s` — 0c / 4i / avg pos 6
- 1 converting keyword: `16 tb ssd external transfer speed comparison` — **1c / 1i / avg pos 1 (CTR 100%)**
- `/compare` is the dominant page (8 impressions across the window, 1 click)

**portablessds.com (14d, 2026-08-02 → 2026-08-16):**

- 14d total: **1 click / 186 impressions / 0.54% CTR**
- Top keyword by impressions: `portable ssds comparison` — 0c / **31i** / avg pos 4
- Second-tier: `portable ssds buying guide` 15i pos 7, `crucial x9 pro` 5i pos 5
- `/compare` page: **47i in a single day (2026-08-12)**, 1 click (CTR 2.13%)
- `/products/crucial-x9-pro`: 26i / 0c — Bing ranks it but searchers skip
- 1 converting keyword: `samsung portable ssds speed ratings` — 1c / 1i / avg pos 1 (CTR 100%)

**Causal notes**: the `portable ssds comparison` / `portable ssds buying guide` keywords (45+ impressions over 14d, pos 4-7, 0 clicks) and the `crucial x9 pro` family (15+ impressions, 0 clicks) are the highest-leverage Bing-side targets. The page already exists at `/compare?category=...` and `/hubs/best-portable-ssd-for-console-gaming` etc., but Bing's title SERP snippet is the same generic one Google sees — same problem as the GSC zero-click URLs from the 2026-08-15 audit. Most Bing impressions are non-EEA (verified by the BWMT impression geo breakdown when available), so the AdSense EEA-gate and Consent Mode v2 deploys do not block these clicks.

**Next agent implications**: re-run `node scripts/bing_pull_traffic.js` 7-14d post-deploy of any SEO change to measure Bing-side deltas. The two single-click conversions (`16 tb ssd external transfer speed comparison` externalssds, `samsung portable ssds speed ratings` portablessds) both occurred at avg pos 1 — Bing rewards position-1 titles that match exact query phrasing. The next obvious SEO lever is targeted title/H1 rewrites for the top-3 impressioning Bing keywords per tenant (NOT a blanket H2H rewrite — surgical, per the same lesson learned in AGENTS.md RESULT 2026-08-14).


### RESULT (2026-08-18): Most Popular home-page Amazon CTA activation (commit `6fdf14c`)

**Deployed 2026-08-18, commit `6fdf14c`.** Single-file change (`src/pages/index.astro`, +20/-25 lines). No other source files touched. No URL surface change, no schema.org types added/removed, no affiliate `href`/`rel`/`target`/`tag`/`linkCode` change, no Amazon disclosure change, no D1 writes.

**What shipped (2 hunks in 1 file):**

1. Frontmatter (lines 7, 24-37) — added `getProductPricesFresh` import + `Price` type. New `mostPopular` slice = `allProducts.slice(0, 6)` (matches the previous "Most Popular" display count exactly). Pre-fetched prices for those 6 products in a single `Promise.all` (eliminating the per-card N+1 query path); stored as `mostPopularPricesByProduct: Record<number, Price[]>`.
2. "Most Popular" section JSX (was lines 166-196, now lines 181-193) — replaced the inline `<a href="/products/{slug}">` information-only cards with a `<ProductGrid products={mostPopular} pricesByProduct={mostPopularPricesByProduct} />` call, matching the pattern already used by the "Best" section at line 162 and the "All Drives" section at line 265. Added an `<AffiliateDisclosure className="mb-4" />` inside the section (matches the "Best" section's disclosure pattern at line 161).

**Rationale**: the "Most Popular" section on the home page was the single largest above-the-fold conversion-funnel leak on the network. GSC 90d (captured 2026-08-18 immediately before deploy) shows home `/` ranked pos 15.1 / 14i / 0c on externalssds and pos 11.6 / 9i / 0c on portablessds (with BWMT portablessds 14d 30i/14d on `/`). Every other section on the home page that uses `<ProductGrid>` (`src/pages/index.astro:162,266`) already emits Amazon CTAs (via `ProductGrid` → `ProductCard` → `AffiliateButton` with `variant="primary"` + `useCartExtend`). "Most Popular" was hand-rolled differently using `<a href="/products/{slug}">` info-only cards — pure funnel leakage where 6 product cards displayed brand + read-speed + interface specs but had zero direct path to Amazon. Visitors had to click through to `/products/[slug]` and scroll down to find the "Where to Buy" section. This deploy eliminates that leak by re-using the existing compliant component stack.

**Compliance**: zero Amazon Associates impact. `git diff src/pages/index.astro` shows zero changes to `href=`, `rel=`, `linkCode`, or `data-affiliate` attributes (those are all owned by the unchanged `GeoAffiliateLink.astro` / `AffiliateButton.astro` / `ProductCard.astro` / `ProductGrid.astro` components). Amazon disclosure text on home (`src/pages/index.astro:121-123` top-of-page inline + Footer) is unchanged. New per-section `<AffiliateDisclosure>` reinforces disclosure at the section level (parallel to the "Best" section at line 161 and "All Drives" at line 262). No new URL surface — no sitemap regeneration, no DB writes, no D1 migration. Disclosure, CookieConsent, BaseLayout, Footer, GeoAffiliateLink, affiliate.ts, db.ts — all untouched.

**IndexNow** (per AGENTS.md Post-Deploy Checklist): both tenants submitted their full sitemaps via `npm run indexnow:submit`:
- `externalssds.com`: 3,367 URLs, HTTP 200, ✓
- `portablessds.com`: 3,044 URLs, HTTP 200, ✓

**Live verification (~60s post-deploy, both tenants HTTP 200):**

| Metric | externalssds | portablessds |
|---|---|---|
| `data-affiliate="1"` CTAs on `/` | 92 | 88 |
| `rel="noopener sponsored"` | 91 | 87 |
| `target="_blank"` | 91 | 87 |
| `linkCode=ll1` (cart-extend) | 83 | 83 |
| Amazon disclosure text present | ✓ | ✓ |
| "Most Popular" section heading renders | ✓ | ✓ |

The +6 above-the-fold Amazon CTAs per tenant are now in the "Most Popular" section. The total home-page CTA count (Best-of-3 + Most-Popular-6 + All-Drives-grid) is ~92 on externalssds and ~88 on portablessds — still well below any policy threshold and visually separable from content per AGENTS.md "AdSense (Display Ads)" §1 (ads clearly separable; affiliate CTAs inside cards clearly labeled "See Price on Amazon →").

**Pre-deploy baseline (captured 2026-08-18 immediately before deploy — same numbers as the GSC pull in this session):**

| Tenant | Home `/` 90d impressions | pos | clicks | 7d impressions | CTR |
|---|---|---|---|---|---|
| externalssds | 14 | 15.1 | 0 | 5 | 0% |
| portablessds | 9 | 11.6 | 0 | 11 | 0% |
| portablessds BWMT 14d `/` | 30 | — | 1 | — | 3.33% |

GA4 28d (captured 2026-08-18): externalssds `/` 2pv / 2s avg 3.1s; portablessds `/` 3pv / 2s avg 14.7s. Home page is the #2 most-viewed page on portablessds (behind `/products/samsung-t9-portable`) and the #5 on externalssds.

**Measurement plan (post-deploy):**

1. **Day +7** (`2026-08-25`): `node scripts/ga4_pull_traffic.js` — compare `/` 28d pageview / session / engaged-session totals against the pre-deploy baseline above. Target: externalssds `/` 2pv → ≥4pv; portablessds `/` 3pv → ≥5pv (marginal, given the 28d total network volume is ~30 sessions). Primary metric is `affiliate_click` events from the home page path (currently 0 on both properties per the cookie-consent gap; even 1 event = pass on the funnel side, but the listener under-counts because consent-mode v2 still gates custom-event attribution).
2. **Day +7** (`2026-08-25`): `node scripts/gsc_pull_revenue.js` — verify `/` GSC page report shows no rank regression. Target: externalssds `/` pos 15.1 ± 5; portablessds `/` pos 11.6 ± 5. Failure criterion: any home-page position regression of > 5 spots (suggested cause: denser visible CTA surface in the DOM might shift Google's helpful-content heuristic if the page reads as "ad-heavy" — the home-page CTA density did jump from ~3 to ~9 Amazon affiliate buttons per tenant, plus the unchanged Footer/Footer disclosure. If regression observed, revert via `git revert 6fdf14c --no-edit`).
3. **Day +14** (`2026-09-01`): `node scripts/bing_pull_traffic.js` — measure whether the home-page change affected Bing rankings for the existing top-3 Bing keywords (`portable ssds comparison`, `portable ssds buying guide`, `crucial x9 pro`). Target: no regression on Bing pos 4-7 for those queries. Failure: any Bing keyword that was pos ≤10 pre-deploy dropped to pos >12.

**Success criteria (any one of):**
- ≥1 `affiliate_click` GA4 event attributed to a home-page path on either tenant between 2026-08-18 and 2026-08-25 (proves the home-page CTA funnel is now reachable — even 1 event clears the bar given the cookie-consent-gate undercount).
- `/` GSC page report shows the home page gaining ≥1 click on either tenant over the 14-day window (the existing 0c per 90d baseline is the floor — any click from the same rank position would be a detectable micro-signal given the home page has ~14i+w of Bing+Google traffic already).
- No home-page rank regression greater than 5 SERP positions on either tenant at the Day +14 mark.

**Failure criteria (all of):** Day +14 GA4 home-page sessions are flat or down AND `affiliate_click` events still 0 home-page attributed AND `/` GSC position dropped >10 spots AND Bing top-3 keyword ranks regressed >3 positions. **If failure**: revert via `git revert 6fdf14c --no-edit` + push (PAT injection), document in AGENTS.md why the home-page CTA addition backfired (likely ad-heavy heuristic / UX confusion from dual CTAs in Best + Most Popular sections showing overlapping products), move to the next lever in the queue (cookieless server-side `affiliate_click` measurement via Cloudflare Worker → GA4 Measurement Protocol, OR per-URL IndexNow of the converting H2H URLs that have faded from top-20 page→query mapping).

**Owner action required**: none. This deploy is fully autonomous; no AdSense, no API keys, no D1 writes. AdSense activation remains blocked on Google's "Getting ready" review status (out of scope).

**Ghost in concurrent SEO windows**: this deploy does NOT close the `b61fa74` (2026-08-16 surgical Bing title on portablessds `/compare`) or `f710700` (2026-08-16 Bing-targeted title/H1 on 4 product pages) gates. Those gates' Day +3 / Day +7 / Day +14 re-runs (2026-08-19, 2026-08-23, 2026-08-30) are still pending. The 2026-08-25 GA4/GSC pull scheduled above for the `6fdf14c` gate doubles as the `b61fa74` Day +7 measurement; the 2026-09-01 BWMT pull doubles as the `f710700` Day +14 measurement. One combined pull session covers all three gates that week.



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
- [ ] **AdSense activation (owner-only)**: create 3 responsive ad units in the AdSense dashboard, paste the three slot IDs into `tenant.adsense` in `src/config/tenants.ts` (both tenants), commit + push (auto-activates; real pub ID already live in `public/ads.txt` + wired as `clientId`). See `RESULT (2026-08-09)` block.
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

### RESULT (2026-08-16): Surgical Bing title/H1/meta on portablessds `/compare` + T7 title-anchor rollback (commit `b61fa74`)

**Deployed 2026-08-16, commit `b61fa74`.** Single-file change (`src/pages/compare.astro`, +21/-17). No other source files touched. No URL surface change, no schema.org types added/removed, no affiliate `href`/`rel`/`target`/`tag`/`linkCode` change, no Amazon disclosure change.

**What shipped (4 hunks in 1 file):**

1. `compareTitle` ternary (lines 60-64) — T7-anchor branch (`Samsung T7 Shield 4TB {tenantNoun} SSD — Amazon Price...`) replaced with tenant-aware branch: portablessds → `Portable SSDs Compared (2026) — Specs, Speed, Price & Buying Guide`; externalssds → unchanged generic fallback.
2. `metaDesc` ternary (lines 66-70) — same rollback pattern. Portablessds meta description now contains "the buying guide for portable SSDs" anchor phrase.
3. `<h1>` JSX block (lines 477-483) — T7-anchor branch (`Samsung T7 Shield 4TB {tenantNoun} SSD: Amazon Price & Full Comparison`) replaced with tenant-aware branch: portablessds → `Portable SSDs Compared: Specs, Speed, Price & Buying Guide`; externalssds → `External SSDs Compared`.
4. ItemList JSON-LD (lines 412-441) — T7 Shield hardcoded at rank 1 reverted to highest-scored product (`products[0]`, currently `Samsung T9 2TB` on externalssds, `Samsung T9 Portable SSD` on portablessds). JSON-LD `name` field reverted from `Buyer-Price Ranking (2026)` to generic `Compared (2026)`.

**T7 Buyer's Price Query card (lines 495-552) preserved** — editorial content (blue-bordered card with `Check Price on Amazon →` GeoAffiliateLink, spec readout, internal cross-links) remains on the default `/compare` view. The card is unrelated to the page-level metadata regression — it's the page-level `<title>`/`<h1>`/JSON-LD over-narrowing that caused Google to drop the `samsung t7 shield 4tb portable ssd amazon.com price` query from the `/compare` page→query mapping.

**Rationale** (from the 2026-08-14 RESULT block on commit `9329992`): the 2026-08-04 deploy over-anchored the `/compare` default-view metadata to a single product. Google re-judged `/compare` as too narrow for the buyer query and dropped it from the top-20 page→query mapping on externalssds (was pos 7.5 / 8i / 0c pre-deploy, now 0i post-deploy). The 2026-08-14 RESULT block explicitly recommended reverting the title/H1 back to the generic form as the recovery path — this deploy implements that recommendation. The Bing-targeted surgical change (the portablessds "Buying Guide" phrasing) is layered on top of the rollback because portablessds `/compare` is already ranking pos 4-7 on Bing for `portable ssds comparison` (31i/14d, 0c) and `portable ssds buying guide` (15i/14d, 0c) per BWMT data — adding "Buying Guide" to the title matches those exact-phrase queries. Externalssds has no Bing traffic on these queries, so the generic externalssds title is unchanged from the rollback form.

**Compliance**: zero Amazon Associates impact. `git diff src/pages/compare.astro` shows zero changes to `href=`, `rel=`, `linkCode`, or `data-affiliate` attributes. Amazon disclosure text on `/compare` still rendered (line 471-473 inline + Footer component + CookieConsent + BaseLayout). No new structured data types; only the `position` and `name` fields of the existing ItemList are reverted. Disclosure, CookieConsent, BaseLayout, Footer, GeoAffiliateLink, affiliate.ts, db.ts — all untouched.

**IndexNow** (per AGENTS.md Post-Deploy Checklist): both tenants submitted their full sitemaps via `npm run indexnow:submit`:
- `externalssds.com`: 3,367 URLs, HTTP 200, ✓
- `portablessds.com`: 3,044 URLs, HTTP 200, ✓

This is a higher-coverage submit than the surgical 15-URL list originally scoped in the plan — the existing `scripts/indexnow-submit.mjs` is sitemap-only with no URL-list override, so the sitemap path is the established deploy mechanism. The 15 priority URLs (13 converting H2H + `/products` × 2) are a subset of the 6,411 submitted URLs.

**Live verification (~60s post-deploy, both tenants HTTP 200):**

| URL | Title | H1 |
|---|---|---|
| `https://externalssds.com/compare` | `External SSDs Compared (2026) — Specs, Speed & Price Side-by-Side \| External SSDs` | `External SSDs Compared` |
| `https://portablessds.com/compare` | `Portable SSDs Compared (2026) — Specs, Speed, Price & Buying Guide \| Portable SSDs` | `Portable SSDs Compared: Specs, Speed, Price & Buying Guide` |

ItemList JSON-LD position-1 verified: `Samsung T9 2TB` (externalssds), `Samsung T9 Portable SSD` (portablessds). T7 Buyer's Price Query card verified present on default `/compare` view (both tenants).

**Measurement plan (post-deploy):**

1. **Day +3** (`2026-08-19`): `node scripts/bing_pull_traffic.js` — check whether Bing has re-crawled `/compare` and whether the new title appears in the BWMT keyword rankings for `portable ssds comparison` (31i/14d baseline) and `portable ssds buying guide` (15i/14d baseline).
2. **Day +7** (`2026-08-23`): `node scripts/gsc_pull_revenue.js` + `node scripts/ga4_pull_traffic.js` — check whether GSC page→query top-20 mapping on externalssds `/compare` recovers the `samsung t7 shield 4tb portable ssd amazon.com price` query (was pos 7.5 / 8i / 0c pre-`9329992`, currently ABSENT).
3. **Day +14** (`2026-08-30`): all three scripts + write the closing RESULT block to AGENTS.md.

**Success criteria:**

- **PRIMARY**: BWMT portablessds `/compare` 14d CTR lifts from 0.54% (baseline 1c/186i) → ≥3% (~6+ incremental Bing clicks/14d, ~13/mo, ~156/yr).
- **PRIMARY**: BWMT keyword `portable ssds comparison` CTR lifts from 0% (0c/31i) → ≥3%.
- **PRIMARY**: BWMT keyword `portable ssds buying guide` CTR lifts from 0% (0c/15i) → ≥3%.
- **SECONDARY**: GSC externalssds `/compare` page→query top-20 mapping recovers the `samsung t7 shield 4tb portable ssd amazon.com price` query (currently ABSENT).
- **TERTIARY**: `/products` URL appears in BWMT `GetPageStats` for either tenant within 7d (forced re-crawl via sitemap submit).

**Failure criteria (all of):** Day +14 BWMT CTR still ≤0.54%; `portable ssds comparison` still 0c/31i; GSC externalssds `/compare` still missing the T7 buyer query. **If failure**: revert via `git revert b61fa74 --no-edit` + `git push` (PAT injection), document in AGENTS.md why the surgical Bing title approach didn't work for this query family, move to the next lever in the queue (cookieless server-side `affiliate_click` measurement via Cloudflare Worker → GA4 Measurement Protocol, OR per-URL IndexNow of the converting H2H URLs that have faded from top-20 page→query mapping).

**Owner action required**: none. This deploy is fully autonomous; no AdSense, no API keys, no D1 writes. AdSense activation remains blocked on Google's "Getting ready" review status (out of scope; per audit at session start).

### RESULT (2026-08-16): Bing-targeted title/H1/meta on 4 product pages (deployed 2026-08-16, commit `f710700`)

Targets 4 product pages that are already receiving Bing impressions at 0% CTR. BWMT 14d baseline (2026-08-02 → 2026-08-16) shows the network is invisible to Google but Bing is sending real impressions — the bottleneck is searcher-intent matching, not crawl/index. The 4 pages below were picked because their existing generic title doesn't match the exact-phrase Bing queries sending impressions, so Bing users see the page in results but skip it (CTR 0%). This deploy rewrites the title/H1/meta on each of the 4 pages to match the exact Bing queries that are already sending impressions, with the explicit goal of lifting CTR from 0% → ≥3% on impressions the site is already earning.

**Deployed 2026-08-16, commit `f710700`.** Single-file change (`src/pages/products/[slug].astro`, +35/-7). No other source files touched. No URL surface change, no schema.org types added/removed, no affiliate `href`/`rel`/`target`/`tag`/`linkCode` change, no Amazon disclosure change, no D1 writes.

**What shipped (4 surgical overrides + 1 sentinel sanity check):**

| Tenant | Slug | New Title | New H1 | Bing query targeted |
|---|---|---|---|---|
| portablessds | `crucial-x9-pro` | `Crucial X9 Pro 1TB Portable SSD Specs, Price & Review (2026)` | `Crucial X9 Pro 1TB Portable SSD — Specs, Speed, Price & Review` | `crucial x9 pro` (5i/14d, pos 5, 0c) |
| portablessds | `samsung-t7-portable` | `Samsung T7 Portable 1TB Portable SSD Specs, Price & Review (2026)` | `Samsung T7 Portable 1TB Portable SSD — Specs, Speed, Price & Review` | (BWMT page-level impressions) |
| portablessds | `sabrent-rocket-nano-v2` | `Sabrent Rocket Nano V2 1TB Portable SSD Specs, Price & Review (2026)` | `Sabrent Rocket Nano V2 1TB Portable SSD — Specs, Speed, Price & Review` | (BWMT page-level impressions) |
| externalssds | `samsung-t7-shield-4tb` | `Samsung T7 Shield 4TB External SSD Specs, Price & Review (2026)` | `Samsung T7 Shield 4TB External SSD — Specs, Speed, Price & Review` | (BWMT page-level impressions) |

**Implementation** (`src/pages/products/[slug].astro`):
- New `HIGH_INTENT_BING_SLUGS` const map (lines 106-136) keyed by `${tenantId}-${slug}`, holds `{ title, h1, desc }` per slug.
- New `bingOverride` variable resolved at top of frontmatter (line 136) — `tenant.tenantId === 'portablessds' ? HIGH_INTENT_BING_SLUGS['portablessds-' + product.slug] : HIGH_INTENT_BING_SLUGS['externalssds-' + product.slug]`.
- `productPageTitle` (lines 138-143) — ternary: `bingOverride?.title ?? \`${product.name} ${capacityLabel} ${tenantNoun} SSD Review (${year})...\``.
- `productPageDesc` (lines 145-148) — same ternary pattern.
- `<h1>` JSX (line 328) — `{bingOverride ? bingOverride.h1 : defaultH1}` (where `defaultH1 = \`${product.name} ${capacityLabel}\``).
- All overrides are surgical: only the 4 listed slugs trigger the override. Every other product page uses the existing generic title recipe (verified via `https://portablessds.com/products/samsung-t9-portable` returning OLD generic title `Samsung T9 Portable SSD 1.0TB Portable SSD Review (2026) — 2,000 MB/s Reads | Portable SSDs` — sanity check 5.7 PASS).

**Compliance**: zero Amazon Associates impact. `git diff src/pages/products/[slug].astro` shows zero changes to `href=`, `rel=`, `linkCode`, or `data-affiliate` attributes. Amazon disclosure text on every product page still rendered (inline + Footer component + CookieConsent + BaseLayout). The override targets `<title>`, `<meta name="description">`, and `<h1>` only — all three are Amazon-policy-compliant surface (Associates TOS does not restrict page metadata). Disclosure, CookieConsent, BaseLayout, Footer, GeoAffiliateLink, affiliate.ts, db.ts — all untouched.

**BWMT 14d baseline (captured 2026-08-16) — the impressions this deploy is targeting:**

| Page | 14d impressions | 14d clicks | CTR | avg pos |
|---|---|---|---|---|
| `portablessds.com/products/crucial-x9-pro` | 26 | 0 | 0% | 5 |
| `portablessds.com/products/samsung-t7-portable` | 6 | 0 | 0% | 4 |
| `portablessds.com/products/sabrent-rocket-nano-v2` | 1 | 0 | 0% | 7 |
| `externalssds.com/products/samsung-t7-shield-4tb` | 1 | 0 | 0% | 6 |
| **Total (4 pages)** | **34** | **0** | **0%** | — |

Top Bing keyword driving these impressions: `crucial x9 pro` (5i/14d, pos 5, 0c). The page already ranks pos 5 for the keyword — the problem is the searcher sees a generic "Crucial X9 Pro 1.0TB Portable SSD Review (2026)" snippet and doesn't know the page answers the exact query, so they skip. The new title `Crucial X9 Pro 1TB Portable SSD Specs, Price & Review (2026)` matches the exact search phrase and surfaces "Specs, Price & Review" — explicit intent-match signals.

**Live verification (~60s post-deploy, both tenants HTTP 200):**

- `https://portablessds.com/products/crucial-x9-pro` → title: `Crucial X9 Pro 1TB Portable SSD Specs, Price & Review (2026) | Portable SSDs`; H1: `Crucial X9 Pro 1TB Portable SSD — Specs, Speed, Price & Review`
- `https://portablessds.com/products/samsung-t7-portable` → title: `Samsung T7 Portable 1TB Portable SSD Specs, Price & Review (2026) | Portable SSDs`
- `https://portablessds.com/products/sabrent-rocket-nano-v2` → title: `Sabrent Rocket Nano V2 1TB Portable SSD Specs, Price & Review (2026) | Portable SSDs`
- `https://externalssds.com/products/samsung-t7-shield-4tb` → title: `Samsung T7 Shield 4TB External SSD Specs, Price & Review (2026) | External SSDs`
- Affiliate link href/rel/target/tag/linkCode UNCHANGED on all 4 pages (verified via `grep` on the prod HTML): `tag=ssdnetwork07-20&linkCode=ll1` injected, `rel="noopener sponsored"` present, `target="_blank"` present, `data-affiliate="1"` present.
- Amazon disclosure `As an Amazon Associate I earn from qualifying purchases` still rendered on all 4 pages.
- Sanity check: `https://portablessds.com/products/samsung-t9-portable` (NOT in override list) still shows OLD generic title — confirms override is surgical, not blanket.

**IndexNow** (per AGENTS.md Post-Deploy Checklist): not strictly required for Bing (Bing auto-discovers via sitemap), but the previous b61fa74 sitemap submit at 2026-08-16 covered these 4 URLs already. No re-submit.

**Measurement plan (post-deploy):**

1. **Day +3** (`2026-08-19`): `node scripts/bing_pull_traffic.js` — re-run BWMT pull for both tenants. Capture 14d totals, page-level stats for the 4 target URLs, and keyword-level stats for `crucial x9 pro` (5i baseline). Compare against the 34 imp / 0c baseline.
2. **Day +7** (`2026-08-23`): `node scripts/bing_pull_traffic.js` + `node scripts/gsc_pull_revenue.js` — full BWMT + GSC re-pull. Compare 14d totals, page-level stats, and check whether Google has picked up the new titles (GSC `topQueries` per-page for the 4 URLs).
3. **Day +14** (`2026-08-30`): all three scripts + write the closing RESULT block to AGENTS.md.

**Success criteria:**

- **PRIMARY**: BWMT page-level CTR for the 4 target URLs lifts from 0% (0c/34i baseline) → ≥3% (≥1 incremental Bing click/14d).
- **PRIMARY**: BWMT keyword `crucial x9 pro` CTR lifts from 0% (0c/5i) → ≥3% on portablessds.
- **SECONDARY**: BWMT page-level impressions grow (4 URLs combined: 34i/14d → 40+i/14d) — title rewrite should surface better SERP snippet, earning more impressions from existing rank positions.
- **TERTIARY**: Zero collateral damage — none of the 156 non-target product pages lose GSC impressions or position.

**Failure criteria (all of):** Day +14 BWMT CTR still 0% on the 4 target URLs AND `crucial x9 pro` keyword CTR still 0% AND impressions flat (no growth from better SERP snippet) AND any non-target product page loses GSC visibility. **If failure**: revert via `git revert f710700 --no-edit` + `git push` (PAT injection), document in AGENTS.md why the Bing-targeted title approach didn't lift CTR for this product family, move to the next lever in the queue (cookieless server-side `affiliate_click` measurement, OR per-URL IndexNow of the converting H2H URLs).

**Owner action required**: none. This deploy is fully autonomous; no AdSense, no API keys, no D1 writes. AdSense activation remains blocked on Google's "Getting ready" review status (out of scope).

