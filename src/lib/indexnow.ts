const INDEXNOW_API = "https://api.indexnow.org/indexnow";
const MAX_BATCH_SIZE = 10_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;

interface IndexNowResult {
  success: boolean;
  status: number;
  statusText: string;
  body?: string;
  error?: string;
}

interface IndexNowBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: { url: string; error: string }[];
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function submitWithRetry(
  url: string,
  init: RequestInit,
  attempt = 1,
): Promise<IndexNowResult> {
  try {
    const resp = await fetch(url, init);
    const body = await resp.text();
    if (resp.ok || resp.status === 429) {
      return { success: resp.ok, status: resp.status, statusText: resp.statusText, body };
    }
    if (attempt < MAX_RETRIES) {
      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);
      await delay(backoff);
      return submitWithRetry(url, init, attempt + 1);
    }
    return { success: false, status: resp.status, statusText: resp.statusText, body };
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);
      await delay(backoff);
      return submitWithRetry(url, init, attempt + 1);
    }
    return { success: false, status: 0, statusText: "NetworkError", error: String(err) };
  }
}

export async function submitSingleUrl(
  key: string,
  host: string,
  url: string,
): Promise<IndexNowResult> {
  const payload = { host, key, urlList: [url] };
  return submitWithRetry(INDEXNOW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

export async function submitBatch(
  key: string,
  host: string,
  urls: string[],
): Promise<IndexNowBatchResult> {
  if (urls.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, errors: [] };
  }

  const result: IndexNowBatchResult = { total: urls.length, succeeded: 0, failed: 0, errors: [] };

  for (let i = 0; i < urls.length; i += MAX_BATCH_SIZE) {
    const batch = urls.slice(i, i + MAX_BATCH_SIZE);
    const payload = { host, key, urlList: batch };

    const res = await submitWithRetry(INDEXNOW_API, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.success) {
      result.succeeded += batch.length;
    } else {
      result.failed += batch.length;
      result.errors.push({
        url: `batch-${Math.floor(i / MAX_BATCH_SIZE)}`,
        error: `HTTP ${res.status}: ${res.statusText}${res.body ? ` - ${res.body}` : ""}`,
      });
    }
  }

  return result;
}

export async function submitSitemap(
  key: string,
  host: string,
  sitemapUrl: string,
): Promise<IndexNowResult> {
  const params = new URLSearchParams({ key, host, url: sitemapUrl });
  return submitWithRetry(`${INDEXNOW_API}?${params}`, { method: "GET" });
}

export { INDEXNOW_API, MAX_BATCH_SIZE };
