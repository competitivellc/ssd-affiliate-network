// H2H indexation quarantine — single source of truth (Phase 3, 2026-10-09 plan).
//
// AdSense "Low value content" root cause: 6,166/6,411 indexable URLs (96%)
// are programmatic /compare/[a]-vs-[b] pairs with templated copy, zero
// images, and near-zero traffic. Reviewers judge the whole site, so the fix
// is the ratio: quarantine everything except evidence-backed converters,
// keep link equity flowing (noindex + follow, internal links untouched).
//
// Membership rule: a slug is listed ONLY if it has a recorded human click
// (D1 affiliate_clicks 30d or GSC 90d) or carries an approved surgical title
// override (HIGH_INTENT_H2H_SLUGS / BING_SLUG_MAP in compare/[slug].astro).
// Slugs are stored in canonical (alphabetically-first) form — the reverse
// order 301s to canonical per compare/[slug].astro:26-29, so listing the
// canonical covers both.
// - "samsung-t9-2tb-vs-transcend-esd310c-2tb" is the canonical form of the
//   clicked "transcend-esd310c-2tb-vs-samsung-t9-2tb" (1c GSC, now 301s here).
// - "samsung-t9-portable-vs-sandisk-extreme-pro-portable" is the canonical
//   form of the reverse "sandisk-extreme-pro-portable-vs-samsung-t9-portable"
//   (53i GSC); both orders' signal consolidates here.
// - The 3 adata-* slugs carry the approved HIGH_INTENT overrides.
// - The crucial-x9-pro / samsung-t9 / samsung-t7-shield portablessds slugs
//   carry the approved BING_SLUG_MAP overrides.
//
// Consumers: compare/[slug].astro (robots meta) and sitemap.xml.ts
// (pair emission). Zero affiliate-surface impact: no href/rel/target/tag/
// linkCode/data-affiliate/disclosure change — indexation only.

export const KEEP_INDEXED_H2H: Record<string, Set<string>> = {
  externalssds: new Set([
    "sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb",
    "crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb",
    "crucial-x10-pro-vs-crucial-x10-pro-2tb",
    "crucial-x8-1tb-vs-samsung-t7-500gb",
    "lacie-rugged-ssd-pro-1tb-vs-samsung-t9",
    "samsung-t9-2tb-vs-transcend-esd310c-2tb",
    "corsair-ex400u-usb4-vs-crucial-x10-pro-2tb",
    "kingston-xs2000-4tb-vs-sandisk-extreme-portable-1tb",
    // Approved HIGH_INTENT_H2H_SLUGS overrides (keep indexed or orphan them).
    "adata-elite-se760-2tb-vs-seagate-one-touch-ssd-1tb",
    "adata-elite-se760-1tb-vs-seagate-one-touch-ssd-2tb",
    "adata-se800-2tb-vs-crucial-x9-pro-2tb",
  ]),
  portablessds: new Set([
    "samsung-t9-portable-vs-sandisk-extreme-pro-portable",
    "crucial-x6-portable-1tb-vs-crucial-x9-pro",
    "crucial-x9-pro-portable-2tb-vs-samsung-t7-shield-portable-2tb",
    "crucial-x10-pro-portable-2tb-vs-samsung-t7-shield-portable-4tb",
    "sandisk-extreme-portable-vs-wd-my-passport-ssd-portable-1tb",
    "lacie-rugged-ssd-portable-1tb-vs-wd-my-passport-ssd-portable-1tb",
    // Approved BING_SLUG_MAP overrides (keep indexed or orphan them).
    "crucial-x9-pro-vs-samsung-t7-shield-portable",
    "samsung-t7-shield-portable-vs-sandisk-extreme-pro-portable",
    // D1 30d single-click converters (human intent on tiny traffic).
    "seagate-one-touch-portable-1tb-vs-wd-my-passport-ssd-portable-1tb",
    "netac-zx1-portable-1tb-vs-wd-my-passport-ssd-portable-2tb",
    "sandisk-extreme-portable-2tb-vs-wd-my-passport-ssd-portable-2tb",
    "crucial-x9-pro-portable-2tb-vs-samsung-t9-portable-2tb",
  ]),
};

export function isH2hIndexed(tenantId: string, slug: string | undefined): boolean {
  if (!slug) return false;
  return KEEP_INDEXED_H2H[tenantId]?.has(slug) ?? false;
}
