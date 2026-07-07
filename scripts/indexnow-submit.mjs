import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEXNOW_API = "https://api.indexnow.org/indexnow";
const MAX_BATCH_SIZE = 10_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env.indexnow");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      process.env[k] = v;
    }
  }
}

async function fetchWithRetry(url, init, attempt = 1) {
  try {
    const resp = await fetch(url, init);
    const text = await resp.text();
    if (resp.ok || resp.status === 429) {
      console.log(`  → HTTP ${resp.status} ${resp.statusText}${text ? `: ${text}` : ""}`);
      return resp.ok;
    }
    if (attempt < MAX_RETRIES) {
      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(`  ⚠ HTTP ${resp.status}, retrying in ${backoff}ms (attempt ${attempt}/${MAX_RETRIES})...`);
      await delay(backoff);
      return fetchWithRetry(url, init, attempt + 1);
    }
    console.error(`  ✗ HTTP ${resp.status} ${resp.statusText}${text ? `: ${text}` : ""}`);
    return false;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(`  ⚠ Network error, retrying in ${backoff}ms (attempt ${attempt}/${MAX_RETRIES})...`);
      await delay(backoff);
      return fetchWithRetry(url, init, attempt + 1);
    }
    console.error(`  ✗ Network error: ${err}`);
    return false;
  }
}

async function fetchSitemapUrls(sitemapUrl) {
  console.log(`\n  Fetching sitemap: ${sitemapUrl}`);
  const resp = await fetch(sitemapUrl);
  if (!resp.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${resp.status}`);
  }
  const xml = await resp.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`  Found ${urls.length} URLs in sitemap`);
  return urls;
}

async function submitBatch(key, host, urls) {
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i += MAX_BATCH_SIZE) {
    const batch = urls.slice(i, i + MAX_BATCH_SIZE);
    console.log(`\n  Submitting batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}/${Math.ceil(urls.length / MAX_BATCH_SIZE)} (${batch.length} URLs)...`);

    const ok = await fetchWithRetry(INDEXNOW_API, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, urlList: batch }),
    });

    if (ok) {
      succeeded += batch.length;
    } else {
      failed += batch.length;
    }

    if (i + MAX_BATCH_SIZE < urls.length) {
      await delay(500);
    }
  }

  return { succeeded, failed };
}

async function main() {
  loadEnv();

  const key = process.env.INDEXNOW_KEY;
  const host = process.env.INDEXNOW_HOST || "externalssds.com";
  const sitemapUrl = process.env.INDEXNOW_SITEMAP || `https://${host}/sitemap.xml`;

  if (!key) {
    console.error("ERROR: INDEXNOW_KEY environment variable is required.");
    console.error("Set it via environment or create scripts/.env.indexnow:");
    console.error('  INDEXNOW_KEY="your-64-char-hex-key"');
    console.error('  INDEXNOW_HOST="externalssds.com"');
    console.error('  INDEXNOW_SITEMAP="https://externalssds.com/sitemap.xml"');
    process.exit(1);
  }

  console.log(`\n=== IndexNow Submission ===`);
  console.log(`  Host:    ${host}`);
  console.log(`  Sitemap: ${sitemapUrl}`);
  console.log(`  Key:     ${key.slice(0, 8)}...${key.slice(-8)}`);

  const urls = await fetchSitemapUrls(sitemapUrl);

  if (urls.length === 0) {
    console.log("\n  No URLs found. Nothing to submit.\n");
    return;
  }

  console.log(`\n  Submitting ${urls.length} URLs to IndexNow...`);
  const { succeeded, failed } = await submitBatch(key, host, urls);

  console.log(`\n=== Results ===`);
  console.log(`  Total:     ${urls.length}`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Status:    ${failed === 0 ? "✓ All OK" : "✗ Some failed"}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
