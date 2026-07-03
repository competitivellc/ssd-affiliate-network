export function formatPrice(cents: number, currency: string = "USD"): string {
  const amount = cents / 100;
  const locales: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    CAD: "en-CA",
  };
  return new Intl.NumberFormat(locales[currency] || "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getLowestPrice(
  prices: { retailer: string; price_cents: number; currency: string; in_stock?: number }[]
): { retailer: string; price_cents: number; currency: string; in_stock?: number } | null {
  const inStock = prices.filter((p) => p.in_stock);
  if (inStock.length === 0) return prices.length > 0 ? prices.reduce((min, p) => (p.price_cents < min.price_cents ? p : min)) : null;
  return inStock.reduce((min, p) => (p.price_cents < min.price_cents ? p : min));
}

export function getPriceSavings(
  prices: { retailer: string; price_cents: number }[]
): { best: number; average: number; maxSavings: number } {
  if (prices.length === 0) return { best: 0, average: 0, maxSavings: 0 };
  const sorted = [...prices].sort((a, b) => a.price_cents - b.price_cents);
  const best = sorted[0].price_cents;
  const average = Math.round(
    prices.reduce((s, p) => s + p.price_cents, 0) / prices.length
  );
  const maxSavings = sorted[sorted.length - 1].price_cents - best;
  return { best, average, maxSavings };
}
