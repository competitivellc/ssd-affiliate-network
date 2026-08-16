// Pull live Bing Webmaster Tools data for both tenants.
// Reads keyword stats, top pages, aggregate counts.
// Falls back to a friendly "not configured" message when no BWMT key env var is set.
//
// Accepted env var names (checked in order, first non-empty wins):
//   1. BING_WMT_API_KEY       (canonical — per AGENTS.md "Bing Webmaster Tools Access" section)
//   2. BING_WEBMASTER_API_KEY (legacy — historical name, kept for back-compat with already-set local env)
//
// Window: 14 days. BWMT only returns rows for days with impressions; the 28d
// rolling window frequently returns empty for low-traffic sites because the
// back half of the window has 0 Bing impressions. 14d gives a non-empty
// snapshot for both tenants as of 2026-08-15.

const DOMAINS = ["externalssds.com", "portablessds.com"];
const BWMT_BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const WINDOW_DAYS = 14;

// Returns `null` (with a friendly message) when the API key env var is missing,
// so the script exits 0 and a future agent can wire up the key without changing code.
async function checkKey() {
  const key = process.env.BING_WMT_API_KEY || process.env.BING_WEBMASTER_API_KEY;
  if (!key) {
    console.log("BING_WMT_API_KEY (or BING_WEBMASTER_API_KEY) not set. Skipping BWMT pull.");
    console.log("To enable: obtain an API key from https://www.bing.com/webmasters (Settings -> API Access) and set BING_WMT_API_KEY before running.");
    return null;
  }
  return key;
}

async function bwmtGet(apiKey, url) {
  const sep = url.includes("?") ? "&" : "?";
  const full = `${url}${sep}apikey=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(full, { headers: { "Accept": "application/json" } });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`BWMT HTTP ${resp.status} ${resp.statusText}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
  const json = await resp.json();
  // BWMT wraps arrays in an ASP.NET-style {"d": [...]} envelope.
  return Array.isArray(json) ? json : (json && Array.isArray(json.d) ? json.d : []);
}

// Convert yyyy-MM-dd to the API's expected format (already ISO date).
function dateRange(daysBack) {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 86400000);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function getKeywordStats(apiKey, siteUrl) {
  const { start, end } = dateRange(WINDOW_DAYS);
  const url = `${BWMT_BASE}/GetQueryStats?siteUrl=${encodeURIComponent(siteUrl)}&startDate=${start}&endDate=${end}`;
  return bwmtGet(apiKey, url);
}

async function getPageStats(apiKey, siteUrl) {
  const { start, end } = dateRange(WINDOW_DAYS);
  const url = `${BWMT_BASE}/GetPageStats?siteUrl=${encodeURIComponent(siteUrl)}&startDate=${start}&endDate=${end}`;
  return bwmtGet(apiKey, url);
}

async function getUrlInfo(apiKey, siteUrl) {
  const url = `${BWMT_BASE}/GetUrlInfo?siteUrl=${encodeURIComponent(siteUrl)}`;
  return bwmtGet(apiKey, url);
}

function fmtNum(n) {
  if (n == null || isNaN(n)) return "0";
  return Number(n).toLocaleString();
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return "0.00%";
  return `${(Number(n) * 100).toFixed(2)}%`;
}

async function run() {
  const apiKey = await checkKey();
  if (!apiKey) return;

  const { start, end } = dateRange(WINDOW_DAYS);

  for (const domain of DOMAINS) {
    const siteUrl = `https://${domain}`;
    console.log(`\n========== ${domain} (BWMT, ${start} → ${end}) ==========`);

    try {
      // Keyword-level stats: aggregate clicks/impressions/CTR
      const kwStats = await getKeywordStats(apiKey, siteUrl);
      const kws = Array.isArray(kwStats) ? kwStats : [];
      let totalClicks = 0;
      let totalImpressions = 0;
      for (const row of kws) {
        totalClicks += Number(row.Clicks || 0);
        totalImpressions += Number(row.Impressions || 0);
      }
      const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
      console.log(`${WINDOW_DAYS}d TOTAL: clicks=${fmtNum(totalClicks)} impressions=${fmtNum(totalImpressions)} ctr=${fmtPct(avgCtr)}`);

      // Top keywords
      const topKws = [...kws]
        .sort((a, b) => Number(b.Impressions || 0) - Number(a.Impressions || 0))
        .slice(0, 20);
      if (topKws.length > 0) {
        console.log(`\nTOP KEYWORDS (${WINDOW_DAYS}d, sorted by impressions):`);
        for (const row of topKws) {
          const imp = Number(row.Impressions || 0);
          const clk = Number(row.Clicks || 0);
          const ctr = imp > 0 ? clk / imp : 0;
          const query = String(row.Query || "").slice(0, 60);
          console.log(`  ${clk}c ${imp}i ctr${fmtPct(ctr)} | ${query}`);
        }
      } else {
        console.log(`\n  (no keyword data returned for this ${WINDOW_DAYS}d window)`);
      }

      // Top pages
      try {
        const pageStats = await getPageStats(apiKey, siteUrl);
        const pages = Array.isArray(pageStats) ? pageStats : [];
        const topPages = [...pages]
          .sort((a, b) => Number(b.Impressions || 0) - Number(a.Impressions || 0))
          .slice(0, 15);
        if (topPages.length > 0) {
          console.log(`\nTOP PAGES (${WINDOW_DAYS}d, sorted by impressions):`);
          for (const row of topPages) {
            const imp = Number(row.Impressions || 0);
            const clk = Number(row.Clicks || 0);
            const ctr = imp > 0 ? clk / imp : 0;
            // BWMT's GetPageStats returns the page URL in the `Query` field
            // (same shape as GetQueryStats; the SDK normalizes this internally
            // but the raw JSON API does not).
            const page = String(row.Query || row.Url || row.Page || "").slice(0, 100);
            console.log(`  ${clk}c ${imp}i ctr${fmtPct(ctr)} | ${page}`);
          }
        }
      } catch (pageErr) {
        console.log(`\n  (page stats unavailable: ${pageErr.message})`);
      }
    } catch (err) {
      console.log(`  ERR for ${domain}: ${err.message}`);
    }
  }
}

run().catch((e) => { console.error("ERR", e.message); process.exit(1); });
