import fs from "node:fs";

function rows(arr) { return Array.isArray(arr) ? arr : []; }
function unwrap(rows) {
  return rows.map((r) => ({
    keys: r.keys || [],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

function annotate(url) {
  let seg = "(other)";
  if (url.includes("/products/")) seg = "PRODUCT";
  else if (url.includes("/compare")) seg = "COMPARE";
  else if (url.includes("/hubs/") || url.includes("/hub/")) seg = "HUB";
  else if (url === "https://externalssds.com/" || url === "https://portablessds.com/" || url.endsWith("://externalssds.com") || url.endsWith("://portablessds.com")) seg = "HOME";
  return seg;
}
function host(url) {
  const m = url.match(/^https?:\/\/([^/]+)/);
  return m ? m[1] : "?";
}
function pathn(url) {
  const m = url.match(/^https?:\/\/[^/]+(\/[^?#]*)?/);
  return m ? (m[1] || "/") : url;
}

function summarize(domain, data) {
  const pages = unwrap(rows(data.pages));
  const queries = unwrap(rows(data.queries));
  const money = {};
  for (const [seg, rs] of Object.entries(data.moneyBySeg)) {
    money[seg] = unwrap(rs);
  }
  const allPQ = unwrap(rows(data.lowCTRall));
  const devices = unwrap(rows(data.device));
  const countries = unwrap(rows(data.country));

  // Totals
  const totalClicks = pages.reduce((a, b) => a + b.clicks, 0);
  const totalImpr = pages.reduce((a, b) => a + b.impressions, 0);

  // By page-segment
  const bySeg = new Map();
  for (const p of pages) {
    const seg = annotate(p.keys[0]);
    const cur = bySeg.get(seg) || { seg, clicks: 0, impr: 0, urls: 0 };
    cur.clicks += p.clicks;
    cur.impr += p.impressions;
    cur.urls += 1;
    if (p.position != null) {
      cur._posSum = (cur._posSum || 0) + p.position;
      cur._posN = (cur._posN || 0) + 1;
    }
    bySeg.set(seg, cur);
  }
  const segArr = [...bySeg.values()].map((s) => ({
    ...s,
    avgPos: s._posN ? s._posSum / s._posN : null,
    ctr: s.impr ? s.clicks / s.impr : 0,
  })).filter((s) => s.impr > 0).sort((a, b) => b.impr - a.impr);

  // Top money pages by impressions
  const productPages = pages
    .filter((p) => annotate(p.keys[0]) === "PRODUCT")
    .sort((a, b) => b.impressions - a.impressions);
  const hubPages = pages
    .filter((p) => annotate(p.keys[0]) === "HUB")
    .sort((a, b) => b.impressions - a.impressions);
  const comparePages = pages
    .filter((p) => annotate(p.keys[0]) === "COMPARE")
    .sort((a, b) => b.impressions - a.impressions);

  // CTR distribution per page-segment (where the easy wins are)
  function ctrDist(rs) {
    const dist = { pos1to3: { c: 0, i: 0 }, pos4to10: { c: 0, i: 0 }, pos11to20: { c: 0, i: 0 }, pos20p: { c: 0, i: 0 } };
    for (const r of rs) {
      const p = r.position;
      let b;
      if (p <= 3) b = dist.pos1to3;
      else if (p <= 10) b = dist.pos4to10;
      else if (p <= 20) b = dist.pos11to20;
      else b = dist.pos20p;
      b.c += r.clicks; b.i += r.impressions;
    }
    const out = {};
    for (const [k, v] of Object.entries(dist)) out[k] = { clicks: v.c, impr: v.i, ctr: v.i ? v.c / v.i : 0 };
    return out;
  }
  const productDist = ctrDist(productPages);
  const hubDist = ctrDist(hubPages);
  const compareDist = ctrDist(comparePages);
  const homeDist = ctrDist(pages.filter((p) => annotate(p.keys[0]) === "HOME"));

  // High-impression, low-CTR money queries: pages 4-20 with CTR < segment average position CTR
  const moneyPQ = [];
  for (const [seg, rs] of Object.entries(money)) {
    for (const r of rs) {
      const url = r.keys[0];
      const q = r.keys[1];
      if (r.position >= 4 && r.position <= 20 && r.impressions >= 50 && r.ctr < 0.05) {
        moneyPQ.push({ seg, url, query: q, clicks: r.clicks, impr: r.impressions, ctr: r.ctr, pos: r.position });
      }
    }
  }
  moneyPQ.sort((a, b) => b.impr - a.impr);

  // Crawled sitemap coverage
  return {
    domain,
    totals: { clicks: totalClicks, impressions: totalImpr, avgCtr: totalImpr ? totalClicks / totalImpr : 0 },
    bySeg: segArr,
    productTop: productPages.slice(0, 25).map((r) => ({ url: r.keys[0], clicks: r.clicks, impr: r.impressions, ctr: r.ctr, pos: r.position })),
    hubTop: hubPages.slice(0, 25).map((r) => ({ url: r.keys[0], clicks: r.clicks, impr: r.impressions, ctr: r.ctr, pos: r.position })),
    compareTop: comparePages.slice(0, 15).map((r) => ({ url: r.keys[0], clicks: r.clicks, impr: r.impressions, ctr: r.ctr, pos: r.position })),
    homeTop: pages.filter((p) => annotate(p.keys[0]) === "HOME").sort((a, b) => b.impressions - a.impressions).slice(0, 5),
    posDist: {
      product: productDist,
      hub: hubDist,
      compare: compareDist,
      home: homeDist,
    },
    highImprLowCtrMoney: moneyPQ.slice(0, 60),
    countries: countries.map((r) => ({ country: r.keys[0], clicks: r.clicks, impr: r.impressions, ctr: r.ctr })),
    devices: devices.map((r) => ({ device: r.keys[0], clicks: r.clicks, impr: r.impressions, ctr: r.ctr })),
    uniqueUrls: { products: productPages.length, hubs: hubPages.length, compares: comparePages.length, totalAll: pages.length },
    sitemaps: data.sitemaps,
    topQueries: queries.sort((a, b) => b.impressions - a.impressions).slice(0, 40).map((q) => ({ q: q.keys[0], clicks: q.clicks, impr: q.impressions, pos: q.position, ctr: q.ctr })),
  };
}

const out = {};
for (const d of ["externalssds.com", "portablessds.com"]) {
  const data = JSON.parse(fs.readFileSync(`scripts/_gsc_out/${d}.json`, "utf8"));
  out[d] = summarize(d, data);
}
fs.writeFileSync("scripts/_gsc_out/_summary.json", JSON.stringify(out, null, 2));
console.log("summary written");
