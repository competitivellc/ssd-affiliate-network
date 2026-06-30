import { defineMiddleware } from "astro/middleware";
import { getTenant } from "@config/tenants";
import { getCountryCode } from "@lib/affiliate";

export const onRequest = defineMiddleware(async (context, next) => {
  const hostname = context.request.headers.get("host") || "externalssds.com";
  const tenant = getTenant(hostname);

  if (!tenant) {
    const url = new URL(context.request.url);
    if (url.pathname.startsWith("/_astro/") || url.pathname.startsWith("/assets/")) {
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
  }

  return next();
});
