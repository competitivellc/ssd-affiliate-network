export interface TenantConfig {
  id: string;
  domain: string;
  canonicalDomain: string;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  defaultCurrency: string;
  defaultLocale: string;
}

export const tenants: Record<string, TenantConfig> = {
  "externalssds.com": {
    id: "externalssds",
    domain: "externalssds.com",
    canonicalDomain: "externalssds.com",
    name: "External SSDs",
    tagline: "Find the Best External Solid State Drives - Expert Reviews & Price Comparisons",
    primaryColor: "#0c8ee7",
    accentColor: "#f59e0b",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
  },
  "portablessds.com": {
    id: "portablessds",
    domain: "portablessds.com",
    canonicalDomain: "portablessds.com",
    name: "Portable SSDs",
    tagline: "Compare the Best Portable Solid State Drives - Speed, Reliability & Value",
    primaryColor: "#10b981",
    accentColor: "#f59e0b",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
  },
  "ssd-affiliate-network.pages.dev": {
    id: "externalssds",
    domain: "ssd-affiliate-network.pages.dev",
    canonicalDomain: "externalssds.com",
    name: "External SSDs",
    tagline: "Find the Best External Solid State Drives - Expert Reviews & Price Comparisons",
    primaryColor: "#0c8ee7",
    accentColor: "#f59e0b",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
  },
};

export function getTenant(hostname: string): TenantConfig | null {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  return tenants[normalized] || null;
}

export function getTenantById(id: string): TenantConfig | null {
  return Object.values(tenants).find((t) => t.id === id) || null;
}
