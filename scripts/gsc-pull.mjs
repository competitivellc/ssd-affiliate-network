import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const DOMAINS = {
  "externalssds.com": process.env.EXTERNALSSDS_GSC_SERVICE_ACCOUNT,
  "portablessds.com": process.env.PORTABLESSDS_GSC_SERVICE_ACCOUNT,
};

if (!DOMAINS["externalssds.com"] || !DOMAINS["portablessds.com"]) {
  console.error("Missing one or both GSC env vars");
  process.exit(1);
}

const fmt = (d) => new Date(d).toISOString().slice(0, 10);
const now = Date.now();
const end = fmt(now - 3 * 86400000);
const start90 = fmt(now - 90 * 86400000);
const start28 = fmt(now - 28 * 86400000);

async function clientFor(keyPath) {
  const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  await auth.authorize();
  return { auth, key, sc: google.searchconsole({ version: "v1", auth }) };
}

async function query(sc, siteUrl, body) {
  const r = await sc.searchanalytics.query({ siteUrl, requestBody: body });
  return r.data.rows || [];
}

async function pull(domain) {
  const { auth, key, sc } = await clientFor(DOMAINS[domain]);
  const siteUrl = `sc-domain:${domain}`;

  const sitemapsRaw = (await sc.sitemaps.list({ siteUrl })).data.sitemap || [];

  const base = { startDate: start90, endDate: end };

  const pages = await query(sc, siteUrl, { ...base, dimensions: ["page"], rowLimit: 5000 });
  const queries = await query(sc, siteUrl, { ...base, dimensions: ["query"], rowLimit: 5000 });
  const device = await query(sc, siteUrl, { ...base, dimensions: ["device"], rowLimit: 10 });
  const country = await query(sc, siteUrl, { ...base, dimensions: ["country"], rowLimit: 100 });
  const lowCTRall = await query(sc, siteUrl, { ...base, dimensions: ["query", "page"], rowLimit: 5000 });

  const moneySegments = ["/products/", "/compare", "/hubs/", "/hub/"];
  const moneyBySeg = {};
  for (const seg of moneySegments) {
    moneyBySeg[seg] = await query(sc, siteUrl, {
      ...base,
      dimensions: ["page", "query"],
      rowLimit: 5000,
      dimensionFilter: { dimension: "page", operator: "contains", expression: seg },
    });
  }

  const sitemaps = sitemapsRaw.map((s) => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted,
    lastDownloaded: s.lastDownloaded,
    isPending: s.isPending,
    errors: s.errors,
    warnings: s.warnings,
    contents: (s.contents || []).map((c) => ({ type: c.type, submitted: c.submitted })),
  }));

  return {
    domain,
    serviceAccountEmail: key.client_email,
    dateRange: { start90, start28, end },
    sitemaps,
    pages,
    queries,
    moneyBySeg,
    device,
    country,
    lowCTRall,
  };
}

const outDir = "scripts/_gsc_out";
fs.mkdirSync(outDir, { recursive: true });
for (const domain of Object.keys(DOMAINS)) {
  console.log(`Pulling ${domain}…`);
  const data = await pull(domain);
  const f = path.join(outDir, `${domain}.json`);
  fs.writeFileSync(f, JSON.stringify(data, null, 2));
  const total = data.pages.length + data.queries.length + data.lowCTRall.length +
    Object.values(data.moneyBySeg).reduce((a, b) => a + b.length, 0);
  console.log(`  -> ${f}  (rows=${total}, sitemaps=${data.sitemaps.length})`);
}
console.log("done");
