// One-off diagnostic: enumerate GA4 properties + streams the service account
// can see for both tenants. Helps debug "GA4 returns zero rows" by showing
// (a) which accounts/properties are visible at all, and (b) which web
// stream URLs are linked on each property.
import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

async function audit(tenantLabel, keyPathEnv, propertyIdEnv) {
  const keyPath = process.env[keyPathEnv];
  const propertyId = process.env[propertyIdEnv]?.replace('properties/', '');
  console.log(`\n========== ${tenantLabel} ==========`);
  console.log(`  Key path env var: ${keyPathEnv} -> ${keyPath}`);
  console.log(`  Property ID env var: ${propertyIdEnv} -> ${propertyId}`);
  if (!keyPath || !propertyId) {
    console.log('  MISSING env var.');
    return;
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  const jwt = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  await jwt.authorize();
  console.log(`  Authorized as: ${key.client_email}`);

  const admin = google.analyticsadmin({ version: 'v1beta' });

  try {
    const resp = await admin.accountSummaries.list({ auth: jwt });
    console.log('  Visible accounts:');
    for (const acc of resp.data.accountSummaries || []) {
      console.log(`    Account: "${acc.displayName}" (${acc.account})`);
      for (const prop of acc.propertySummaries || []) {
        console.log(`      Property: "${prop.displayName}" (${prop.property})`);
      }
    }
  } catch (e) {
    console.log(`  accountSummaries.list error: ${e.message}`);
  }

  try {
    const resp = await admin.properties.dataStreams.list({
      parent: `properties/${propertyId}`,
      auth: jwt,
    });
    console.log(`  Data streams on properties/${propertyId}:`);
    if (!resp.data.dataStreams || resp.data.dataStreams.length === 0) {
      console.log('    (no streams defined on this property)');
    } else {
      for (const stream of resp.data.dataStreams) {
        if (stream.webStreamData) {
          console.log(`    WEB "${stream.displayName}" | measurementId=${stream.webStreamData.measurementId} | streamUri=${stream.webStreamData.defaultStreamUri}`);
        } else {
          console.log(`    OTHER "${stream.displayName}" | type=${stream.streamType || 'unknown'}`);
        }
      }
    }
  } catch (e) {
    console.log(`  dataStreams.list error: ${e.message}`);
  }
}

console.log('=== GA4 Property / Stream Audit ===');
await audit('externalssds.com', 'EXTERNALSSDS_GSC_SERVICE_ACCOUNT', 'EXTERNALSSDS_GA4_PROPERTY_ID');
await audit('portablessds.com', 'PORTABLESSDS_GSC_SERVICE_ACCOUNT', 'PORTABLESSDS_GA4_PROPERTY_ID');
