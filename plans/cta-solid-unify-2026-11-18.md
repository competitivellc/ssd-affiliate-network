# CTA Unification & Solid-Primary Pass — Implementation Plan (2026-11-18)

**Status: AWAITING OWNER APPROVAL — DO NOT EXECUTE.**
**Requested by:** owner — "create a complete structured implementation plan for A [solid-style the primary CTA + unify network CTA labels]. Do not execute the plan without my approval."
**Companion context:** the owner's screenshot of `/products/<slug>` "Where to Buy" shows the white/ghost primary Amazon button (`Check on Amazon →`). Approved scope (owner, same day): implement **A** only. B (PAAPI live price/availability in this block), C (B&H/Newegg rows), D (per-capacity Buy buttons) are separate, unscheduled options.

---

## 1. Objective & why now

Two polish defects on the money surfaces:

1. **Inconsistent CTA copy network-wide.** Today's affiliate buy-button renders three different labels for the same action. It hurts (a) consistency/polish, (b) beacon attribution splits one intent across three strings, (c) SERP/review quality readers see sloppy templating — the exact thing externalssds is being judged on for the "Low value content" flag.

2. **Weakest-looking CTAs where they matter most.** A small number of high-intent CTAs render as faint ghost buttons instead of the solid slab used everywhere else.

**Non-goals:** no conversion-rate claims (at ~10–20 humans/day we cannot measure lift honestly — judge this by consistency and craft only); no price display; no link-surface rewrite; no ad/consent changes; no copy invented beyond the CTA string.

---

## 2. Evidence (collected 2026-11-18, this session)

### 2.1 CTA sites — label and style (from live source)

| # | File:line | Current label | Style today | Surface |
|---|---|---|---|---|
| 1 | `src/components/AffiliateButton.astro:62` | `See Price on {retailer} →` | **solid** (`bg-blue-800`, w-full) | All ProductGrid/ProductCard grids (home, hubs, category, brands, compare grid) |
| 2 | `src/components/ComparisonTable.astro:74` | `See Price on {retailer} →` | **solid** | Compare table buy cells |
| 3 | `src/pages/best/[slug].astro:175` | `See Price on {retailer} →` | **ghost** (text-sm font-semibold) | Best pages buy link |
| 4 | `src/pages/compare.astro:619` | `See Price on {retailer} →` | **solid** | Best-Price card |
| 5 | `src/pages/compare.astro:552` | `Check Price on {retailer} →` | **solid** T7 card | Buyer's Price Query card |
| 6 | `src/pages/compare.astro:751` | `Check on {retailer} →` | **solid** | Compare block |
| 7 | `src/pages/compare.astro:935` | `Check on {retailer}` (**no →**) | **solid** | Compare block |
| 8 | `src/pages/compare/[slug].astro:335` | `Check on {retailer} →` | **ghost** (text-sm font-semibold) + ll1 | H2H money CTA |
| 9 | `src/pages/hubs/[slug].astro:261` | `Check on {retailer}` (**no →**) | plain text link | Hubs spec-table buy cell |
| 10 | `src/pages/products/[slug].astro:445` | `Check on {retailer} →` | **ghost** — *the screenshot's "Where to Buy" button* | Product page primary |
| 11 | `src/pages/products/[slug].astro:858` | `Check on {retailer} →` | **solid** sticky sidebar | Product page sidebar |
| 12 | `src/pages/products/[slug]/[retailer].astro:261` | `Check on {retailer} →` | **solid** | Per-retailer page |

Secondary (keep as-is): "Other retailers" rows (`{retailer} →` / `Amazon (used) →` / `Amazon (used)`), AffiliateButton's "Pricing temporarily unavailable — click to view on {retailer}" note, internal links, Footer disclosure, `As an Amazon Associate` text.

### 2.2 Beacon cta_label histogram (30d, retailer rows only)

| Label | Real clicks |
|---|---|
| `Check on Amazon →` | 36 |
| `See Price on Amazon →` | 15 |
| `See Price on Newegg →` | 2 |
| `Check on Amazon` (no arrow) | 1 |
| scanner/junk rows (`null`, `t`, `x`) | excluded |

Reading: the high-intent surfaces log `Check on Amazon →`; homepage grid cards log `See Price on Amazon →`. One intent — one string — three texts.

---

## 3. Hard guardrails (unchanged from repo discipline, enforced by grep pre-push)

1. **Zero changes** to `href=`, `rel=`, `target=`, `data-affiliate=`, `data-product-slug`, `useCartExtend`/`linkCode=ll1`, tag values, `data-cta` mechanics (text change IS the goal), `GeoAffiliateLink` rewrite logic, and disclosure text (both placements).
2. **No new URL surface**, request/response caching unchanged, robots/quarantine untouched, JSON-LD types untouched.
3. No prices, no price-stamps activation, no availability claims, no urgency copy — pricing display stays gated to a future PAAPI-enabled deploy (option B/plan).
4. No AdSlot/Consent Mode/GeoAffiliateLink buildAffiliateUrl no-ops. No EEA gate touched.
5. One deploy for the whole change set → one `git revert` restores everything.
6. Compliance checklist on every touched page: Amazon disclosure present; CTA visually separable from ads; no copy resembling AdSense; no incentive language.

---

## 4. Design decisions (owner signs off — each has a recommendation)

**D1 — Unified label string.** Recommended: **`Check Price on {retailer} →`**
- Pros: T7 card (best-performing Compare block, `compare.astro:552`) already trains this string; matches Amazon's own SiteStripe phrasing ("Check price"); works verbatim for future B&H/Newegg rows; unambiguous in a world where we display **no** live price.
- Alternative (flag it): **`See Price on {retailer} →`** — reuses the #2 beacon string but reads as a promise of a visible price we don't show; the network's two most-clicked strings both become the same third string here — either is defensible; we pick one.
- Do NOT keep `Check on {retailer}` (weakest; implicit noun; some sites already use it without the arrow).

**D2 — Solid style recipe.** Recommended: **keep the existing `bg-blue-800 text-white border-blue-800 hover:bg-blue-900` recipe** (identical to AffiliateButton primary + T7 card + 6 page CTAs). Alternative: switch to Amazon-adjacent orange (#FF9900) for brand recognition — rejected as nonchalant with Google's "don't imply Amazon endorsement" guidance and alien to the site palette; blue matches tenant-neutral Google-friendliness already live.

**D3 — Which sites change styling.** Sites 3, 8, 10 (ghosts) become solid; sites 9 (hubs spec-table cell as plain text link) **stays a text link** — flipping 78 table rows to full-width buttons wrecks density; decision explicitly requested from owner. All 12 sites change label → `Check Price on {retailer} →` (including 7 & 9 gaining the trailing ` →` for parity).

**D4 — "Other retailers" secondary rows.** Stay text-link, keep `{retailer} →` labels — they're deliberately tertiary. Not part of D1.

**D5 — `Amazon (used) →` rows.** Unchanged (Amazon Program requires no change here).

---

## 5. Implementation (exact edits)

### Step 0 — Baseline capture (read-only, ~2 min, no deploy)
- `git diff` must be clean at baseline; record current CTA census counts (grep count of each of the 3 strings = 12 sites, Edition A/B) into the PR/issue note.

### Step 1 — `src/components/AffiliateButton.astro` (1 line)
- Comments lines 4–5: update doc comment strings to the unified label phrasing (documentation-only).
- Line 62: `` `See Price on ${linkPrice.retailer} →` `` → `` `Check Price on ${linkPrice.retailer} →` ``.

### Step 2 — label unification (exact replacements, no other prose)
| File | From | To |
|---|---|---|
| `ComparisonTable.astro:74` | `See Price on ` | `Check Price on ` |
| `best/[slug].astro:175` | `See Price on ` | `Check Price on ` |
| `compare.astro:619` | `See Price on ` | `Check Price on ` |
| `compare.astro:552` | already unified — no-op | (leave) |
| `compare.astro:751` | `Check on ` | `Check Price on ` |
| `compare.astro:935` | `Check on ` (no arrow) | `Check Price on ` + ` →` |
| `compare/[slug].astro:335` | `Check on ` | `Check Price on ` |
| `hubs/[slug].astro:261` | `Check on ` (no arrow, no trailing space) | `Check Price on ` + ` →` |
| `products/[slug].astro:445` | `Check on ` | `Check Price on ` |
| `products/[slug].astro:858` | `Check on ` | `Check Price on ` |
| `products/[slug]/[retailer].astro:261` | `Check on ` | `Check Price on ` |
| `AffiliateButton.astro:62` | handled in Step 1 | |

### Step 3 — solid styling (3 sites)
- `products/[slug].astro:445`: className `mb-4 text-sm` → `mb-4 w-full justify-center py-3 text-sm font-semibold rounded-lg bg-blue-800 text-white border-blue-800 hover:bg-blue-900 [&_svg]:text-white` (parity with the :858 sticky sidebar recipe).
- `compare/[slug].astro:335`: className `text-sm font-semibold` → `w-full justify-center py-2.5 text-sm font-semibold rounded-lg bg-blue-800 text-white border-blue-800 hover:bg-blue-900 [&_svg]:text-white`.
- `best/[slug].astro:175`: className `text-sm font-semibold` → `justify-center py-2.5 px-5 text-sm font-semibold rounded-lg bg-blue-800 text-white border-blue-800 hover:bg-blue-900 [&_svg]:text-white`.

### Step 4 — Compliance & verification greps
- `git diff` must show **zero** matches for `href=`, `rel=`, `target=`, `linkCode=`, `data-affiliate=`, `data-product-slug=`, `tag=`.
- `git diff` must show label changes only for the 12 rows above + 3 className hunks.
- Build: `npm run build` (server build must complete; Astro SSR compile is not proof of runtime — see Batch-1 lesson; hence Step 5).

### Step 5 — Deploy & live verification (one deploy)
1. `git add` + `commit` (message: `feat(cta): unify affiliate CTA copy to "Check Price on {retailer} →" + solid-primary pass on 3 ghost CTAs`) → PAT push.
2. IndexNow both tenants (`138`/`128`, all 200).
3. Wait for Pages "Active", then verify **across both tenants** (PoP propagation lag ~10–25 min per this week's incidents — re-check at T+5/15/25):
   - Home: grid cards CTA label = unified string; buttons still `bg-blue-800` solid.
   - `/compare`: ComparisonTable buy cell; topBest card; T7 card — all unified string.
   - `compare/sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb` (ext): H2H money CTA renders **solid** with unified string.
   - `/products/crucial-x9-pro-2tb` (ext): Where-to-Buy renders **solid** with unified string (the owner's screenshot case) + disclosure intact.
   - `/products/crucial-x9-pro-1tb` (ext, unmapped control): same.
   - `/hubs/cheapest-2tb-external-ssd` (hubs): text link shows unified string + arrow.
   - `/best/usb-c`-family page: ghost link now solid.
   - `products/crucial-x9-pro-2tb/amazon` (ext per-retailer page): solid + unified string.
   - Beacon: 1 manual test click from each of 2 representative CTAs → rows land with `cta_label = "Check Price on Amazon →"`.
4. Verify zero affiliate/href/rel/tag diff in finals: re-run Step 4 greps on deployed commit.
5. Record a one-paragraph release note in `AGENTS.md` `RESULT (2026-11-18)` addendum (docs push OK to bundle).
6. Day+7 / Day+14 measurement gates (BWMT CTR on `/products/crucial-x9-pro-2tb` & ext `/compare`; beacon cta_label histogram one week post-deploy; GA4 `affiliate_click` = 0 expected baseline; spot check 'AI Assistant' channel — all bonus, not pass/fail since conversion lift is not measurable at this volume).

### Rollback
Single `git revert <commit>` + PAT push + IndexNow both tenants. Zero state moved.

---

## 6. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Solid styling regresses mobile overflow | Low | Cosmetic | Step 5 visual check at 375px; `justify-center` + `w-full` recipes already battle-tested in grid |
| Label test-interference with Amazon ll1 semantics | None (text-only; ll1 in `useCartExtend` unchanged) | — | grep gates |
| Google re-crawl flux from CTA text change | Very low | Minor ranking churn window (days) | Only text nodes; zero HTML structure/indexing logic; hiatus between deploys respected (this ships before any Batch-2 gate) |
| Beacon historical comparability breaks | Certain (label histogram splits pre/post) | Measurement nuance | Note in RESULT; additive histogram by label remains truthful per-transaction |
| Accidental price/urgency copy slip-in | None (not in diff) | Amazon policy breach | Diff grep + owner eyeball of 1 diff hunk |

---

## 7. Effort & cost

~30–45 minutes total (edits ≈ 25 lines across 11 files, 1 build, 2 × IndexNow, ~10 live fetches). No D1 schema, no API keys, no new tooling, no spend. One commit.

---

## 8. Out of scope (explicitly)

B (PAAPI live PriceStamp/availability in this block — needs Creators API approval) · C (B&H/Newegg retailer rows — needs affiliate applications + FTC disclosure extension) · D (per-capacity Buy buttons inside this card) · AdSense · WAF/PAAPI · price display anywhere · title/H1/meta/quarantine · unified `Amazon (used)` label (stays) · secondary "Other retailers" rows (stay text-link) · hubs spec-table cell styling (stays text link per D3).

---

## 9. Approval checklist (all required before execution)

1. **D1** approved: unified string = `Check Price on {retailer} →` (or say the word: `See Price on {retailer} →`).
2. **D2** approved: keep `bg-blue-800 …` solid recipe network-wide (or name the alternative).
3. **D3** approved: ghosts go solid at products:445, compare/[slug]:335, best:175 — and hubs:261 remains a text link.
4. **D5** OK: `Amazon (used) →` unchanged.
5. Deploy authorized (we will not run it before your go; the change lands as a single revert-able commit).
6. `AGENTS.md` one-line release note approved (included in the same push).
