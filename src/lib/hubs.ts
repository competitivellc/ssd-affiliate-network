import type { Product } from "./db";

export interface EditorialBlock {
  type: "prose" | "bullets" | "callout" | "comparison";
  title?: string;
  content?: string;
  items?: string[];
  rows?: { label: string; values: string[] }[];
}

export interface HubEditorial {
  summary: string;
  blocks: EditorialBlock[];
}

function fmtSpeed(mbps: number): string {
  return mbps >= 1000 ? `${(mbps / 1000).toFixed(1)} GB/s` : `${mbps} MB/s`;
}

function fmtCap(gb: number): string {
  return gb >= 1000
    ? `${(gb / 1000).toFixed(gb % 1000 === 0 ? 0 : 1)}TB`
    : `${gb}GB`;
}

export function generateUseCaseEditorial(
  products: Product[],
  hubName: string
): HubEditorial {
  const top = products[0];
  const count = products.length;
  const speedRange =
    products.length > 1
      ? `${fmtSpeed(products[products.length - 1].read_speed_mbps)} to ${fmtSpeed(products[0].read_speed_mbps)}`
      : fmtSpeed(top?.read_speed_mbps || 0);

  return {
    summary: `We have evaluated ${count} drives to find the best ${hubName.toLowerCase()}. The ${top?.name || "top pick"} leads our ranking with ${top?.overall_score?.toFixed(1) || "0"}/10 and ${fmtSpeed(top?.read_speed_mbps || 0)} sequential reads.`,
    blocks: [
      {
        type: "prose",
        title: "What to Look For",
        content: `When choosing an external SSD for your specific use case, consider the interface speed, capacity, and form factor. The drives in this category range from ${speedRange} in read speed, ensuring you get the performance your workflow demands.`,
      },
      {
        type: "bullets",
        title: `Why ${top?.name || "our top pick"} Stands Out`,
        items: [
          `${top?.overall_score?.toFixed(1) || "N/A"}/10 overall score from our testing lab`,
          `${fmtSpeed(top?.read_speed_mbps || 0)} reads and ${fmtSpeed(top?.write_speed_mbps || 0)} writes via ${top?.interface || "USB"}`,
          `${fmtCap(top?.capacity_gb || 0)} capacity with ${top?.tbw?.toLocaleString() || "N/A"} TBW endurance`,
          `${top?.warranty_years || 0}-year warranty for long-term reliability`,
        ],
      },
      {
        type: "callout",
        content: `All drives listed are battle-tested in our lab for real-world performance. Prices and availability may vary by retailer.`,
      },
    ],
  };
}

export function generatePerformanceEditorial(
  products: Product[],
  hubName: string
): HubEditorial {
  const top = products[0];
  const fastest = products.filter((p) => p.read_speed_mbps >= (products[0]?.read_speed_mbps || 0) * 0.95);

  return {
    summary: `${hubName} ranked by sequential read speed. The ${top?.name || "top performer"} leads at ${fmtSpeed(top?.read_speed_mbps || 0)}, with ${fastest.length} drives within 5% of the top speed.`,
    blocks: [
      {
        type: "prose",
        title: "Performance Breakdown",
        content: `Interface bandwidth determines the theoretical ceiling, but real-world speed depends on controller efficiency, thermal management, and NAND quality. The ${top?.name || "top drive"} achieves ${fmtSpeed(top?.read_speed_mbps || 0)} reads and ${fmtSpeed(top?.write_speed_mbps || 0)} writes over ${top?.interface || "its interface"} - enough for direct 4K/8K video editing, massive file transfers, and demanding creative workflows.`,
      },
      {
        type: "comparison",
        title: "Speed Leaderboard",
        rows: products.slice(0, 5).map((p) => ({
          label: p.name,
          values: [
            `${fmtSpeed(p.read_speed_mbps)} read`,
            `${fmtSpeed(p.write_speed_mbps)} write`,
            p.interface,
          ],
        })),
      },
      {
        type: "callout",
        content: `Maximum speeds require a compatible host port. USB 3.2 Gen 2x2 needs a 20 Gbps port; Thunderbolt/USB4 needs a 40 Gbps port. Connected to a slower port, drives fall back to the highest common speed.`,
      },
    ],
  };
}

export function generateValueEditorial(
  products: Product[],
  hubName: string
): HubEditorial {
  const top = products[0];
  const cpgTallies = products.map((p) => ({
    name: p.name,
    capacityGb: p.capacity_gb,
  }));
  const capDisplay =
    cpgTallies.length > 0
      ? fmtCap(cpgTallies[0].capacityGb)
      : "high-capacity";

  return {
    summary: `The cheapest ${hubName.toLowerCase()} starts at $${((top?.price_cents || 0) / 100).toFixed(2)}. We have ranked ${products.length} drives by price to help you find maximum storage for minimum spend.`,
    blocks: [
      {
        type: "prose",
        title: "Cost-Per-Gigabyte Analysis",
        content: `For ${capDisplay} external SSDs, the price range spans from $${((products[products.length - 1]?.price_cents || 0) / 100).toFixed(2)} down to $${((products[0]?.price_cents || 0) / 100).toFixed(2)}. While the cheapest option saves you money up front, consider the overall value: a slightly more expensive drive may offer faster speeds, better build quality, or a longer warranty.`,
      },
      {
        type: "bullets",
        title: "Smart Buying Tips",
        items: [
          `Compare cost-per-GB: divide the price by ${capDisplay.replace("TB", "000").replace("GB", "")} for a true value metric`,
          `Check warranty terms - some budget drives skimp on coverage`,
          `Read speeds matter less for bulk storage; write speed is more important for frequent backups`,
          `Consider future-proofing: a slightly pricier Gen 2x2 drive may serve you longer`,
        ],
      },
      {
        type: "callout",
        content: `Prices shown are the lowest available across Amazon, B&H Photo, and Newegg. Click through for real-time pricing and availability.`,
      },
    ],
  };
}

export function getHubEditorial(
  hubType: string,
  products: Product[],
  hubName: string
): HubEditorial | null {
  if (products.length === 0) return null;
  switch (hubType) {
    case "use-case":
      return generateUseCaseEditorial(products, hubName);
    case "performance":
      return generatePerformanceEditorial(products, hubName);
    case "value":
      return generateValueEditorial(products, hubName);
    default:
      return null;
  }
}
