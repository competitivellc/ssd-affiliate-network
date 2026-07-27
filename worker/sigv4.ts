// AWS Signature V4 for HTTP requests, implemented using the Web Crypto API
// (SubtleCrypto) so it runs natively in Cloudflare Workers — no Node.js
// dependency on @aws-sdk/signature-v4. The signing algorithm is documented at
// https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
//
// Satisfies Amazon Associates Program Policies (April 14, 2026) Pol §2(b):
// "you obtain Product pricing and availability data via Creators API or PA API"
// — without proper SigV4 signing PA API returns HTTP 403 and the plan's
// compliance argument for accurate pricing fails (R6 in the implementation
// plan). The legacy worker sent `Authorization: Bearer <apiKey>` which is NOT
// PA-API v5's authentication scheme.

const ALGORITHM = "AWS4-HMAC-SHA256";
const SERVICE = "ProductAdvertisingAPI";
const VERSION = "aws4_request";

/**
 * Returns the hex-encoded SHA-256 digest of `data`.
 */
async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns the hex HMAC-SHA256 of `data` keyed by `keyBytes`.
 * On Workers, `importKey` accepts the raw bytes; `sign` produces the digest.
 */
async function hmac(keyBytes: Uint8Array, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

async function hmacHex(keyBytes: Uint8Array, data: string): Promise<string> {
  const buf = await hmac(keyBytes, data);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface SigV4Credentials {
  accessKey: string;
  secretKey: string;
  /** AWS region for the marketplace (us-west-2 for amazon.com, etc.) */
  region: string;
}

export interface SignedRequestInit {
  method: string;
  /** Full URL including query string, e.g. https://webservices.amazon.com/paapi5/searchitems */
  url: string;
  /** Canonical-encoded body (PA API v5 expects JSON) */
  body: string;
  /** Host header value, e.g. webservices.amazon.com */
  host: string;
  /** AWS access key (defaults from creds) */
  credentials: SigV4Credentials;
  /** Optional extra headers to merge (e.g. content-type) — must NOT include host, x-amz-date, x-amz-content-sha256, authorization, or any x-amz-* header (set by the signer). */
  extraHeaders?: Record<string, string>;
  /** Partner tag for PA API v5 (required in header X-Amz-Target as the resource is identified by it; not signed as a header here) */
  partnerTag?: string;
  /** Partner type ("Associates" for our use). */
  partnerType?: string;
}

/**
 * Builds a fully-signed Request object ready for `fetch`. Region must be one
 * of the marketplace-validated endpoints documented at
 * https://webservices.amazon.com/cloud/paapi5 (us-east-1 vs us-west-2 varies
 * by marketplace — the canonical mapping is exported from paapi5.ts).
 */
export async function signSigV4(opts: SignedRequestInit): Promise<Request> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(opts.body);

  // Headers that MUST be present for PA-API v5. We pre-decide canonical form.
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "x-amz-date": amzDate,
    "x-amz-target":
      `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${opts.method === "POST" ? "GetItems" : "SearchItems"}`,
    "content-encoding": "amz-1.0",
    ...(opts.extraHeaders || {}),
  };

  // Canonical request (per AWS spec)
  const sortedHeaderKeys = Object.keys(headers).map((k) => k.toLowerCase()).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${headers[k].trim()}\n`).join("");
  const signedHeaders = sortedHeaderKeys.join(";");
  const parsed = new URL(opts.url);
  const canonicalQuery = parsed.search
    ? parsed.searchParams
        .entries()
        .toArray()
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .sort()
        .join("&")
    : "";

  const canonicalRequest = [
    opts.method,
    parsed.pathname,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // String to sign
  const credentialScope = `${dateStamp}/${opts.credentials.region}/${SERVICE}/${VERSION}`;
  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    ALGORITHM,
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");

  // Signing key (per the AWS spec, kSigning signs the resulting signature)
  const kDate = await hmac(new TextEncoder().encode("AWS4" + opts.credentials.secretKey), dateStamp);
  const kRegion = await hmac(kDate, opts.credentials.region);
  const kService = await hmac(kRegion, SERVICE);
  const kSigning = await hmac(kService, VERSION);
  const signature = await hmacHex(kSigning, stringToSign);

  const authorization =
    `${ALGORITHM} Credential=${opts.credentials.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fetchHeaders = new Headers({ ...headers, authorization });
  const init: RequestInit = {
    method: opts.method,
    headers: fetchHeaders,
    body: opts.body,
  };
  return new Request(opts.url, init);
}
