import { defineMiddleware } from "astro/middleware";
import { getTenant } from "@config/tenants";
import { getCountryCode } from "@lib/affiliate";

export const onRequest = defineMiddleware(async (context, next) => {
  const hostname = context.request.headers.get("host") || "externalssds.com";
  const normalized = hostname.replace(/^www\./, "").toLowerCase();

  if (hostname.toLowerCase() !== normalized) {
    const url = new URL(context.request.url);
    url.hostname = normalized;
    return Response.redirect(url.toString(), 301);
  }

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/_astro/") && !pathname.startsWith("/assets/") && !pathname.includes(".")) {
    if (pathname.length > 1 && pathname.endsWith("/")) {
      url.pathname = pathname.replace(/\/+$/, "");
      return Response.redirect(url.toString(), 301);
    }
  }

  const tenant = getTenant(normalized);

  if (!tenant) {
    if (pathname.startsWith("/_astro/") || pathname.startsWith("/assets/")) {
      return next();
    }
    return new Response("Site not found", { status: 404 });
  }

  context.locals.tenant = tenant;
  context.locals.countryCode = getCountryCode(context.request);
  context.locals.hostname = tenant.canonicalDomain;

  const runtime = context.locals.runtime;
  if (runtime?.env) {
    context.locals.DB = runtime.env.DB;
    context.locals.PRICE_CACHE = runtime.env.PRICE_CACHE;
    context.locals.INDEXNOW_KEY = runtime.env.INDEXNOW_KEY;
  }

  return next();
});
