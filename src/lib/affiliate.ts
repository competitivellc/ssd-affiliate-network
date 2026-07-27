// Affiliate URL rewriting — single source of truth.
//
// Strategy:
//   1. prices.affiliate_url is stored WITHOUT an Associates tag baked in.
//      (Migration 0002 stripped any pre-baked tags; the worker writes canonical
//      URLs only.)
//   2. At render time, buildAffiliateUrl() looks up the appropriate tag from
//      affiliate_configs (keyed by site + retailer + marketplace + country)
//      and injects it per retailer-specific rules.
//   3. PA-API-sourced Amazon URLs (url_source='paapi') are passed through
//      VERBATIM — those URLs already carry the correct Special Link format
//      per Amazon Pol §6(a) line 363 ("You will not add to, delete from, or
//      otherwise alter any Program Content in any way").
//
// Satisfies Amazon Associates Program Policies (April 14, 2026):
//   - Pol §2(a)/(b): Special Link uses the assigned Associates ID
//   - Pol §2(b): tag appears as URL parameter XXXXX-##
//   - Pol §1(c)(i) line 128: 89-day cart grace via linkCode=ll1
//   - Pol §2(e) line 171 + §5(v) line 405: no cross-marketplace redirect,
//     no URL cloaking/spoofing
//   - Pol §6(a) line 363: PA-API URLs not altered

import { getAffiliateTag } from "@lib/db";
import type { D1Database } from "@cloudflare/workers-types";
import type { UrlSource } from "@lib/db";

// Amazon storefronts per visitor locale (ISO-3166-1 alpha-2 country -> storefront host).
export const AMAZON_HOSTS: Record<string, string> = {
  US: "www.amazon.com",
  GB: "www.amazon.co.uk",
  UK: "www.amazon.co.uk",
  DE: "www.amazon.de",
  FR: "www.amazon.fr",
  IT: "www.amazon.it",
  ES: "www.amazon.es",
  JP: "www.amazon.co.jp",
  IN: "www.amazon.in",
  CA: "www.amazon.ca",
  AU: "www.amazon.com.au",
  BR: "www.amazon.com.br",
  MX: "www.amazon.com.mx",
  NL: "www.amazon.nl",
  SG: "www.amazon.sg",
  AE: "www.amazon.ae",
  SA: "www.amazon.sa",
  SE: "www.amazon.se",
  PL: "www.amazon.pl",
  BE: "www.amazon.com.be",
  IE: "www.amazon.ie",
  EG: "www.eg.amazon.com",
  TR: "www.amazon.com.tr",
};

const BHPHOTO_HOSTS = new Set(["www.bhphotovideo.com", "bhphotovideo.com"]);
const NEWEGG_HOSTS = new Set(["www.newegg.com", "newegg.com", "www.newegg.ca", "newegg.ca"]);

// Country -> marketplace mapping for non-Amazon retailers (single-locale for now).
const COUNTRY_TO_MARKETPLACE: Record<string, string> = {
  US: "US", GB: "GB", UK: "GB", DE: "DE", FR: "FR", IT: "IT", ES: "ES",
  JP: "JP", IN: "IN", CA: "CA", AU: "AU", BR: "BR", MX: "MX",
  NL: "NL", SG: "SG", AE: "AE", SA: "SA", SE: "SE", PL: "PL",
  BE: "BE", IE: "IE", EG: "EG", TR: "TR",
};

export function getCountryCode(request: Request): string {
  const cf = (request as any).cf;
  if (cf?.country) return cf.country;
  if (cf?.countryCode) return cf.countryCode;
  const header = request.headers.get("cf-ipcountry");
  if (header && header !== "XX") return header;
  return "US";
}

export function getMarketplace(countryCode: string): string {
  return COUNTRY_TO_MARKETPLACE[countryCode] || "US";
}

export interface RewriteContext {
  db: D1Database;
  siteId: string;
  retailer: string;
  country: string;       // ISO-3166-1 alpha-2
  marketplace?: string;  // defaults to derived
  urlSource?: UrlSource; // pass-through trigger for Amazon
  /**
   * Opt-in for cart-extend linkCode (ll1). Used on high-intent CTAs
   * (primary buy button on product page, ProductCard). Secondary "other
   * retailers" rows pass null/undefined for the standard direct link.
   */
  useCartExtend?: boolean;
}

/**
 * Returns the final href for an affiliate link, or null when the URL cannot
 * be safely rewritten (callers render nothing in that case — never "#").
 */
export async function buildAffiliateUrl(
  rawUrl: string,
  ctx: RewriteContext
): Promise<string | null> {
  if (!rawUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const marketplace = ctx.marketplace || getMarketplace(ctx.country);
  const tagInfo = await getAffiliateTag(ctx.db, ctx.siteId, ctx.retailer, ctx.country, marketplace);

  switch (ctx.retailer) {
    case "Amazon":
      return rewriteAmazon(parsed, tagInfo, ctx.urlSource, ctx.useCartExtend, marketplace);
    case "B&H Photo":
      return rewriteBHPhoto(parsed, tagInfo);
    case "Newegg":
      return rewriteNewegg(parsed, tagInfo);
    default:
      return rawUrl;
  }
}

function rewriteAmazon(
  parsed: URL,
  tagInfo: { tag: string; linkCode: string | null; linkId: string | null } | null,
  urlSource: UrlSource | undefined,
  useCartExtend: boolean | undefined,
  marketplace: string
): string | null {
  const expectedHost = AMAZON_HOSTS[marketplace] || AMAZON_HOSTS.US;

  // Pol §2(e) + §5(v): NEVER cross-rewrite a URL pointed at a different Amazon
  // storefront than the visitor's marketplace. If the stored URL is on
  // amazon.de but the visitor is from US, a click would land them on a
  // marketplace they didn't intend. Pass through verbatim and let the
  // visitor decide.
  if (parsed.hostname !== expectedHost) {
    return parsed.toString();
  }

  // Pol §6(a) line 363: PA-API-sourced Amazon URLs are Amazon-blessed Special
  // Links (the URL Amazon returned via PA-API already carries the correct
  // tag + linkCode + linkId in canonical form). Return unaltered.
  if (urlSource === "paapi") {
    return parsed.toString();
  }

  // Pol §2(a): Special Link MUST use the assigned Associates ID. No tag = no
  // rewrite; refuse to emit a bare Amazon URL that wouldn't credit the
  // Associate. Caller should render nothing in this case.
  if (!tagInfo?.tag) {
    return null;
  }

  parsed.searchParams.set("tag", tagInfo.tag);

  // Pol §1(c)(i) line 128: linkCode=ll1 enables the 89-day Add-to-Cart
  // grace window, instead of the 24h direct-session window. Opt-in only
  // for high-intent CTAs (per Plan B3).
  const wantLinkCode = useCartExtend && (tagInfo.linkCode || "ll1");
  if (wantLinkCode) {
    parsed.searchParams.set("linkCode", wantLinkCode);
    if (tagInfo.linkId) {
      parsed.searchParams.set("linkId", tagInfo.linkId);
    }
  }

  return parsed.toString();
}

function rewriteBHPhoto(
  parsed: URL,
  tagInfo: { tag: string; linkCode: string | null; linkId: string | null } | null
): string | null {
  // B&H Photo affiliate partner param is BI=... — not currently provisioned,
  // so there are no rows in affiliate_configs for B&H Photo. Pass through.
  // When a real partner tag is added, set it in affiliate_configs and
  // inject via parsed.searchParams.set("BI", tag) here.
  if (!BHPHOTO_HOSTS.has(parsed.hostname)) return parsed.toString();
  if (!tagInfo?.tag) return parsed.toString();
  parsed.searchParams.set("BI", tagInfo.tag);
  return parsed.toString();
}

function rewriteNewegg(
  parsed: URL,
  tagInfo: { tag: string; linkCode: string | null; linkId: string | null } | null
): string | null {
  // Same approach as B&H — pass through until a real Newegg partner param
  // is provisioned. Newegg's partner param is typically cm_mmc= or similar;
  // resolved at provisioning time.
  if (!NEWEGG_HOSTS.has(parsed.hostname)) return parsed.toString();
  if (!tagInfo?.tag) return parsed.toString();
  return parsed.toString();
}

// Backward compatibility shim — older callers used rewriteAffiliateUrl directly.
// New code MUST use buildAffiliateUrl. This shim is retained only so existing
// call sites compile during the rollout; it performs only the basic Amazon
// single-marketplace tag injection.
export function rewriteAffiliateUrl(
  url: string,
  tag: string,
  retailer: string
): string {
  if (!url) return url;
  if (retailer !== "Amazon" || !tag) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("amazon")) {
      parsed.searchParams.set("tag", tag);
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}
