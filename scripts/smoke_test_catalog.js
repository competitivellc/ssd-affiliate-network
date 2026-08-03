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

  results.push({ domain, slug, status, affiliateBtn, tagInjected, capacityVariants, error });
}

const ok = results.filter(r => r.status === 200 && r.affiliateBtn && r.tagInjected && r.capacityVariants);
const issues = results.filter(r => !(r.status === 200 && r.affiliateBtn && r.tagInjected && r.capacityVariants));

console.log('=== Summary ===');
console.log(`Tested: ${results.length}`);
console.log(`Healthy: ${ok.length} (${((ok.length / results.length) * 100).toFixed(1)}%)`);
console.log(`Issues: ${issues.length}\n`);

if (issues.length > 0) {
  console.log('=== Issues ===');
  for (const r of issues) {
    const reason = r.error
      ? `error: ${r.error}`
      : `status=${r.status} btn=${r.affiliateBtn} tag=${r.tagInjected} vars=${r.capacityVariants}`;
    console.log(`  ${r.domain}/products/${r.slug}  ${reason}`);
  }
}

if (limit === Infinity) {
  console.log('\n=== Healthy URLs ===');
  for (const r of ok) {
    console.log(`  ${r.domain}/products/${r.slug}`);
  }
}

process.exit(issues.length === 0 ? 0 : 1);
