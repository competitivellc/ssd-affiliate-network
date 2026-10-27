# Keeper-Deepening Content Program — Implementation Plan v1

**Date:** 2026-10-26 · **Status: AWAITING OWNER APPROVAL — DO NOT EXECUTE**
**Requested by:** owner ("Create a complete structured implementation plan for (b)… Do not execute without my approval")
**Premise closed this session:** owner ran GSC → Security & Manual Actions on BOTH properties (2026-10-25): **no issues** → the Aug-2026 Google demotion is algorithmic (quality classifier), not manual. Content quality + time is the only remaining Google-recovery lever we control.

---

## 1. Objective & thesis

Deepen the quarantined keeper pages (~138 ext / ~128 port indexable URLs) with genuinely original, spec-anchored editorial so that one program serves **four** revenue paths at once:

| Path | Mechanism | Evidence |
|---|---|---|
| **Google classifier recovery** (primary, months-scale) | Quality density on already-indexed pages; recover query surface lost in the Aug 21–23 / Aug 16–17 demotion | Indexed-but-demoted (residual renders, pos ~53); manual actions ruled out |
| **Bing CTR / buyer-intent** (secondary, weeks-scale) | Deeper pages better answer the queries Bing already sends; capacity-specific queries convert (0c→7.1% CTR on `crucial x9 pro 2tb` after retitle) | BWMT 14d: 61c/2,219i network-wide, stable-to-growing |
| **AI-assistant citations** (emerging) | Numbered AI-style queries in Bing log (`18. wd my passport ssd —…`) + GA4 "AI Assistant" channel (4 sessions/28d ext) — AI systems cite substance, skip templated fluff | GA4 + BWMT query-log evidence |
| **AdSense review defense** (externalssds re-review comes after portablessds is Ready) | Substantive pages are what "low value content" reviewers reward | portablessds flag cleared Oct 26 after Phase 1 fixes |

**Explicit non-goal:** traffic volume. 140 Amazon clicks/30d produced $0.00 conversion — the program optimizes *earnings per visit* and index quality, not clicks.

## 2. Hard guardrails (every batch, verified by grep before push)

1. **Affiliate surface byte-identical:** zero changes to `href=`, `rel=`, `target=`, `linkCode=`, `tag=`, `data-affiliate=`, disclosure text (both placements).
2. **No URL surface change:** no new pages/templates; sitemap URL set identical (lastmod churn permitted); **quarantine robots meta untouched** (`h2hQuarantine.ts` is read-only in this program).
3. **No metadata churn:** `<title>`/meta-description/H1 changes are **out of scope** (the retitle program stays gated on the Oct 31 verdict + separate approval). Content sections only.
4. **Monetization machinery untouched:** AdSlot/AdSense/Consent Mode/CookieConsent code not modified.
5. **Amazon policy:** no Amazon review text or star ratings; no fabricated "we tested" claims; no invented prices; no price alerting; disclosure intact on every touched page.
6. **Anti-thin (the demotion cause):** every added sentence is **slug-keyed and unique** — zero template reuse across pages. Spec-anchored only (traceable to the page's own spec table, manufacturer documentation, or well-established category knowledge). English only.
7. **Anti-churn:** max **one deploy per week** (batched), content-only commits, IndexNow both tenants after each deploy (Post-Deploy Checklist).

## 3. Page universe & batching (evidence-ranked)

Evidence sources: BWMT 14d page stats (2026-10-26 pull), D1 beacon 30d (retailer NOT NULL), GSC 90d, RUM 28d paths. Per-batch prep re-verifies each page's beacon rows exclude probe traffic.

### Batch 1 — proven converters, externalssds (6 pages)
| # | Page | Evidence |
|---|---|---|
| 1 | `/products/crucial-x9-pro-2tb` | Bing 1c/83i; beacon 2 clicks/30d; the query family that converted after retitle (7.1% CTR) |
| 2 | `/compare/crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb` | **beacon 3 clicks/30d (network #1)**; RUM top content URL (30v/28d); quarantine keeper |
| 3 | `/products/samsung-t7-shield-2tb` | Bing 2c/31i (6.5%) |
| 4 | `/products/transcend-esd310c-1tb` | Bing 2c/33i (6.1%) |
| 5 | `/products/kingston-xs2000-1tb` | Bing 2c/11i (18.2%) |
| 6 | `/products/owc-envoy-pro-fx-4tb` | Bing 1c/22i (4.5%) |

### Batch 2 — proven converters, portablessds (6 pages)
| # | Page | Evidence |
|---|---|---|
| 7 | `/products/kingston-xs2000-portable-1tb` | Bing 3c/50i (6.0%) — port's best product converter |
| 8 | `/products/crucial-x9-pro-portable-2tb` | Bing 1c/150i; beacon 2 clicks/30d; query `crucial x9 pro 2tb` 1c/20i |
| 9 | `/products/samsung-t7-portable` | Bing 2c/154i |
| 10 | `/compare/samsung-t7-shield-portable-vs-samsung-t9-portable` | Bing 2c/19i (10.5%); BING_SLUG_MAP keeper |
| 11 | `/products/samsung-t7-shield-4tb` | Bing 1c/39i (ext — completes ext converter set) |
| 12 | `/compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb` | GSC 2c/11i (18.2%) + beacon 3 clicks/30d; quarantine keeper (ext) |

### Batch 3 — impression sinks (the zero-click inventory)
| # | Page | Evidence |
|---|---|---|
| 13 | port `/compare` (main) | 1c/314i (0.3%) — biggest sink on network; targets `portable ssds comparison` 142i/0c + `buying guide` 62i/0c |
| 14 | ext `/compare` (main) | 6c/236i (2.5%) — network's best page, protect + deepen |
| 15 | port `/products/crucial-x9-pro` | 0c/165i — largest zero-click product page (f710700 retitle page; 1TB page vs converting 2TB variant) |
| 16 | ext `/products/wd-my-passport-ssd` | 0c/24i + AI-numbered query 24i/0c |
| 17 | port `/products/sandisk-extreme-pro-portable-4tb` | 0c/25i + AI-numbered query 22i/0c |
| 18 | port `/compare/crucial-x9-pro-portable-2tb-vs-samsung-t7-shield-portable-2tb` | beacon 1c; RUM top-5 path (20v/28d); keeper |
| 19 | ext `/compare/crucial-x10-pro-vs-crucial-x10-pro-2tb` | GSC 1c/25i pos 18; keeper |
| 20 | port `/compare/crucial-x6-portable-1tb-vs-crucial-x9-pro` | GSC 1c/22i pos 9.5; keeper |

### Batch 4+ (Tier 3, go/no-go after Batch 1–2 signals)
- Remaining quarantine keepers with any recorded click: ext adata ×3 (HIGH_INTENT overrides), `lacie-rugged-ssd-pro-1tb-vs-samsung-t9`, `kingston-xs2000-4tb-vs-sandisk-extreme-portable-1tb`, `corsair-ex400u-usb4-vs-crucial-x10-pro-2tb`, `crucial-x8-1tb-vs-samsung-t7-500gb`; port `sandisk-extreme-portable-vs-wd-my-passport-ssd-portable-1tb`, `lacie-rugged-ssd-portable-1tb-vs-wd-my-passport-ssd-portable-1tb`, `seagate-one-touch-portable-1tb-vs-wd-my-passport-ssd-portable-1tb`, `netac-zx1-portable-1tb-vs-wd-my-passport-ssd-portable-2tb`, `sandisk-extreme-portable-2tb-vs-wd-my-passport-ssd-portable-2tb`, `crucial-x9-pro-portable-2tb-vs-samsung-t9-portable-2tb`, `crucial-x9-pro-vs-samsung-t7-shield-portable`, `samsung-t7-shield-portable-vs-sandisk-extreme-pro-portable`
- Hubs with demonstrated demand: `/hubs/best-ssd-for-mac` (beacon 2c), `/hubs/fastest-usb-3-2-gen-2x2` (BWMT 22i + beacon 1c + RUM 10v), `/hubs/best-ssd-for-xbox` (RUM 20v), `/hubs/fastest-thunderbolt-external-ssd` (RUM 20v), `/hubs/best-ssd-for-ps5` (GA4 2v)
- Hub pages with **zero** impressions are NOT deepened — they are candidates for the existing quarantine logic instead (separate decision, not this program).

## 4. Content spec (what gets written)

Implementation pattern: per-slug static content objects (mirroring the proven surgical `HIGH_INTENT_BING_SLUGS` / `KEEP_INDEXED_H2H` maps) rendered by one additive section per template. No changes to existing generators (`hubs.ts`, archetypes) in Batches 1–3 — those feed hundreds of pages and are exactly what must NOT be churned.

### Product pages (Batches 1–3 products) — add ONE "Deep Dive" block, 6 subsections, +400–700 net-new words
1. **The short version** — 3–4 sentence decisive verdict unique to this exact capacity/variant.
2. **Sustained-write reality** — spec-derived: what rated read/write means after SLC cache exhaustion on this NAND class; why game-install speeds differ from rated peaks. Category knowledge framing, no fabricated lab numbers.
3. **Endurance math, worked** — the page's actual TBW ÷ realistic daily write × 365 = years of life, in plain language (unique numbers per capacity variant).
4. **Console & device fit** — PS5 / Xbox / Steam Deck / USB4 Mac specifics derived from the page's interface + capacity (format notes, which consoles it works with and why).
5. **Who should skip this drive** — decisive anti-recommendation (1–3 cases). Trust builder; impossible to template.
6. **Questions real searchers asked** — 3–5 FAQ built ONLY from queries with recorded impressions for that page family (BWMT/GSC query log), answered substantively.

### H2H keeper pages — add 2 blocks, +300–500 net-new words
1. **Scenario verdicts** — "Choose A if… / Choose B if…" (4–6 decisive bullets grounded strictly in the spec deltas already on the page).
2. **What the spec table doesn't tell you** — endurance class delta, warranty delta, thermal-class delta, real formatted capacity, shared failure modes ("what neither drive fixes") — the "transformation for additional value" Amazon's originality rule requires.
3. Existing templated FAQ stays unless a real query exists for the pair — then pair-specific Q/A is prepended.

### `/compare` main pages (Batch 3) — additive only
1. **"How to choose in 60 seconds"** — decision framework (interface → capacity → ruggedness → price class) directly answering the `portable ssds comparison` / `buying guide` intent that holds 200+ impressions/month.
2. **One-line verdicts** — annotate the top-10 table rows with "why it ranks here" (one line each).
3. Nothing else on these pages changes — they are the network's best and biggest assets; risk containment is mandatory.

## 5. Workflow per batch (fixed sequence)

1. **Prep (read-only, ~30 min):** pull live HTML of each target page; pull BWMT page rows + beacon rows (`retailer IS NOT NULL`) + GSC page rows for the batch; confirm evidence still holds; capture the per-page baseline table into the batch's RESULT draft.
2. **Draft:** write the per-slug content objects; run the §2 grep gates + a uniqueness self-check (no sentence repeated across pages).
3. **Owner review (Batch 1 only):** present a full sample diff of 1 product page + 1 H2H page for tone sign-off before anything deploys. Later batches: diff summary in chat; owner may spot-check any page.
4. **Ship:** `npm run build` → commit → PAT push → IndexNow both tenants → live spot-check (HTTP 200, new section renders, CTA counts unchanged, robots meta unchanged).
5. **Record:** RESULT block in AGENTS.md with the batch baseline + gate schedule.

## 6. Measurement gates

| Checkpoint | Pull | Per-batch success signals (any one) |
|---|---|---|
| Baseline (batch prep) | BWMT page rows + GSC page rows + beacon (retailer NOT NULL) + RUM paths | table recorded |
| Day +7 | beacon per-URL + BWMT page rows | first incremental beacon click on any batch page |
| Day +14 | full pull (BWMT + GSC + GA4 + RUM + beacon) | BWMT page CTR lift ≥2pp on any page with ≥20i; or BWMT page impressions +20% (depth surfaces more queries) |
| Day +30 (batch verdict) | full pull | ≥1 incremental beacon-attributed click on ≥15% of batch pages |

- **Google-side signals** (GSC 7d/28d impressions on deepened keepers) are recorded every pull but are **bonus**, not pass/fail — months-scale expectation per the demotion diagnosis.
- **Alert (not rollback):** any page's BWMT impressions drop >50% post-deploy → flag + investigate before next batch. Additive content reverts per-page by removing its content-map entry (trivial, no site-wide effect).
- **Program go/no-go after Batch 2 (≈ Week 4–5):** if Batch 1–2 produce zero beacon clicks AND zero CTR/impression movement on ≥20i pages, present findings to owner before committing further effort (Tier 3 proceeds only on positive signals).

## 7. Owner decision points

1. **Approve this plan** (tiers, content spec, guardrails, gates).
2. **Approve Batch 1 page list** + the sample tone diff (workflow step 3).
3. **Per-batch:** review diff summary; spot-checks optional; stop authority after any batch.
4. **Titles stay out** — any retitle remains gated on the Oct 31 BWMT verdict + separate approval.
5. **Effort/cost:** AI-written, owner-approved; no API keys, no spend, no new tooling. Batch 1 ≈ one AI session.

## 8. Out of scope (explicitly)

New URLs/templates · thin-surface re-expansion · price display or PAAPI · Amazon review scraping · AdSlot/AdSense/consent code · affiliate href/rel/tag/linkCode surface · translated/multilingual content · backlinks or paid promotion of any kind · title/meta/H1 rewrites (separate gate).
