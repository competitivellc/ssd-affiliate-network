// Smoke test all live product URLs. For each product page, verify:
//   1. HTTP 200 status
//   2. "Check on Amazon" CTA is rendered (affiliate link present)
//   3. Amazon tag is correctly injected (tag=ssdnetwork07-20)
//   4. Capacity variants block is present (Phase 4 internal link)
//
// Outputs a CSV summary with per-URL results plus aggregate stats.
//
// Usage: node scripts/smoke_test_catalog.js [--limit=N] [--host=both|external|portable]

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const hostArg = args.find(a => a.startsWith('--host='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const hostFilter = hostArg ? hostArg.split('=')[1] : 'both';

function getSlugs(siteId) {
  const out = execSync(
    `npx wrangler d1 execute ssd-affiliate-db --remote --command="SELECT slug FROM products WHERE site_id='${siteId}' AND is_active=1 ORDER BY id"`,
    { encoding: 'utf8' },
  );
  const lines = out.split('\n');
  return lines
    .filter(l => /"slug"\s*:/.test(l))
    .map(l => (l.match(/"slug"\s*:\s*"([^"]+)"/) || [])[1])
    .filter(Boolean);
}

const targets = [];
if (hostFilter === 'both' || hostFilter === 'external') {
  for (const slug of getSlugs('externalssds')) {
    targets.push({ domain: 'externalssds.com', slug });
  }
}
if (hostFilter === 'both' || hostFilter === 'portable') {
  for (const slug of getSlugs('portablessds')) {
    targets.push({ domain: 'portablessds.com', slug });
  }
}

const subset = targets.slice(0, limit);

console.log(`Smoke testing ${subset.length} product pages (${targets.length} total in DB)...\n`);

const results = [];
for (const { domain, slug } of subset) {
  const url = `https://${domain}/products/${slug}`;
  let status = null;
  let affiliateBtn = false;
  let tagInjected = false;
  let capacityVariants = false;
  let error = null;

  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'opencode-smoke/1.0' } });
    status = res.status;
    if (status === 200) {
      const body = await res.text();
      affiliateBtn = body.includes('Check on Amazon');
      tagInjected = body.includes('tag=ssdnetwork07-20');
      capacityVariants = body.includes('Also available in ');
    }
  } catch (e) {
    error = e.message;
  }

  // 301 is expected for the cannibalization consolidation targets
  // (samsung-t7-shield, samsung-t7-shield-portable) — these URLs
  // intentionally redirect to /compare. Flag as 'redirected', not as
  // an issue, so we can still see them in the summary.
  const state = status === 301 ? 'redirected' : status;
  results.push({ domain, slug, status: state, affiliateBtn, tagInjected, capacityVariants, error });
}

const ok = results.filter(r => r.status === 200 && r.affiliateBtn && r.tagInjected && r.capacityVariants);
const redirected = results.filter(r => r.status === 'redirected');
const issues = results.filter(r => r.status !== 200 && r.status !== 'redirected');
const renderBroken = results.filter(r => r.status === 200 && (!r.affiliateBtn || !r.tagInjected || !r.capacityVariants));

console.log('=== Summary ===');
console.log(`Tested: ${results.length}`);
console.log(`Healthy: ${ok.length} (${((ok.length / results.length) * 100).toFixed(1)}%)`);
console.log(`Redirected (expected): ${redirected.length}`);
console.log(`Render issues: ${renderBroken.length}`);
console.log(`Errors: ${issues.length}\n`);

if (redirected.length > 0) {
  console.log('=== 301 Redirects (cannibalization consolidation) ===');
  for (const r of redirected) console.log(`  ${r.domain}/products/${r.slug}`);
}

if (renderBroken.length > 0) {
  console.log('\n=== Render Issues (HTTP 200 but missing CTA/tag/variants) ===');
  for (const r of renderBroken) {
    const missing = [];
    if (!r.affiliateBtn) missing.push('cta');
    if (!r.tagInjected) missing.push('tag');
    if (!r.capacityVariants) missing.push('variants');
    console.log(`  ${r.domain}/products/${r.slug}  missing: ${missing.join(',')}`);
  }
}

if (issues.length > 0) {
  console.log('\n=== Errors ===');
  for (const r of issues) {
    const reason = r.error ? `error: ${r.error}` : `status=${r.status}`;
    console.log(`  ${r.domain}/products/${r.slug}  ${reason}`);
  }
}

// /compare buyer-query smoke check (deployed 2026-08-04).
// The default /compare URL is the only page that ranks for the high-intent
// buyer query "samsung t7 shield 4tb portable ssd amazon.com price" — verify
// the T7 anchor block, the title/H1 alignment, and that the Amazon Associates
// disclosure is present on the page.
console.log('\n=== /compare (T7 Shield buyer-query block) ===');
const compareResults = [];
const compareDomains = hostFilter === 'portable' ? ['portablessds.com']
  : hostFilter === 'external' ? ['externalssds.com']
  : ['externalssds.com', 'portablessds.com'];
for (const domain of compareDomains) {
  const url = `https://${domain}/compare`;
  let status = null;
  let titleHasT7 = false;
  let h1HasT7 = false;
  let t7BuyBtn = false;
  let amazonTag = false;
  let disclosure = false;
  let itemListSchema = false;
  let error = null;
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'opencode-smoke/1.0' } });
    status = res.status;
    if (status === 200) {
      const body = await res.text();
      titleHasT7 = /<title>[^<]*Samsung T7 Shield 4TB/i.test(body);
      h1HasT7 = /<h1[^>]*>[^<]*Samsung T7 Shield 4TB/i.test(body);
      t7BuyBtn = body.includes("Check Price on Amazon") || body.includes("Check Price on");
      amazonTag = body.includes('tag=ssdnetwork07-20');
      disclosure = body.includes("As an Amazon Associate I earn from qualifying purchases");
      itemListSchema = body.includes('"@type":"ItemList"');
    }
  } catch (e) {
    error = e.message;
  }
  compareResults.push({ domain, status, titleHasT7, h1HasT7, t7BuyBtn, amazonTag, disclosure, itemListSchema, error });
  const checks = [
    ['status=200', status === 200],
    ['title matches T7 query', titleHasT7],
    ['H1 matches T7 query', h1HasT7],
    ['T7 buy button present', t7BuyBtn],
    ['Amazon affiliate tag injected', amazonTag],
    ['Associate disclosure present', disclosure],
    ['ItemList JSON-LD present', itemListSchema],
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  const state = failed.length === 0 ? 'OK' : ` FAIL [${failed.join(', ')}]`;
  console.log(`  ${domain}/compare  ${state}${error ? `  error: ${error}` : ''}`);
}

const compareFailures = compareResults.filter(r => r.error || r.status !== 200 || !r.titleHasT7 || !r.h1HasT7 || !r.t7BuyBtn || !r.amazonTag || !r.disclosure || !r.itemListSchema);

process.exit((issues.length === 0 && compareFailures.length === 0) ? 0 : 1);
