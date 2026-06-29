export function getCountryCode(request: Request): string {
  const cf = (request as any).cf;
  if (cf?.country) {
    return cf.country;
  }
  if (cf?.countryCode) {
    return cf.countryCode;
  }
  const header = request.headers.get("cf-ipcountry");
  if (header && header !== "XX") {
    return header;
  }
  return "US";
}

export function rewriteAffiliateUrl(
  url: string,
  tag: string,
  retailer: string
): string {
  switch (retailer) {
    case "Amazon": {
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("amazon")) {
          parsed.searchParams.set("tag", tag);
          return parsed.toString();
        }
      } catch {
        return url;
      }
      return url;
    }
    default:
      return url;
  }
}
