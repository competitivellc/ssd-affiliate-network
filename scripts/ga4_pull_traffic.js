// Pull live GA4 data for both tenants: sessions/users/pageviews/engagement/channel/country/device.
import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

const DOMAINS = [
  { name: 'externalssds.com', env: 'EXTERNALSSDS_GSC_SERVICE_ACCOUNT', propEnv: 'EXTERNALSSDS_GA4_PROPERTY_ID' },
  { name: 'portablessds.com', env: 'PORTABLESSDS_GSC_SERVICE_ACCOUNT', propEnv: 'PORTABLESSDS_GA4_PROPERTY_ID' },
];

function auth(keyPath) {
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  });
}

async function discoverPropertyId(adm, hostName) {
  const list = await adm.accounts.list();
  for (const a of list.data.accounts || []) {
    const props = await adm.accounts.properties.list({ parent: `accounts/${a.name.split('/')[1]}`, showDeleted: false });
    for (const p of props.data.properties || []) {
      const streams = await adm.accounts.properties.dataStreams.list({ parent: p.name });
      const host = (streams.data.dataStreams || []).find(s => s.webStreamData?.defaultUri === `https://${hostName}` || s.webStreamData?.defaultUri === `http://${hostName}`);
      if (host) return p.name.split('/')[1];
    }
  }
  return null;
}

async function runReport(adata, propertyId, dimensions, metrics, startDate, endDate, extra = {}) {
  const res = await adata.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: { dateRanges: [{ startDate, endDate }], dimensions, metrics, ...extra },
  });
  return res.data.rows || [];
}

async function run() {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start28 = new Date(today.getTime() - 28 * 86400000).toISOString().slice(0, 10);
  const start7 = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10);

  for (const d of DOMAINS) {
    const keyPath = process.env[d.env];
    if (!keyPath) { console.log(`NO KEY for ${d.name}`); continue; }
    const jwt = auth(keyPath);
    let propertyId = process.env[d.propEnv];
    if (!propertyId) {
      const adm = google.analyticsadmin({ version: 'v1beta', auth: jwt });
      propertyId = await discoverPropertyId(adm, d.name);
      if (!propertyId) { console.log(`NO PROPERTY for ${d.name}`); continue; }
      console.log(`discovered ${d.name} property=${propertyId}`);
    }

    const adata = google.analyticsdata({ version: 'v1beta', auth: jwt });
    console.log(`\n========== ${d.name} (${start28} → ${end}) ==========`);

    // 28-day core metrics
    const core = await runReport(adata, propertyId, [], [
      { name: 'sessions' }, { name: 'totalUsers' }, { name: 'newUsers' },
      { name: 'engagedSessions' }, { name: 'engagementRate' },
      { name: 'averageSessionDuration' }, { name: 'bounceRate' },
      { name: 'screenPageViews' }, { name: 'screenPageViewsPerSession' },
    ], start28, end);
    console.log('28d CORE:', JSON.stringify(core[0]?.metricValues?.map(v => v.value) || []));

    // Channel breakdown (28d)
    const channels = await runReport(adata, propertyId,
      [{ name: 'sessionDefaultChannelGroup' }],
      [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagementRate' }],
      start28, end, { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '10' });
    console.log('\nCHANNELS (28d):');
    channels.forEach(r => {
      const [ch, sess, users, eng] = r.dimensionValues.concat(r.metricValues).map(v => v.value);
      console.log(`  ${ch.padEnd(20)} ${sess}sess ${users}users eng${(parseFloat(eng) * 100).toFixed(1)}%`);
    });

    // Top pages (28d)
    const pages = await runReport(adata, propertyId,
      [{ name: 'pagePath' }],
      [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'averageSessionDuration' }],
      start28, end, { orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: '15' });
    console.log('\nTOP PAGES (28d):');
    pages.forEach(r => {
      const [path, views, sess, dur] = r.dimensionValues.concat(r.metricValues).map(v => v.value);
      console.log(`  ${views.padStart(5)}v ${sess.padStart(4)}s avg${dur}s | ${path}`);
    });

    // Top countries (28d)
    const countries = await runReport(adata, propertyId,
      [{ name: 'country' }],
      [{ name: 'sessions' }, { name: 'totalUsers' }],
      start28, end, { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '10' });
    console.log('\nTOP COUNTRIES (28d):');
    countries.forEach(r => {
      const [c, sess, users] = r.dimensionValues.concat(r.metricValues).map(v => v.value);
      console.log(`  ${sess.padStart(5)}s ${users.padStart(5)}u | ${c}`);
    });

    // Device split (28d)
    const devices = await runReport(adata, propertyId,
      [{ name: 'deviceCategory' }],
      [{ name: 'sessions' }, { name: 'engagementRate' }],
      start28, end);
    console.log('\nDEVICES (28d):');
    devices.forEach(r => {
      const [dev, sess, eng] = r.dimensionValues.concat(r.metricValues).map(v => v.value);
      console.log(`  ${dev.padEnd(10)} ${sess}sess eng${(parseFloat(eng) * 100).toFixed(1)}%`);
    });

    // Daily trend (last 7d)
    const daily = await runReport(adata, propertyId,
      [{ name: 'date' }],
      [{ name: 'sessions' }, { name: 'screenPageViews' }],
      start7, end, { orderBys: [{ dimension: { dimensionName: 'date' } }] });
    console.log('\nDAILY (7d):');
    daily.forEach(r => {
      const [dt, sess, views] = r.dimensionValues.concat(r.metricValues).map(v => v.value);
      console.log(`  ${dt} ${sess}sess ${views}views`);
    });
  }
}

run().catch(e => { console.error('ERR', e.message); process.exit(1); });
