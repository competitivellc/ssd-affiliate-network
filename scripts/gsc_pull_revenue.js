// Pull live GSC data for both tenants to identify top revenue-velocity lever.
import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

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
