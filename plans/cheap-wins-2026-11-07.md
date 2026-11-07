# Cheap Wins — Funnel Tightening Plan (internal links + one title override)

**Date:** 2026-11-07 · **Status: AWAITING OWNER APPROVAL — DO NOT EXECUTE**
**Requested by:** owner ("Create a complete structured implementation plan for the cheap wins. Do not execute the plan without my approval.")
**Context (2026-11-06 full audit, all data pulled live):** revenue $0 for 37+ days; AdSense is the #1 lever but portablessds is in Google's "Getting ready" review queue (no owner action available until "Ready"); Amazon UK/DE/CA = 0 everywhere (international dormant); Google still fading (GSC 7d: ext 0c/7i, port 0c/3i); Bing stable (65c/2,494i/14d) but research clicks convert at $0. This plan does NOT attempt Google recovery (that is the separate unapproved keeper-deepening program) — it is funnel-tightening plus one CTR lift, sized to ship in a single ~1-hour session.

---

## 1. Objective & thesis

Three surgical, zero-affiliate-surface changes that give the proven converting URLs the internal links they currently lack, and one title override on the largest zero-click Bing surface on externalssds:

| Change | Mechanism | Evidence (all pulled 2026-11-06) |
|---|---|---|
| A. Home H2H card for converter #1 | Route home-page equity (70 RUM visits/28d, daily Bing/Google re-crawl) to the network's #1 beacon converter, which currently has **zero** internal links | Beacon 30d: `/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb` = **3 clicks (network #1)**; GSC 90d: **2c/11i pos 11.1 CTR 18.18%** (best converting ext H2H) |
| B. Participant-rule comparison links on product pages | Every ext/port product page's ONLY H2H link today is `{slug}-vs-samsung-t9-2tb` (topCompetitor monoculture — a **noindex** pair). Diversify toward keeper comparisons that include the page's own product | Live-DOM audit: all 6 high-RUM ext product pages link the same noindex pair; both converters get 0 product-page links |
| C. "Most-Compared Head-to-Heads" module on `/compare` | ext `/compare` (50 RUM visits, best Bing page 6c/253i) and port `/compare` (228i/1c Bing) currently link **zero** keeper comparisons | Same GSC/BWMT evidence as A/B, keeper slugs verified against `KEEP_INDEXED_H2H` |
| D. Title override on `/products/wd-my-passport-ssd` | Replicate the proven retitle pattern that took ext `crucial x9 pro 2tb` from 0c → 1c/7i (7.1% CTR) on the largest 0-click surface | BWMT 14d: `/products/wd-my-passport-ssd` **22i/0c**; keyword `18. wd my passport ssd — slim external ssd that can slip into a pocket` **24i/0c** (largest single 0-click keyword on ext) |

**Explicit non-goal:** Amazon revenue lift. 140 Amazon clicks/30d produced $0.00 — research traffic doesn't buy. This plan's value is (a) more equity/CTR to the only URLs that demonstrably earn clicks, and (b) keeping the link graph healthy for the AdSense-era and any future Google recovery. Effort: 3 files, ~40 lines, 1 build, 1 push.

---

## 2. Hard guardrails (grep-verified before push)

1. **Affiliate surface byte-identical:** zero changes to `href=`/`rel=`/`target=`/`linkCode=`/`tag=`/`data-affiliate=`/disclosure anywhere. The only new hrefs are **internal** `/compare/<keeper>` links.
2. **No URL surface change:** no new pages/routes, no sitemap regeneration (all linked slugs are already in both sitemaps), **`src/lib/h2hQuarantine.ts` is NOT touched** — every linked H2H slug must be verified present in `KEEP_INDEXED_H2H` (ext lines 30–41, port lines 44–57) before push.
3. **Participant-only coherence rule (anti-thin):** a product page may link a comparison only if its own product is one of the two drives in that comparison. This is the guardrail that prevents recreating the incoherent templated-link pattern that caused the Aug-2026 quality demotion and both AdSense "low value content" flags.
4. **Metadata churn limit:** exactly ONE slug override (`externalssds` → `wd-my-passport-ssd`); title ≤65 chars; no other title/meta/H1 touched.
5. **Monetization machinery untouched:** AdSlot.astro, `src/lib/adsense.ts`, tenants.ts, BaseLayout, CookieConsent — not opened.
6. **Amazon policy:** no customer reviews/star ratings; no fabricated "we tested" claims; every spec claim traceable to the D1 product row or the manufacturer's published spec; no prices invented; no price alerting; disclosure intact on every touched template.
7. **One deploy**, then the Post-Deploy Checklist (IndexNow full-sitemap submit BOTH tenants).

---

## 3. Exact changes

### Change A — `src/pages/index.astro` (H2H candidates, 1 line)

In `H2H_CANDIDATES.externalssds` (currently lines 79–88), insert as the FIRST entry:

```ts
["sandisk-extreme-portable-1tb", "seagate-one-touch-ssd-1tb"], // BEACON 3c/30d (network #1) + GSC 2c/11i pos11.1 CTR18.2% — top leverage — must stay position 1
```

- Canonical href: `sandisk-extreme-portable-1tb` < `seagate-one-touch-ssd-1tb` alphabetically → `/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb` (matches the keeper slug byte-for-byte).
- Render machinery unchanged: `liveH2H.map` (line 209) renders all resolved pairs; the pair resolves because both slugs are active ext products (verified in D1). Home goes from 8 → 9 cards. Portablessds list untouched.

### Change B — `src/pages/products/[slug].astro` (participant-rule map + one conditional paragraph)

**B1.** New const immediately after `HIGH_INTENT_BING_SLUGS` (after line 139):

```ts
// Proven-converter comparison links — PARTICIPANT RULE: a product page links
// only a keeper comparison that includes its own product. Fixes the
// topCompetitor monoculture (every page previously linked only
// `{slug}-vs-samsung-t9-2tb`, a noindex pair) by routing product-page equity
// to the H2H keepers that actually earn clicks.
const PROVEN_COMPARISON_LINKS: Record<
  string,
  Record<string, { href: string; label: string }>
> = {
  externalssds: {
    "sandisk-extreme-portable-1tb": { href: "/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb", label: "SanDisk Extreme Portable 1TB vs Seagate One Touch SSD 1TB" },
    "seagate-one-touch-ssd-1tb":     { href: "/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb", label: "Seagate One Touch SSD 1TB vs SanDisk Extreme Portable 1TB" },
    "crucial-x9-pro-2tb":           { href: "/compare/crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb", label: "Crucial X9 Pro 2TB vs Samsung T7 Shield 2TB" },
    "samsung-t7-shield-2tb":        { href: "/compare/crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb", label: "Samsung T7 Shield 2TB vs Crucial X9 Pro 2TB" },
  },
  portablessds: {
    "samsung-t9-portable":            { href: "/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable", label: "Samsung T9 vs SanDisk Extreme Pro Portable" },
    "sandisk-extreme-pro-portable":   { href: "/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable", label: "SanDisk Extreme Pro vs Samsung T9 Portable" },
    "crucial-x9-pro":                 { href: "/compare/crucial-x6-portable-1tb-vs-crucial-x9-pro", label: "Crucial X6 1TB vs Crucial X9 Pro" },
    "crucial-x6-portable-1tb":        { href: "/compare/crucial-x6-portable-1tb-vs-crucial-x9-pro", label: "Crucial X6 1TB vs Crucial X9 Pro" },
    "seagate-one-touch-portable-1tb": { href: "/compare/seagate-one-touch-portable-1tb-vs-wd-my-passport-ssd-portable-1tb", label: "Seagate One Touch vs WD My Passport SSD Portable 1TB" },
    "wd-my-passport-ssd-portable-1tb":{ href: "/compare/sandisk-extreme-portable-vs-wd-my-passport-ssd-portable-1tb", label: "SanDisk Extreme Portable vs WD My Passport SSD 1TB" },
    "crucial-x9-pro-portable-2tb":    { href: "/compare/crucial-x9-pro-portable-2tb-vs-samsung-t7-shield-portable-2tb", label: "Crucial X9 Pro 2TB vs Samsung T7 Shield 2TB" },
    "samsung-t7-shield-portable-2tb": { href: "/compare/crucial-x9-pro-portable-2tb-vs-samsung-t7-shield-portable-2tb", label: "Samsung T7 Shield 2TB vs Crucial X9 Pro 2TB" },
  },
};

const provenComparisonLink =
  PROVEN_COMPARISON_LINKS[tenant.id]?.[slug!] ?? null;
```

Every href above is a verified `KEEP_INDEXED_H2H` slug (ext: lines 30–31; port: lines 44–57 of `h2hQuarantine.ts`). The `portablessds` block is marked **optional** — same mechanism, port is where Bing traffic actually converts; owner may trim to ext-only.

**B2.** Render: inside the `{topCompetitor && (<section ...>)}` block, immediately AFTER the existing "For a detailed head-to-head comparison…" paragraph (after line 647):

```astro
{provenComparisonLink && (
  <p>
    Buyers also compare: <a href={provenComparisonLink.href} class="text-blue-800 hover:text-blue-900 font-medium">{provenComparisonLink.label} comparison</a>.
  </p>
)}
```

(Same link classes as the existing paragraph — no styling system change.)

### Change C — `src/pages/compare.astro` (small module, ~14 lines)

New section rendered directly AFTER the "Who Should Buy Which Drive" section closes (after ~line 752, before the "Spec Comparison" section at line 755):

```ts
// Evidence-ranked keeper comparisons for the "Most-Compared Head-to-Heads"
// module. ext /compare (50 RUM visits/28d; best Bing page 6c/253i) and port
// /compare (228i/1c Bing) previously linked ZERO keeper comparisons.
const COMPARE_MODULE_LINKS: Record<string, Array<{ href: string; label: string }>> = {
  externalssds: [
    { href: "/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb", label: "SanDisk Extreme Portable 1TB vs Seagate One Touch SSD 1TB" },       // beacon 3c/30d; GSC 2c/11i CTR 18.2%
    { href: "/compare/crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb", label: "Crucial X9 Pro 2TB vs Samsung T7 Shield 2TB" },                                   // beacon 2c/30d; GSC 1c/25i
    { href: "/compare/corsair-ex400u-usb4-vs-crucial-x10-pro-2tb", label: "Corsair EX400U USB4 vs Crucial X10 Pro 2TB" },                                     // GSC 1c/3i pos6.7 CTR 33%
  ],
  portablessds: [
    { href: "/compare/samsung-t9-portable-vs-sandisk-extreme-pro-portable", label: "Samsung T9 vs SanDisk Extreme Pro Portable" },                            // GSC 1c/22i
    { href: "/compare/seagate-one-touch-portable-1tb-vs-wd-my-passport-ssd-portable-1tb", label: "Seagate One Touch vs WD My Passport SSD Portable 1TB" },   // GSC 1c/6i CTR 16.7%
    { href: "/compare/sandisk-extreme-portable-vs-wd-my-passport-ssd-portable-1tb", label: "SanDisk Extreme Portable vs WD My Passport SSD 1TB" },           // GSC 1c/10i CTR 10%
  ],
};
```

Markup mirrors the existing section pattern (accent bar + `<h2>` + bordered link list; internal anchors only, **no affiliate CTAs, no disclosure duplication needed** — these are internal navigation links, not monetized content).

### Change D — `src/pages/products/[slug].astro` (ONE new override entry)

Add to `HIGH_INTENT_BING_SLUGS.externalssds` (after the `crucial-x9-pro-2tb` entry, line 137):

```ts
"wd-my-passport-ssd": {
  title: "WD My Passport SSD 1TB External SSD Specs, Price & Review (2026)",
  h1: "WD My Passport SSD 1TB External SSD — Specs, Speed, Price & Review (2026)",
  meta: "WD My Passport SSD 1TB external SSD review (2026): slim, pocket-sized drive with 1,050 MB/s reads over USB 3.2 Gen 2, 256-bit AES hardware encryption, 3-year warranty, full specifications, and the current Amazon price.",
},
```

- Title = 64 chars (≤65 per the pattern comment at line 101) and contains the exact phrase `wd my passport ssd` + `external ssd`; "slim, pocket-sized" matches the AI-assistant query tail (`slim external ssd that can slip into a pocket`).
- Spec traceability: 1TB (1024GB), USB 3.2 Gen 2, 1,050/1,000 MB/s, 3-year warranty — from the D1 row; 256-bit AES hardware encryption — WD's published spec for this model (well-established category knowledge; no fabricated claims).
- **Flagged assumption:** BWMT gives page-level stats (`/products/wd-my-passport-ssd` 22i/0c) and keyword-level stats (24i/0c numbered query) but no page↔query mapping — the numbered query may not land on this page. The Day+3 measurement will confirm (if CTR stays 0c while impressions hold, the query lands elsewhere and the override stays harmless-but-neutral; revert is trivial).

---

## 4. Explicitly NOT in this plan (owner-visible scope cuts)

1. **`/products/sandisk-extreme-pro-4tb` (40 RUM visits) and `/products/kingston-xs2000-2tb` (30 RUM visits) get NO new comparison links.** The approved option text named them as link sources, but no keeper comparison includes either product (the participant rule blocks it), and the only existing pair containing `sandisk-extreme-pro-4tb` (`samsung-t7-shield-4tb-vs-sandisk-extreme-pro-4tb`) is deliberately **not** a keeper (no recorded click → fails the quarantine membership rule) — adding forced cross-capacity links from a 4TB page to 1TB comparisons is precisely the incoherent-link pattern behind the Aug demotion and both AdSense flags. These pages keep their existing home cards and capacity-variant cross-links untouched. Their RUM volume still benefits from Changes A/C indirectly (home + /compare equity lifts all pages).
2. No `wd-my-passport-ssd-2tb` override (20 RUM visits but zero BWMT impressions) — revisit at Day+14 if the base-slug override works.
3. No port retitle extensions (`crucial x9 pro 2tb` 9i/0c, `samsung t7 portable ssd comparison` 35i/0c) — frozen behind the port `/compare` revert-candidate decision from the retitle gate.
4. No keeper-deepening content, no quarantine-list edits, no new URLs, no sitemap regeneration, no AdSense/consent/DB changes.

---

## 5. Verification (pre-push → post-deploy)

**Build:** `npm run build` must pass.

**Pre-change capture (for the after-diff):** ext home = 8 H2H links; ext `/compare` = 0 keeper links; each mapped product page's only H2H link = `{slug}-vs-samsung-t9-2tb`; `/products/wd-my-passport-ssd` current title (generic recipe form).

**Post-deploy live DOM (both tenants, HTTP 200):**
- ext home shows 9 H2H cards including converter #1 in position 1; port home unchanged (8 cards).
- ext `/compare` renders the 3-link module; port `/compare` renders its 3-link module.
- Each of the 4 ext (+ up to 8 port) mapped product pages shows exactly one new "Buyers also compare:" line with the correct keeper href.
- **Surgical sanity:** `/products/sandisk-extreme-pro-4tb` shows NO new line; `/products/samsung-t9-2tb` is absent from the map (sanity: a non-mapped high-traffic page unchanged).
- `/products/wd-my-passport-ssd` serves the new title/H1; a second non-overridden page (e.g. `/products/samsung-t7-1tb`) keeps the generic recipe title.
- **Affiliate-surface diff:** `data-affiliate="1"` counts per page unchanged (ext home 92 / ext compare 171 / port compare 163 baselines); every emitted Amazon href still `tag=ssdnetwork07-20` + `linkCode=ll1`; `rel="noopener sponsored"` and the verbatim disclosure present on all touched pages.
- `git diff` grep: zero `href|rel|target|linkCode|tag|data-affiliate` changes except the whitelisted new internal `/compare/...` hrefs; zero changes in `h2hQuarantine.ts`, `adsense*`, `tenants.ts`, `BaseLayout.astro`, `CookieConsent.astro`.

**Deploy:** PAT-injection push per AGENTS.md → Post-Deploy Checklist IndexNow full-sitemap submit BOTH tenants → live re-verification.

---

## 6. Measurement gates (baselines from the 2026-11-06 pulls)

| Gate | When | Metrics (baseline → target) |
|---|---|---|
| Day +3 | ~2026-11-10 | BWMT page `/products/wd-my-passport-ssd` CTR (22i/0c → ≥1c); BWMT keyword `wd my passport ssd` cluster; D1 beacon clicks on both keepers (3 and 2 per 30d → ≥+1) |
| Day +7 | ~2026-11-14 | + GSC: keeper URL impressions (ext #1 baseline 2c/11i pos 11.1 — expect growth, no rank regression >5); RUM: keeper paths appear with visits |
| Day +14 | ~2026-11-21 | Verdict + `RESULT (2026-11-21)` block in AGENTS.md |

- **Success (any one):** ≥1 Bing click on `/products/wd-my-passport-ssd` within 14d; OR ≥1 incremental beacon click on either keeper URL; OR either keeper's GSC impressions grow with no rank regression.
- **Failure (all flat):** single `git revert <sha>` + PAT push + IndexNow both, document, and close the cheap-wins chapter — every remaining lever is owner-gated (AdSense "Ready", Amazon export, PAAPI) or the keeper program.

**Rollback:** one commit (`funnel: ...`), one `git revert` restores byte-identical prior HTML. No DB/schema/worker involvement. Per the Nov-6 note, BWMT returns per-day rows and ignores date params — measurement sessions aggregate in-session.

---

## 7. Compliance checklist (verified before commit)

- [ ] Disclosure text present/visible on every touched template (product, compare, index)
- [ ] No Amazon customer reviews/ratings displayed; no fabricated test claims; no invented prices; no price-alerting surface
- [ ] Only internal `href`s added; zero `rel`/`target`/`linkCode`/`tag`/`data-affiliate` changes
- [ ] All linked H2H slugs verified present in `KEEP_INDEXED_H2H` (both tenants); `h2hQuarantine.ts` untouched
- [ ] Exactly one metadata override; title ≤65 chars
- [ ] AdSense/consent/CTA machinery untouched; max-1-ad-unit-per-template unchanged
- [ ] No new URL surface; no sitemap regeneration needed; IndexNow both tenants after push

---

## 8. Effort & sequencing

3 files (`index.astro` +1 line, `products/[slug].astro` +~30 lines, `compare.astro` +~16 lines) → `npm run build` → commit → PAT push → IndexNow ×2 → live verification (~1h total). Then the three measurement gates above; no other code work ships between now and Day+14 so the measurement stays clean.
