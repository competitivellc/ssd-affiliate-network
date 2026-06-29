import type { KVNamespace } from "@cloudflare/workers-types";

const PRICE_CACHE_PREFIX = "price:";
const CACHE_TTL = 3600;

export async function getCachedPrice(
  kv: KVNamespace,
  productSlug: string,
  retailer: string
): Promise<{ price: number; currency: string; updatedAt: string } | null> {
  const key = `${PRICE_CACHE_PREFIX}${productSlug}:${retailer}`;
  const raw = await kv.get(key);
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function setCachedPrice(
  kv: KVNamespace,
  productSlug: string,
  retailer: string,
  data: { price: number; currency: string; updatedAt: string }
): Promise<void> {
  const key = `${PRICE_CACHE_PREFIX}${productSlug}:${retailer}`;
  await kv.put(key, JSON.stringify(data), { expirationTtl: CACHE_TTL });
}

export async function getCachedProductList(
  kv: KVNamespace,
  siteId: string
): Promise<any[] | null> {
  const raw = await kv.get(`products:${siteId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function setCachedProductList(
  kv: KVNamespace,
  siteId: string,
  products: any[]
): Promise<void> {
  await kv.put(`products:${siteId}`, JSON.stringify(products), {
    expirationTtl: CACHE_TTL,
  });
}
