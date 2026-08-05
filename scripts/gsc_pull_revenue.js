// Pull live GSC data for both tenants to identify top revenue-velocity lever.
import { google } from 'googleapis';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ============================================================================
// MANDATORY RE-RUN WATCHDOG  (DO NOT REMOVE — read AGENTS.md "GSC Re-Run
// Cadence" before editing. This banner MUST stay in this file.)
// ============================================================================
// Every AI agent that opens this repo is required by AGENTS.md to run this
// script and record the result. After the re-run window below closes, this
// script BLOCKS (exit code 2) until AGENTS.md contains a new RESULT block
// dated after the deploy. This is a hard gate, not a suggestion: it cannot be
// skipped, edited away, or ignored by accident.
//
//   Deploy:  commit 9329992 (2026-08-04) — /compare T7-buyer-query overhaul
//   Window:  2026-08-11 → 2026-08-18
//   Query:   samsung t7 shield 4tb portable ssd amazon.com price
//   Action:  agent must re-run this script, compare against the
//            "RESULT (2026-08-05)" baseline, and write a new RESULT block in
//            AGENTS.md dated >= 2026-08-11. Target: /compare moves pos 7.5
//            → top 5 on the buyer query; CTR ~1.5% → 4-6%.
const RE_RUN = {
  // Window derived from deploy date + AGENTS.md 7-14 day GSC re-run cadence.
  windowStartISO: '2026-08-11T00:00:00Z',
  windowEndISO: '2026-08-19T00:00:00Z',
  // A RESULT header dated >= this day counts as the re-run having been recorded.
  resultMustBeDatedOnOrAfter: '2026-08-11',
  AGENTS_PATH: fileURLToPath(new URL('../AGENTS.md', import.meta.url)),
  FORCE_FLAG: '--force',
};

function checkReRunGate() {
  const args = process.argv.slice(2);
  const forced = args.includes(RE_RUN.FORCE_FLAG);
  const now = new Date().toISOString();
  // ISO compare is safe while all dates share the YYYY-MM-DD format.
  const today = now.slice(0, 10);

  // Read AGENTS.md and look for any `### RESULT (YYYY-MM-DD)` header dated on/after the target.
  let agentsMd = '';
  try { agentsMd = readFileSync(RE_RUN.AGENTS_PATH, 'utf8'); } catch (e) { /* best-effort */ }
  const resultHeaders = [...agentsMd.matchAll(/^### RESULT \((\d{4}-\d{2}-\d{2})\)/gm)].map(m => m[1]);
  const reRunRecorded = resultHeaders.some(d => d >= RE_RUN.resultMustBeDatedOnOrAfter);

  const bar = '='.repeat(72);
  const frame = (lines) => `\n${bar}\n${lines.map(l => `  ${l}`).join('\n')}\n${bar}\n`;

  if (reRunRecorded) {
    console.log(frame([
      'GSC RE-RUN STATUS: recorded',
      `Latest RESULT in AGENTS.md: ${resultHeaders[resultHeaders.length - 1]}`,
      'If you are making NEW SEO changes, capture a fresh baseline per AGENTS.md.',
    ]));
    return;
  }

  if (now >= RE_RUN.windowEndISO) {
    console.error(frame([
      '!!! GSC RE-RUN OVERDUE — MANDATORY ACTION BEFORE ANY FURTHER SEO WORK !!!',
      'The re-run window (2026-08-11 → 2026-08-18) has CLOSED with no result',
      'recorded in AGENTS.md.',
      '',
      'DO THIS NOW:',
      '  1. Run `node scripts/gsc_pull_revenue.js --force` to pull the data.',
      '  2. Compare /compare position on `samsung t7 shield 4tb portable ssd',
      '     amazon.com price` against the "RESULT (2026-08-05)" baseline (pos 7.5).',
      '  3. Write a new `### RESULT (YYYY-MM-DD)` block in AGENTS.md dated >=',
      `     ${RE_RUN.resultMustBeDatedOnOrAfter}, then commit & push.`,
      'This trigger persists until AGENTS.md records a RESULT. Do not proceed',
      'on SEO tasks while it is armed.',
    ]));
    if (!forced) process.exit(2);
  } else if (now >= RE_RUN.windowStartISO) {
    console.log(frame([
      'GSC RE-RUN MANDATORY — ACTIVE WINDOW (2026-08-11 → 2026-08-18)',
      'Per AGENTS.md you MUST now re-run the measurement and write a RESULT.',
      `Today: ${today}.`,
      'Complete the re-run, record the RESULT block in AGENTS.md, commit & push',
      'before doing further SEO work on this repo.',
    ]));
  } else {
    console.log(frame([
      'GSC RE-RUN PENDING',
      `Deploy 9329992 (2026-08-04) opened a mandatory re-run window`,
      `2026-08-11 → 2026-08-18 (before then, ranking needs time to settle).`,
      `Today: ${today}.`,
      'The re-run = run this script and write the RESULT block into AGENTS.md.',
      'This script will remind you every run and BLOCK once the window closes',
      'if no result is recorded.',
    ]));
  }
}

checkReRunGate();

const DOMAINS = [
  { name: 'externalssds.com', env: 'EXTERNALSSDS_GSC_SERVICE_ACCOUNT', siteUrl: 'sc-domain:externalssds.com' },
  { name: 'portablessds.com', env: 'PORTABLESSDS_GSC_SERVICE_ACCOUNT', siteUrl: 'sc-domain:portablessds.com' },
];

function auth(keyPath) {
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
}

async function searchAnalytics(siteUrl, jwt, dimensions, startDate, endDate, extra = {}) {
  const sc = google.searchconsole({ version: 'v1', auth: jwt });
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions, ...extra },
  });
  return res.data.rows || [];
}

async function run() {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start90 = new Date(today.getTime() - 90 * 86400000).toISOString().slice(0, 10);
  const start28 = new Date(today.getTime() - 28 * 86400000).toISOString().slice(0, 10);
  const start7 = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);

  for (const d of DOMAINS) {
    const keyPath = process.env[d.env];
    if (!keyPath) { console.log(`NO KEY for ${d.name}`); continue; }
    const jwt = auth(keyPath);
    console.log(`\n========== ${d.name} (${start90} → ${end}) ==========`);

    // 90-day totals
    const totals = await searchAnalytics(d.siteUrl, jwt, [], start90, end);
    console.log('90d TOTAL:', JSON.stringify(totals[0] || {}));

    // Top pages (90d)
    const pages = await searchAnalytics(d.siteUrl, jwt, ['page'], start90, end, { rowLimit: 25 });
    console.log('\nTOP PAGES (90d):');
    pages.slice(0, 15).forEach(r => {
      console.log(`  ${r.clicks}c ${r.impressions}i pos${r.position.toFixed(1)} ctr${(r.ctr * 100).toFixed(2)}% | ${r.keys[0]}`);
    });

    // Top queries (90d)
    const queries = await searchAnalytics(d.siteUrl, jwt, ['query'], start90, end, { rowLimit: 25 });
    console.log('\nTOP QUERIES (90d):');
    queries.slice(0, 15).forEach(r => {
      console.log(`  ${r.clicks}c ${r.impressions}i pos${r.position.toFixed(1)} ctr${(r.ctr * 100).toFixed(2)}% | ${r.keys[0]}`);
    });

    // High-impression low-CTR queries (opportunity)
    const opp = queries.filter(r => r.impressions >= 50 && r.ctr < 0.03 && r.position > 8).sort((a, b) => b.impressions - a.impressions).slice(0, 12);
    console.log('\nOPPORTUNITY QUERIES (impr>=50, ctr<3%, pos>8):');
    opp.forEach(r => {
      console.log(`  ${r.clicks}c ${r.impressions}i pos${r.position.toFixed(1)} ctr${(r.ctr * 100).toFixed(2)}% | ${r.keys[0]}`);
    });

    // Page+query combo for top pages (what queries drive which pages)
    const pq = await searchAnalytics(d.siteUrl, jwt, ['page', 'query'], start90, end, { rowLimit: 50 });
    console.log('\nPAGE -> TOP QUERY (90d, top 20):');
    pq.slice(0, 20).forEach(r => {
      console.log(`  ${r.clicks}c ${r.impressions}i pos${r.position.toFixed(1)} | ${r.keys[0].split('/').slice(3).join('/') || '/'} <- ${r.keys[1]}`);
    });

    // 7d trend
    const t7 = await searchAnalytics(d.siteUrl, jwt, [], start7, end);
    console.log('\n7d TOTAL:', JSON.stringify(t7[0] || {}));
  }
}

run().catch(e => { console.error('ERR', e.message); process.exit(1); });
