export interface TenantConfig {
  id: string;
  domain: string;
  canonicalDomain: string;
  name: string;
  tagline: string;
  primaryColor: string;
  primaryColorDark: string;
  accentColor: string;
  defaultCurrency: string;
  defaultLocale: string;
  gaMeasurementId?: string;
  /**
   * Google AdSense configuration. Publisher IDs and ad-unit slot IDs are
   * public information (they appear in ads.txt and in page HTML), so
   * committing them is safe. Leave unset to keep ads off entirely (the
   * AdSlot components and the SDK loader render nothing).
   *
   * EEA/UK/CH visitors are geo-gated off until a Google-certified CMP is
   * integrated (see src/lib/adsense.ts) — ads are only served outside
   * that scope, and only after cookie consent is accepted.
   *
   * clientId format: "ca-pub-XXXXXXXXXXXXXXXX" (from AdSense settings).
   * Slot IDs: create responsive ad units in the AdSense dashboard, then
   * paste the numeric slot IDs below per placement.
   */
  adsense?: {
    clientId?: string;
    homeSlotId?: string;
    compareSlotId?: string;
    productSlotId?: string;
  };
}

export const tenants: Record<string, TenantConfig> = {
  "externalssds.com": {
    id: "externalssds",
    domain: "externalssds.com",
    canonicalDomain: "externalssds.com",
    name: "External SSDs",
    tagline: "Find the Best External Solid State Drives - Expert Reviews & Price Comparisons",
    primaryColor: "#0c8ee7",
    primaryColorDark: "#064c83",
    accentColor: "#f59e0b",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
    gaMeasurementId: "G-7BG64K2QZJ",
    adsense: {
      clientId: "ca-pub-4951924636664760",
    },
  },
  "portablessds.com": {
    id: "portablessds",
    domain: "portablessds.com",
    canonicalDomain: "portablessds.com",
    name: "Portable SSDs",
    tagline: "Compare the Best Portable Solid State Drives - Speed, Reliability & Value",
    primaryColor: "#10b981",
    primaryColorDark: "#065f46",
    accentColor: "#f59e0b",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
    gaMeasurementId: "G-YFZ8SDB88N",
    adsense: {
      clientId: "ca-pub-4951924636664760",
    },
  },
  "ssd-affiliate-network.pages.dev": {
    id: "externalssds",
    domain: "ssd-affiliate-network.pages.dev",
    canonicalDomain: "externalssds.com",
    name: "External SSDs",
    tagline: "Find the Best External Solid State Drives - Expert Reviews & Price Comparisons",
    primaryColor: "#0c8ee7",
    primaryColorDark: "#064c83",
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
