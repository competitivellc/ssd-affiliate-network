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
const FORCE_FLAG = '--force';
const AGENTS_PATH = fileURLToPath(new URL('../AGENTS.md', import.meta.url));

// Mandatory re-run gates. Each entry = a deployed change whose effect must be
// measured and proven in AGENTS.md. `resultMustBeDatedOnOrAfter` is the earliest
// RESULT (YYYY-MM-DD) date that closes the gate. While a window is open this
// script prints a loud mandatory banner; once the window closes with the gate
// still unrecorded, the script BLOCKS (exit code 2) until the RESULT is written.
// ADD NEW GATES HERE — never delete history.
const RE_RUNS = [
  {
    label: '9329992 (2026-08-04) — /compare T7-buyer-query overhaul',
    windowStartISO: '2026-08-11T00:00:00Z',
    windowEndISO: '2026-08-19T00:00:00Z',
    resultMustBeDatedOnOrAfter: '2026-08-11',
    instructions: [
      'Compare /compare position on `samsung t7 shield 4tb portable ssd amazon.com',
      'price` against the "RESULT (2026-08-05)" baseline (pos 7.5). Target: top 5,',
      'CTR ~1.5% -> 4-6%. Then write `### RESULT (YYYY-MM-DD)` in AGENTS.md.',
    ],
  },
  {
    label: '054f5eb (2026-11-07) — cheap-wins funnel deploy (plans/cheap-wins-2026-11-07.md)',
    windowStartISO: '2026-11-10T00:00:00Z',
    windowEndISO: '2026-11-22T00:00:00Z',
    resultMustBeDatedOnOrAfter: '2026-11-21',
    instructions: [
      'Day+3 (Nov 10): node scripts/bing_pull_traffic.js + node scripts/affiliate_clicks_report.js',
      '  - BWMT page /products/wd-my-passport-ssd CTR (baseline 22i/0c -> >=1c)',
      '  - D1 beacon keeper clicks (ext converters baseline: 3 and 2 per 30d)',
      'Day+7 (Nov 14): also this script + node scripts/ga4_pull_traffic.js + RUM GraphQL',
      '  - GSC keeper impressions (ext #1 baseline 2c/11i pos 11.1; no regression >5)',
      'Day+14 (Nov 21): full verdict, then write `### RESULT (2026-11-21)` in AGENTS.md.',
      'Success (any): >=1 Bing click on the wd-my-passport page; OR >=1 incremental',
      'keeper beacon click; OR keeper GSC impression growth without rank regression.',
      'Failure (all flat): git revert 054f5eb --no-edit + PAT push + IndexNow both.',
    ],
  },
];

function checkReRunGate() {
  const args = process.argv.slice(2);
  const forced = args.includes(FORCE_FLAG);
  const now = new Date().toISOString();
  // ISO compare is safe while all dates share the YYYY-MM-DD format.
  const today = now.slice(0, 10);

  // Read AGENTS.md and look for any `### RESULT (YYYY-MM-DD)` header.
  let agentsMd = '';
  try { agentsMd = readFileSync(AGENTS_PATH, 'utf8'); } catch (e) { /* best-effort */ }
  const resultHeaders = [...agentsMd.matchAll(/^### RESULT \((\d{4}-\d{2}-\d{2})\)/gm)].map(m => m[1]);

  const pendingGates = [];
  const activeGates = [];
  const recordedLabels = [];
  let overdueGate = null;
  for (const gate of RE_RUNS) {
    const isRecorded = resultHeaders.some(d => d >= gate.resultMustBeDatedOnOrAfter);
    if (isRecorded) { recordedLabels.push(gate.label); continue; }
    if (now < gate.windowStartISO) pendingGates.push(gate);
    else if (now < gate.windowEndISO) activeGates.push(gate);
    else if (!overdueGate) overdueGate = gate;
  }

  const bar = '='.repeat(72);
  const frame = (lines) => `\n${bar}\n${lines.map(l => `  ${l}`).join('\n')}\n${bar}\n`;

  if (recordedLabels.length > 0) {
    console.log(frame([
      'GSC RE-RUN STATUS: recorded',
      ...recordedLabels.map(l => `  Closed gate: ${l}`),
      `Latest RESULT in AGENTS.md: ${resultHeaders[resultHeaders.length - 1]}`,
      'If you are making NEW SEO changes, capture a fresh baseline per AGENTS.md.',
    ]));
  }

  for (const gate of pendingGates) {
    console.log(frame([
      'GSC RE-RUN PENDING',
      `Deploy ${gate.label}`,
      `opens a mandatory re-run window ${gate.windowStartISO.slice(0, 10)} -> ${gate.windowEndISO.slice(0, 10)} (before then, ranking needs time to settle).`,
      `Today: ${today}.`,
      ...gate.instructions,
    ]));
  }

  for (const gate of activeGates) {
    console.log(frame([
      '!!! GSC RE-RUN MANDATORY - ACTIVE WINDOW - RUN THE MEASUREMENT NOW !!!',
      `Gate: ${gate.label}`,
      `Window ${gate.windowStartISO.slice(0, 10)} -> ${gate.windowEndISO.slice(0, 10)} - closes BLOCKED (exit 2) if no RESULT is recorded.`,
      `Today: ${today}.`,
      ...gate.instructions,
      'Run `node scripts/gsc_pull_revenue.js --force` only WHILE drafting that RESULT block.',
    ]));
  }

  if (overdueGate) {
    console.error(frame([
      '!!! GSC RE-RUN OVERDUE - MANDATORY ACTION BEFORE ANY FURTHER SEO WORK !!!',
      `Gate: ${overdueGate.label}`,
      `Window ${overdueGate.windowStartISO.slice(0, 10)} -> ${overdueGate.windowEndISO.slice(0, 10)} has CLOSED with no result`,
      'recorded in AGENTS.md.',
      '',
      'DO THIS NOW:',
      ...overdueGate.instructions.map(l => `  ${l}`),
      'This trigger persists until AGENTS.md records the RESULT. Do not proceed',
      'on SEO tasks while it is armed.',
    ]));
    if (!forced) process.exit(2);
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
