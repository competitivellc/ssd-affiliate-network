# Keeper-Deepening Content Program — Implementation Plan v2 (2026-11-15)

**Status: AWAITING OWNER APPROVAL — DO NOT EXECUTE.**
**Supersedes:** `plans/keeper-deepening-2026-10-26.md` (v1, kept verbatim as history).
**Requested by:** owner — "Create a complete structured implementation plan for B [Google-recovery keeper deepening]. Do not implement the plan without my permission."
**Evidence basis (all live pulls 2026-11-14/15, this session):** GSC (90d, ext 4c/1,383i pos 36.7 · port 0c/212i pos 45.5 · 7d combined 0c/20i) · GA4 (28d: ext 8 sess · port 5 sess · port AI Assistant 2 sess) · BWMT 14d (ext 31c/1,063i 2.92% · port 53c/1,926i 2.75% · `crucial x9 pro 2tb` 1c/14i 7.1% CTR · `samsung t7 shield 2tb` 1c/8i 12.5%) · RUM 28d (ext 1,090v · port 680v; SG-heavy ext, 97% desktop, referers ~97% empty — human/agent mix suspect) · D1 beacon 30d (~16 real clicks after removing 19 scanner rows; top: `/` 3 · ext `sandisk-extreme…-seagate…-1tb` 3 · `owc-envoy-pro-fx-portable-1tb` 3 · `samsung-t9-portable` 2) · Amazon Associates (window ending 2026-11-13, owner CSVs: 150 clicks · **1 indirect halo order · $159.99 · $4.00 total earnings 2.5% · category "Other" · ASIN "Other" · 0 direct conversions · Computers category 10 clicks / 0 orders**) · live prod (both tenants 200 · AdSense snippet live · ads.txt live · **slot IDs still empty — ads OFF** · affiliate CTAs intact · disclosure intact).

---

## 0. Why this program, why now

Google (the revenue source: $24.23 in Sept baseline, all buyer halo) demoted the network Aug 16–23 (dated cliff, both domains, ~98% impression collapse in one week; manual actions confirmed absent — owner checked GSC Security & Manual Actions both properties 2026-10-25). Since then: **Google = 4 clicks / 90d on ext, 0 clicks / 90d on port, 0 clicks / 7d combined.** It is a quality-classifier demotion, and time + genuinely original content is the only lever we control.

Every other lever is closed or non-buying: AdSense (in Google's queue, US externalssds flagged, portablessds "Getting ready" 28+ days, analyzing the owner's other sites first — not controllable); Bing (growing steadily, 84c/14d network-wide, but zero purchases — research/agent queries); Amazon halo (~$4/mo, unattributable — see §Evidence notes); PAAPI (prices 80% zero; owner-blocked review).

**This program is the only remaining path back to Google buyer traffic.** Its KPI is *earnings per visit* and *index quality*, never click volume.

---

## 1. Objective & thesis

Deepen the 266 substantive keeper URLs (138 ext / 128 port per quarantine) with original, spec-anchored editorial so that one program serves four revenue paths at once:

| Path | Mechanism | Current evidence |
|---|---|---|
| **Google classifier recovery** (primary, months-scale) | Quality density on already-indexed pages; recover query surface lost Aug 16–23 | Residual renders pos ~53; 7d combined 0c/20i; manual actions ruled out |
| **Bing CTR / buyer-intent** (secondary, weeks-scale) | Deeper pages better answer the queries Bing already sends; capacity-specific queries convert (`crucial x9 pro 2tb` 1c/14i 7.1% after retitle; `samsung t7 shield 2tb` 1c/8i 12.5%) | BWMT 14d network 84c/2,989i, +38% since Oct 26 |
| **AI-assistant citations** (emerging) | Numbered AI-style queries in Bing log (`18. wd my passport ssd — …` 0c/24i) + GA4 AI Assistant channel + RUM SG/CN-desktop pattern — agents read/cite substance, skip templated fluff | GA4 AI Assistant 2 sessions (ext, 28d) |
| **AdSense review defense** (both re-reviews) | Substantive pages are what "low value content" reviewers reward | portablessds flag cleared Oct 26 post-Phase-1; externalssds re-review follows portablessds being Ready |

**Explicit non-goals:** traffic volume, click count, new-URL surface, title/H1 changes (those remain gated on their own verdicts), any monetization-code path.

---

## 2. Hard guardrails (every batch — grep-verified pre-push)

1. **Affiliate surface byte-identical:** zero changes to `href=`, `rel=`, `target=`, `linkCode=`, `tag=`, `data-affiliate=`, disclosure text (both placements — inline + Footer).
2. **No URL surface change:** no new pages, templates, or sitemap entries; sitemap set identical (lastmod churn only); **`src/lib/h2hQuarantine.ts` read-only** (quarantine robots meta untouched; keeper pages stay exactly as indexed today).
3. **No metadata churn:** `<title>`, `<meta name="description">`, `<h1>`, canonical, robots — **out of scope**. Content blocks only (cheap-wins retitle verdict Nov 21 governs titles separately).
4. **Monetization machinery untouched:** AdSlot/AdSense/Consent Mode/CookieConsent/GeoAffiliateLink — byte-identical.
5. **Amazon policy is absolute:** no scraped reviews/ratings, no fabricated "we tested" or lab numbers, no invented prices, no price alerting, disclosure intact on every touched page, no incentivized clicks, no urgency language.
6. **Anti-thin (the demotion cause):** every added sentence is **slug-keyed and unique** — zero template reuse across pages. Spec-anchored only (page's own spec table, manufacturer documentation, category-standard knowledge). English only. FAQ answers may **not** be repeated verbatim across pages.
7. **Anti-churn:** **one deploy per week**, content-only commits, IndexNow both tenants after each (existing Post-Deploy Checklist), no stacking with other SEO deploys in the same week's measurement window.
8. **RUM sanity:** post-Nov-11 (473-visit single-day flood, SG/CN-desktop), raw RUM visits are **not** a success signal for this program; use beacon + BWMT + GSC only.

---

## 3. What changes technically (files, insertion scope, content homes)

**Implementation pattern:** per-slug static content objects in one new data module, rendered by **one additive section per template**. No existing generator is modified.

| File | Change | Scope |
|---|---|---|
| `src/lib/keeperContent.ts` (**new**) | `export const PRODUCT_KEEPER_CONTENT: Record<string, {shortVersion; sustainedWrites; enduranceMath; deviceFit; skipCases:[]; faqs:[{q;a}]}>` and `export const H2H_KEEPER_CONTENT: Record<string, {scenarioVerdicts:[]; untoldDelta; faqOverride?}>` keyed by `${tenantId}:${slug}` | Additive only; lives beside existing surgical maps |
| `src/pages/products/[slug].astro` | New optional block `<DeepDive slug={product.slug} tenant={tenant} />` rendering when key present — placed **after** the existing "Real-World Performance" section (~line 585) and before the VS-table section (~line 622) | Additive section; renders null when unmapped |
| `src/pages/compare/[slug].astro` | New optional block placed **after** the "Frequently Asked Questions" section (~line 404–422) and before "More Comparisons" | Additive section; robots/title untouched |
| `src/pages/compare.astro` | Batch 3 only: two additive blocks anchored inside existing "How to choose" position — after the buyer's-price-query card / picked region (after ~line 588 section) | No layout/meta changes; compare.astro is the most fragile asset — risk containment mandatory |
| `AGENTS.md` | One RESULT block per batch with baseline tables + gate dates | Existing convention |

**Word budgets (net-new, unique):** product Deep Dive **+400–700**; H2H pages **+300–500**; `/compare` main **+250–350** (announce only, no personality change).

**Content spec:**

*Product pages — one additive block, six subsections (each 1–3 sentences, unique numbers):*
1. **The short version** — decisive verdict for this exact capacity/variant.
2. **Sustained-write reality** — rated vs post-SLC-cache behavior by this drive's NAND class; why full-drive game installs differ from rated peaks. No fabricated lab figures.
3. **Endurance math, worked** — page's actual TBW ÷ (20/50/100 GB/day) × 365 = years, plain language (unique per capacity).
4. **Console & device fit** — PS5/Xbox/Steam Deck/USB4-Mac specifics derived from interface + capacity (formatted capacity, supported modes).
5. **Who should skip this drive** — 2–3 decisive anti-recommendation cases. Impossible to template honestly.
6. **Questions real searchers asked** — 3–5 FAQs sourced **only** from queries with recorded impressions for this page family (BWMT/GSC logs), answered substantively.

*H2H keeper pages — two blocks:*
1. **Scenario verdicts** — "Choose A if… / Choose B if…" (4–6 bullets strictly from on-page spec deltas).
2. **What the spec table doesn't tell you** — endurance-class/warranty/thermal/formatted-capacity delta + shared failure modes ("what neither drive fixes").
   Existing templated FAQ stays unless a real query exists for the pair — pair-specific Q/A is prepended above it.

*`/compare` main (Batch 3 only) — two blocks, additive:*
1. **"How to choose in 60 seconds"** — decision framework (interface → capacity → ruggedness → price class), answering the `portable ssds comparison` (0c/174i) / `buying guide` (0c/84i) intent Bing keeps sending.
2. **One-line row verdicts** — "why it ranks here" annotation for the top-10 table. Nothing else changes on these two pages.

---

## 4. Page universe & batch selection (evidence-ranked, re-validated at prep)

Every H2H slug below is in `KEEP_INDEXED_H2H` (verified against `src/lib/h2hQuarantine.ts` this session). Evidence columns: GSC (90d window), BWMT (14d), Beacon (30d, scanner rows excluded).

### Batch 1 — proven converters, externalssds (6 pages)
| # | Page | Evidence (2026-11-14/15) |
|---|---|---|
| 1 | `/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb` | **GSC 2c/8i pos 6.9, CTR 25% — network's only Google-converting URL today**; beacon 3 clicks/30d; home card shipped `054f5eb` |
| 2 | `/compare/crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb` | beacon 2 clicks/30d; RUM 20v/28d; keeper; GSC window slid (2c/11i Oct) |
| 3 | `/compare/corsair-ex400u-usb4-vs-crucial-x10-pro-2tb` | **GSC 1c/3i pos 6.7 CTR 33% (today's freshest ext click)**; keeper |
| 4 | `/products/crucial-x9-pro-2tb` | BWMT 1c/14i **7.1%** (retitle-proven); RUM 20v/28d; beacon 2 (Oct) |
| 5 | `/products/samsung-t7-shield-2tb` | BWMT 1c/8i 12.5% |
| 6 | `/compare/kingston-xs2000-4tb-vs-sandisk-extreme-portable-1tb` | GSC 1c/7i pos 47.4; keeper (kingston-family capacity-specific) |
| *sub* | `/products/owc-envoy-pro-fx-4tb` | BWMT 1c/16i 6.25% — substitution if prep re-check shows #6 decayed |

### Batch 2 — proven converters, portablessds (6 pages)
| # | Page | Evidence (2026-11-14/15) |
|---|---|---|
| 7 | `/products/samsung-t7-portable` | BWMT ~2c/134i (4.26% + 44i + 43i rows); RUM 20v/28d; **GA4: one ~28-minute engaged pageview (Nov 11) — deepest session on the network this month**; beacon click Nov 11 13:14 |
| 8 | `/products/kingston-xs2000-portable-1tb` | BWMT 3c/50i Oct (6.0%) — port's best historical converter |
| 9 | `/products/crucial-x9-pro-portable-2tb` | BWMT 1c/26i; GSC-query `crucial x9 pro 2tb` 1c/26i; RUM 20v/28d |
| 10 | `/compare/samsung-t7-shield-portable-vs-samsung-t9-portable` | BWMT 2c/19i Oct (10.5%); BING_SLUG_MAP keeper |
| 11 | `/products/owc-envoy-pro-fx-portable-1tb` | **beacon 3 clicks/30d** (Nov 9: 4TB/2TB/1TB capacity-duel in 7s — pre-purchase behavior, order landed ~Nov 9–10, $4.00 halo; note: basket was Category "Other", not necessarily this product) |
| 12 | `/compare/crucial-x6-portable-1tb-vs-crucial-x9-pro` | GSC 1c/22i pos 9.5 (Oct); keeper |

### Batch 3 — impression sinks / network assets (8 pages)
| # | Page | Evidence |
|---|---|---|
| 13 | port `/compare` | ~1c/238i (0.4%); home of 0c/174i `portable ssds comparison` + 0c/84i `buying guide` — biggest sink |
| 14 | ext `/compare` | ~6c/243i (2.5%) — network's workhorse; additive-only, maximum risk containment |
| 15 | port `/products/crucial-x9-pro` | BWMT ~0c/37i+ (1TB vs converting 2TB variant) |
| 16 | ext `/products/wd-my-passport-ssd` | page BWMT 22i/0c + AI-numbered query 0c/24i; cheap-wins override live (Nov 7) did not convert yet — Deep Dive addresses the query's literal intent |
| 17 | port `/products/sandisk-extreme-portable-4tb` | AI-numbered query 0c/22i (`22. sandisk extreme portable ssd 4tb — rugged pocket-sized…`) — confirm exact slug at prep |
| 18 | port `/compare/crucial-x9-pro-portable-2tb-vs-samsung-t7-shield-portable-2tb` | keeper; beacon 1c; RUM 20v/28d |
| 19 | ext `/products/kingston-xs2000-1tb` | BWMT 2c/11i Oct (18.2%) — capacity-specific winner family |
| 20 | ext `/products/owc-envoy-pro-fx-4tb` | BWMT 1c/16i 6.25% today — **only if unused as Batch 1 substitution** |

### Batch 4+ (Tier 3, go/no-go gate only, not pre-committed)
- Remaining keepers with any recorded click: ext `lacie-rugged-ssd-pro-1tb-vs-samsung-t9`, `crucial-x10-pro-vs-crucial-x10-pro-2tb`, `adata-*` ×3 (HIGH_INTENT), `kingston-xs2000-4tb-vs-sandisk-extreme-portable-1tb` (if Batch 1 substitute unused); port `sandisk-extreme-portable-vs-wd-my-passport-ssd-portable-1tb`, `lacie-rugged-ssd-portable-1tb-vs-wd-my-passport-ssd-portable-1tb`, `seagate-one-touch-portable-1tb-vs-wd-my-passport-ssd-portable-1tb`, `netac-zx1-portable-1tb-vs-wd-my-passport-ssd-portable-2tb`, `sandisk-extreme-portable-2tb-vs-wd-my-passport-ssd-portable-2tb`, `crucial-x9-pro-portable-2tb-vs-samsung-t9-portable-2tb`, `crucial-x9-pro-vs-samsung-t7-shield-portable`, `samsung-t7-shield-portable-vs-sandisk-extreme-pro-portable`
- Hubs with demonstrated demand (evidence-checked): `/hubs/best-ssd-for-mac`, `/hubs/fastest-usb-3-2-gen-2x2`, `/hubs/best-ssd-for-xbox`, `/hubs/fastest-thunderbolt-external-ssd`, `/hubs/best-ssd-for-ps5`, port `/hubs/best-rugged-portable-ssd-for-travel` (RUM 30v/28d — **port network #2 path**)

---

## 5. Anti-thin quality bar (enforcement, not aspiration)

1. **Uniqueness by construction:** every sentence is written against its page's actual spec sheet — uniqueness is structural, not stylistic luck.
2. **Uniqueness verification (before commit, ~5 min):** normalize all new body sentences per page; verify no ≥0.7 Jaccard sentence overlap between any two deepened pages; verify no two pages share a distinctive 8-word window. (Ad-hoc node check over the committed diff; pasted into the batch RESULT if desired — no new committed tooling required.)
3. **Spec anchoring audit:** every endurance/TBW/capacity claim traces to the page's own spec table or manufacturer documentation; TBW figures for capacities follow JEDEC derating (typ. 0.3 DWPD) only as a sanity range, never quoted as fact we measured.
4. **No lab claims:** no "we tested", no "in our lab", no fabricated benchmarks. Real-world sections use conditional language ("on this interface class", "after cache exhaustion on DRAM-less designs").
5. **Google's own bar:** every page must clear — originality (transformation), helpfulness (answers the query it serves), trustworthiness (decisive anti-recommendations, zero hype), non-duplication (per §5.2).

---

## 6. Fixed per-batch workflow (gate-checked)

**Batch 0 — Program preconditions (owner, 5 min):** record `RESULT (2026-11-21)` closing the cheap-wins gate (recommend: revert port `/compare` retitle — port targets flat 0c/346i — keep ext override + wd-my-passport pending Day+14 data; record whichever verdict owner chooses). **Program does not begin until this is recorded** — keeps deploys out of each other's measurement windows and unblocks the GSC script.

1. **Prep (read-only, ~30 min):** pull live HTML of the batch's pages (confirm sections render, CTAs, disclosure, robots); re-pull BWMT page rows + beacon rows (retailer IS NOT NULL) + GSC page rows for each page; **re-validate the evidence table — any page whose evidence decayed is swapped per the substitution rule (Batch 1→Batch 4 pool)**; capture baselines into the batch's RESULT draft.
2. **Draft:** write per-slug content objects; run uniqueness check (§5.2) + the §2 grep gates + a claim audit (§5.3/5.4).
3. **Owner sign-off (Batch 1 only):** full sample diff of one product page + one H2H page for tone sign-off before deploy. Batches 2–4: diff summary in chat; owner may stop any page/batch.
4. **Ship:** self-check `npm run build` → commit (content-only) → PAT push → IndexNow both tenants → live verification (HTTP 200 · new block renders · CTA count unchanged · robots meta unchanged · disclosure present · JSON-LD unchanged).
5. **Record:** RESULT block in AGENTS.md — baseline table + gate dates + any drift.

---

## 7. Measurement & verdicts

| Checkpoint | Pulls | Success signal (any one) — Batch baselines = 2026-11-14/15 values in §4 |
|---|---|---|
| Day +7 | beacon per-URL (retailer NOT NULL, scanner rows excluded) + BWMT page rows | first incremental beacon click on any batch page |
| Day +14 | BWMT + GSC + GA4 + RUM (paths only) + beacon | BWMT page CTR lift ≥2pp on any ≥20i page; **or** page impressions +20% (depth surfaces queries); **or** GSC keeper impressions recover (bonus only) |
| Day +30 (batch verdict) | full pull | ≥1 incremental beacon-attributed click on ≥15% of batch pages |

- **Google-side signals** recorded but never pass/fail at day+14 — months-scale expectation per the demotion diagnosis (8/21–23 cliff; algorithmic; manual actions ruled out 2026-10-25).
- **Alert, not rollback:** any page's BWMT impressions drop >50% post-deploy → flag, investigate before next batch. Per-page fix = delete its `keeperContent.ts` entry (trivial; no site-wide effect).
- **Program go/no-go after Batch 2 (≈ week 5–6):** if Batches 1–2 produce zero incremental beacon clicks AND zero CTR/impression movement on ≥20-impression pages, Tier 3 does not proceed; findings go to owner for redirect (pivot to D — affiliate-mix expansion — or wind-down-check question from 2026-11-14 audit).
- **Program end measurement:** after Batch 3 (≈ week 7–8), full-network verdict block: Google recovery indicator (7d/28d impressions on deepened pages vs 2026-11-15 baseline: ext home 172i pos 69.5 · combined 7d 0c/20i), Bing CTR on batch pages, beacon conversion rate (30d: 1 halo order/$4.00 — baseline), AdSense review status.

---

## 8. Risks, mitigations, rollback

| Risk | Likelihood (90d) | Impact | Mitigation / response |
|---|---|---|---|
| Google never visibly responds (classifier inertia) | High | Program ROI = months not weeks; AdSense unaffected | Expectation set in §7; verdict after Batch 3; go/no-go gate at Batch 2 |
| Deepening triggers re-crawl and *new* impression loss | Low | Contained per-page | Pages are already keepers in active indexation; additive-only; §6.5 per-page rollback |
| Anti-thin audit failure (quality classifier flags sameness) | Low (unique-by-construction) | Quality regression | §5 bar + uniqueness check; batch stops if 2+ pages flagged in manual pass |
| Content error (spec misstatement) | Medium | Trust/compliance | Spec-anchored audit; owner spot-check authority; per-page fix |
| Scope creep into titles/H1/meta | Medium (always tempting) | Breaks measurement isolation | §2.3 — hard out-of-scope; any title idea goes to separate approval |
| Amazon policy slip (price/urgency/reviews language) | Low with review | Account termination | §2.5 grep set + owner review steps |
| RUM flood noise masks real signal | High (observed Nov 11) | False positives | RUM excluded from verdicts (§2.8); beacon+BWMT+GSC only |

**Rollback:** per-page — remove content-map entry; per-batch — `git revert <batch commit>` + PAT push + IndexNow both tenants + RESULT note. No site-wide or robots change ever required.

---

## 9. Effort & cost (honest)

- **AI drafting:** ~1 working session per batch (Batch 1 ≈ one session: 6 pages × ~550 words net-new).
- **Owner time:** Batch 1 tone sign-off (2 pages, ~15 min) + per-batch diff summary review (~5 min) + spot-checks optional. **No API keys, no spend, no new tooling, no credentials.**
- **Cadence:** one batch/week → Batch 1 target week of Nov 23 2026 (after Batch 0 precondition) → program verdict ≈ end of January 2027.

---

## 10. Owner decision points (all required before execution)

1. **Approve this plan** (tiers, evidence rosters, content spec, guardrails, gates) — or mark red-line edits.
2. **Approve Batch 0/Nov-21 closure** (else program waits; GSC script stays blocked after Nov 22 without it).
3. **Approve Batch 1 page list + the sample tone diff** (workflow §6.3).
4. **Confirm substitution rule** (Batch-1 unused slot ↔ owc-envoy-pro-fx-4tb ↔ Batch 4 pool).
5. **Batch 2 onward auto-approved?** No — per-batch review remains owner's stop-authority (§6.3/§7).
6. Titles/H1/meta remain **excluded** — no approval of that scope exists inside this plan.
7. Explicit exclusions: WAF/PAAPI/AdSlot/price display — **not** part of this program; B&H/Newegg mix (option D from the 2026-11-14 audit) is separate owner decision.

---

## Appendix A — Evidence snapshot (2026-11-14/15, for the record)

| Source | Reading |
|---|---|
| GSC 90d | ext 4c/1,383i/0.29%/pos 36.7 · port 0c/212i/0%/pos 45.5 · 7d combined **0c/20i** — Google dead/evaporating |
| GSC keeper H2H (today) | sandisk…one-touch…1tb **2c/8i 25% pos 6.9** · corsair-ex400u-usb4… 1c/3i 33% pos 6.7 · kingston-xs2000-4tb… 1c/7i pos 47.4 |
| BWMT 14d | ext 31c/1,063i 2.92% · port 53c/1,926i 2.75% (network 84c, +38% vs Oct 26, +29% vs Nov 6) · port 0c sinks: `portable ssds comparison` 0c/174i · `samsung t7 portable ssd comparison` 0c/88i · `portable ssds buying guide` 0c/84i · `crucial x9 pro 2tb` 1c/26i |
| GA4 28d | ext 8 sess (AI Assistant 2 · Direct 5 · Org 1) · port 5 sess (Direct 4 · Org 1) · `affiliate_click` 0 (consent gap, known) |
| RUM 28d | ext 1,090v (SG 470 · US 450 · DE 60; desktop 1,060 vs mobile 30) · port 680v (US 460 · CN 100) · Nov 11: 473v single-day flood — **excluded from verdicts** |
| D1 beacon 30d | ~16 real clicks (Amazon 15 · Newegg 1) after removing 19 scanner rows (`/i23646*`, `/rl-*`, `/poison-test`, SQLi); top: `/` 3 · `sandisk-extreme…seagate…` 3 · `owc-envoy-pro-fx-portable-1tb` 3 (Nov 9 capacity-duel) · `samsung-t9-portable` 2 |
| Amazon Associates (CSV, window ending 2026-11-13) | 150 clicks · 1 ordered item (indirect halo, **Category "Other", ASIN "Other"**) · $159.99 revenue · **$4.00 earnings (2.5%)** · 0 direct conversions · Computers category 10 clicks/0 orders — $0 streak broken with an unattributable order |
| AdSense | portablessds "Getting ready" (28+ d, Google analyzing owner's other sites first) · externalssds "Needs attention / Low value content" — both blocked; slot IDs empty; serving OFF |
| Live prod (2026-11-15) | both tenants HTTP 200 · publisher snippet live · `ads.txt` 200 · `/compare` CTA 163/171 · disclosure intact · robots/keeper set unchanged |

## Appendix B — Dependency: the Nov 21 gate (Batch 0)
`054f5eb` Day+14 verdict lands Nov 21. If unrecorded, `scripts/gsc_pull_revenue.js` exits 2 after Nov 22 and **blocks all GSC work**. Owner decision needed on: (a) revert port `/compare` retitle (targets 0c/346i), (b) verdict text for ext override (1c/14i — keep) and wd-my-passport (0c — pending), (c) RESULT (2026-11-21) authorship. **This program must not start before (a)+(c) are resolved.**
