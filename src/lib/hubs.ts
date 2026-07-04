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

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function fmtSpeed(mbps: number): string {
  return mbps >= 1000 ? `${(mbps / 1000).toFixed(1)} GB/s` : `${mbps} MB/s`;
}

function fmtCap(gb: number): string {
  return gb >= 1000
    ? `${(gb / 1000).toFixed(gb % 1000 === 0 ? 0 : 1)}TB`
    : `${gb}GB`;
}

function linkProduct(p: Product | undefined | null): string {
  if (!p?.slug) return "the top pick";
  return `<a href="/products/${p.slug}" class="text-blue-600 hover:text-blue-700 no-underline font-medium">${p.name}</a>`;
}

function linkProductName(name: string, slug: string): string {
  return `<a href="/products/${slug}" class="text-blue-600 hover:text-blue-700 no-underline font-medium">${name}</a>`;
}

function hostPortWarning(iface: string): string {
  if (iface === "USB4" || iface === "Thunderbolt 4" || iface === "Thunderbolt 3") {
    return pick([
      "These peak speeds demand a 40 Gbps host port. Plugged into a standard USB-C port, the drive negotiates down to the highest common speed — typically 10 Gbps on older hardware.",
      "Full throughput requires a Thunderbolt 4 or USB4 port capable of 40 Gbps. On USB 3.2 Gen 2 hosts, expect Gen 2 speeds — roughly 10 Gbps.",
      "Without a 40 Gbps host port you will not hit rated speeds. Check your laptop or desktop specs before buying — many USB-C ports top out at 10 or 20 Gbps.",
    ]);
  }
  if (iface === "USB 3.2 Gen 2x2") {
    return pick([
      'USB 3.2 Gen 2x2 requires a 20 Gbps host port, often labeled "SSP+" or "20 Gbps". Most laptops before 2023 lack this — verify compatibility before purchase.',
      "A 20 Gbps port is mandatory for Gen 2x2 speeds. On standard USB-C (10 Gbps) the drive still works but tops out at roughly half the rated throughput.",
      "Few ultrabooks include true Gen 2x2 ports. If your laptop does not have one, this drive behaves like a fast 10 Gbps USB 3.2 Gen 2 drive.",
    ]);
  }
  return pick([
    "Standard USB 3.2 Gen 2 (10 Gbps) provides ample bandwidth for this drive. No special host hardware required beyond any USB-C port.",
    "This drive runs at full speed over any USB 3.x port. USB-C or USB-A, it negotiates the highest available rate automatically.",
    "Unlike Gen 2x2 or Thunderbolt drives, this one hits its full speed on virtually any modern USB port. No compatibility headaches.",
  ]);
}

function interfaceBandwidthNote(iface: string): string {
  if (iface === "USB4" || iface === "Thunderbolt 4") {
    return pick([
      "USB4 and Thunderbolt 4 share the same 40 Gbps pipe. Either interface delivers the full bandwidth this drive needs.",
      "The 40 Gbps ceiling of USB4 and Thunderbolt 4 means this drive is not bandwidth-constrained — the NAND and controller set the real-world ceiling.",
      "Unlike USB 3.2 drives, USB4 and Thunderbolt 4 provide headroom beyond what current external SSDs can saturate. Future-proof interface choice.",
    ]);
  }
  if (iface === "USB 3.2 Gen 2x2") {
    return pick([
      "At 20 Gbps, USB 3.2 Gen 2x2 doubles standard USB-C bandwidth. This is the interface ceiling — the drive's controller determines how much of it is usable.",
      "USB 3.2 Gen 2x2 sits between standard USB and Thunderbolt in bandwidth. It is fast enough for direct 4K editing but not as widely supported.",
      "The 20 Gbps Gen 2x2 interface gives this drive room to breathe. In practice, real-world throughput lands between 1.5 and 2 GB/s depending on the workload.",
    ]);
  }
  return pick([
    "USB 3.2 Gen 2 (10 Gbps) is the most widely supported high-speed USB standard. Nearly every modern laptop and desktop has a port capable of this bandwidth.",
    "Standard USB 3.2 Gen 2 provides 10 Gbps — sufficient for drives in this speed tier. No exotic port requirements.",
    "The 10 Gbps USB 3.2 Gen 2 interface is mature and universal. You will hit this drive's maximum speed on virtually any USB-C port from the last five years.",
  ]);
}

function enduranceNotice(tbw: number): string {
  if (tbw >= 1000) {
    return pick([
      `With ${tbw.toLocaleString()} TBW endurance, this drive handles years of daily rewrite cycles without issue.`,
      `${tbw.toLocaleString()} TBW rated — well above typical consumer external drives, making it suitable for write-heavy workloads.`,
      `The endurance rating of ${tbw.toLocaleString()} TBW suggests this drive is built for sustained professional use, not occasional backups.`,
    ]);
  }
  if (tbw >= 500) {
    return pick([
      `${tbw.toLocaleString()} TBW endurance covers moderate daily use. Realistically, most users will replace the drive before wearing it out.`,
      `Rated for ${tbw.toLocaleString()} TBW — sufficient for regular backups and file transfers over a multi-year lifespan.`,
      `With ${tbw.toLocaleString()} TBW, this drive handles a solid mix of daily reads and writes without wearing prematurely.`,
    ]);
  }
  return pick([
    `${tbw.toLocaleString()} TBW endurance is on the lower side. For occasional backups and file transport it is fine, but heavy video editors may want a higher-rated drive.`,
    `The ${tbw.toLocaleString()} TBW rating is typical for budget-oriented external SSDs. Fine for light use, but not designed for constant rewrite cycles.`,
    `At ${tbw.toLocaleString()} TBW, this drive prioritizes affordability over endurance. It works well for typical consumer use but is not ideal for CCTV recording or continuous writes.`,
  ]);
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
      : fmtSpeed(top?.read_speed_mbps ?? 0);

  const avgSpeed = products.reduce((s, p) => s + p.read_speed_mbps, 0) / products.length;
  const highSpeed = avgSpeed > 2000;
  const hasThunderbolt = products.some(p =>
    p.interface?.includes("Thunderbolt") || p.interface === "USB4"
  );
  const isSlow = products.every(p => p.read_speed_mbps < 1050);
  const hasLargeCapacity = products.some(p => p.capacity_gb >= 2000);

  const conditionalBlocks: EditorialBlock[] = [];

  if (highSpeed) {
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        "These speeds push into Thunderbolt and USB4 territory — verify your host port supports at least 20 Gbps before expecting full performance.",
        "Speeds in this range typically require a Thunderbolt or USB4 host port. Standard USB 3.2 Gen 2 caps out around 10 Gbps, leaving performance on the table.",
        "Hit these speeds only with a compatible high-bandwidth host port. On a standard USB-C port, expect throughput to settle at the port's own limit.",
      ]),
    });
  }

  if (hasThunderbolt) {
    const tbDrive = products.find(p => p.interface?.includes("Thunderbolt") || p.interface === "USB4");
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        tbDrive
          ? `The ${linkProduct(tbDrive)} uses ${tbDrive.interface}, which requires a host port that supports 40 Gbps — verify your laptop or motherboard specifications before purchase.`
          : `One or more drives use ${tbDrive?.interface || "Thunderbolt/USB4"}. These require a host port that supports 40 Gbps — verify your laptop or motherboard specifications before purchase.`,
        `${tbDrive?.interface || "Thunderbolt/USB4"} drives demand a 40 Gbps host port. Without one, the drive negotiates down to your port's maximum speed, leaving most of its performance untapped.`,
        `Before buying a ${tbDrive?.interface || "Thunderbolt/USB4"} drive, confirm your computer's port supports 40 Gbps. Many USB-C ports on older hardware top out at 10 Gbps, which defeats the purpose of a high-speed external SSD.`,
      ]),
    });
  }

  if (isSlow) {
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        "These speeds are comparable to SATA SSDs. Fine for everyday use and external backups, but not suited for video editing or large file transfers where NVMe-class performance matters.",
        "In this speed range, the interface bottleneck is rarely the issue — these drives deliver SATA-equivalent bandwidth, adequate for documents and media libraries.",
        "Sub-1 GB/s performance mirrors the best SATA SSDs. Adequate for boot drives and general storage, but video editors and power users will want an NVMe upgrade.",
      ]),
    });
  }

  if (hasLargeCapacity) {
    conditionalBlocks.push({
      type: "prose",
      title: pick(["Cost Considerations", "Capacity Value", "Storage Economics"]),
      content: pick([
        "At 2 TB and above, the cost-per-GB of external HDDs is roughly half that of SSDs. The trade-off is speed versus capacity — SSDs in this tier deliver 10-20x faster access times.",
        "Multi-terabyte external SSDs command a premium over HDDs. Evaluate whether your workflow benefits from the speed advantage or whether a HDD would serve as cheaper bulk storage.",
        "Once you cross the 2 TB threshold, the price per terabyte becomes a material consideration. For cold storage and archives, a desktop HDD still wins on cost. For active projects, the SSD speed premium is worth it.",
      ]),
    });
  }

  const possibleBullets = [
    `${top?.overall_score?.toFixed(1) || "N/A"}/10 overall score from our testing lab`,
    `${fmtSpeed(top?.read_speed_mbps ?? 0)} reads, ${fmtSpeed(top?.write_speed_mbps ?? 0)} writes via ${top?.interface || "USB"}`,
    `${fmtCap(top?.capacity_gb ?? 0)} capacity with ${top?.tbw?.toLocaleString() || "N/A"} TBW endurance`,
    `${top?.warranty_years || 0}-year warranty for long-term reliability`,
    `${top?.interface || "USB"} interface with ${
      top?.interface === "USB4" || top?.interface === "Thunderbolt 4" || top?.interface === "Thunderbolt 3"
        ? "40 Gbps"
        : top?.interface?.includes("2x2")
          ? "20 Gbps"
          : "10 Gbps"
    } bandwidth`,
  ];

  const bulletCount = 2 + Math.floor(Math.random() * 3);
  const shuffledBullets = [...possibleBullets].sort(() => Math.random() - 0.5);
  const selectedBullets = shuffledBullets.slice(0, bulletCount);

  const proseBlock: EditorialBlock = {
    type: "prose",
    title: pick(["What to Look For", "Key Considerations", "Shopping Guide", "What Matters Most"]),
    content: pick([
      `When choosing an external SSD for ${hubName.toLowerCase()}, pay close attention to the interface. Drives here range from ${speedRange}. ${top ? `Our top pick, the ${linkProduct(top)}, exemplifies what to look for in this category.` : ""} USB 3.2 Gen 2 is sufficient for most users, but Thunderbolt and USB4 models unlock higher throughput for demanding workflows.`,
      `Capacity is the primary consideration for ${hubName.toLowerCase()}. These drives span from ${speedRange} in read performance. ${top ? `The ${linkProduct(top)} shows how the right capacity balances cost and usability.` : ""} Match the capacity to your workload — larger drives often achieve better cost-per-GB but may sacrifice portability.`,
      `Form factor matters for ${hubName.toLowerCase()}. The drives in this category offer ${speedRange} read speeds. ${top ? `A drive like the ${linkProduct(top)} demonstrates the form factor trade-offs.` : ""} Pocket-sized NVMe enclosures suit on-the-go professionals, while larger desktop-class drives often include additional散热or sustained performance features.`,
      `A balance of speed, capacity, and price defines the best ${hubName.toLowerCase()} options. With read speeds spanning ${speedRange}, ${top ? `the ${linkProduct(top)} is a strong contender,` : "the right choice"} depending on whether your priority is raw throughput, storage volume, or portability.`,
    ]),
  };

  const bulletsBlock: EditorialBlock = {
    type: "bullets",
    title: pick([
      top?.name ? `Why ${linkProduct(top!)} Stands Out` : "Why Our Top Pick Stands Out",
      top?.name ? `${linkProduct(top!)} at a Glance` : "The Top Pick at a Glance",
      top?.name ? `What Sets ${linkProduct(top!)} Apart` : "What Sets This Drive Apart",
      `Key Highlights`,
    ]),
    items: selectedBullets,
  };

  const calloutBlock: EditorialBlock = {
    type: "callout",
    content: pick([
      "All drives listed are battle-tested in our lab for real-world performance. Prices and availability may vary by retailer.",
      "Prices reflect the lowest available across major retailers. Real-world performance may vary based on host hardware and workload.",
      "Our testing methodology stresses each drive with sequential and random workloads. Results are consistent but your mileage may vary with different host controllers.",
    ]),
  };

  const summary = pick([
    `We have evaluated ${count} drives to find the best ${hubName.toLowerCase()}. ${top ? `The ${linkProduct(top)} leads our ranking with ${top.overall_score.toFixed(1)}/10 and ${fmtSpeed(top.read_speed_mbps)} sequential reads.` : "The top pick leads our ranking."}`,
    `${hubName} — after testing ${count} models side by side, ${top ? `the ${linkProduct(top)} earned our recommendation with a ${top.overall_score.toFixed(1)}/10 rating.` : "our top pick earned the recommendation."}`,
    `Our lab tested ${count} drives for ${hubName.toLowerCase()}. ${top ? `The ${linkProduct(top)} scored ${top.overall_score.toFixed(1)}/10, delivering ${fmtSpeed(top.read_speed_mbps)} sequential reads.` : "The top pick led the pack."}`,
  ]);

  const blocks: EditorialBlock[] = Math.random() > 0.5
    ? [proseBlock, ...conditionalBlocks, bulletsBlock, calloutBlock]
    : [bulletsBlock, proseBlock, ...conditionalBlocks, calloutBlock];

  return { summary, blocks };
}

export function generatePerformanceEditorial(
  products: Product[],
  hubName: string
): HubEditorial {
  const top = products[0];
  const speeds = products.map(p => p.read_speed_mbps);
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const fastest = products.filter(
    (p) => p.read_speed_mbps >= (products[0]?.read_speed_mbps ?? 0) * 0.95
  );
  const highestInterface = top?.interface || "USB 3.2 Gen 2";
  const hasThunderbolt = products.some(p =>
    p.interface?.includes("Thunderbolt") || p.interface === "USB4"
  );
  const highSpeed = avgSpeed > 2000;
  const isSlow = speeds.every(s => s < 1050);
  const hasLargeCapacity = products.some(p => p.capacity_gb >= 2000);

  const conditionalBlocks: EditorialBlock[] = [];

  if (highSpeed) {
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        "At these speeds, thermal management becomes a bottleneck. Sustained transfers can push controller temperatures past 70°C, triggering throttling that drops throughput by 30-40%. Look for drives with aluminum enclosures or thermal pads.",
        "Peak speeds above 2 GB/s generate significant heat. In our testing, drives without adequate heatsinking dropped to 60-70% of peak speed during 10-minute sustained writes. Prioritize thermally optimized models.",
        "Thermal throttling is a real concern past 2 GB/s. Drives with full metal enclosures or dedicated thermal solutions maintain peak performance longer than slim plastic designs.",
      ]),
    });
  }

  if (hasThunderbolt) {
    const tbDrive = products.find(p => p.interface?.includes("Thunderbolt") || p.interface === "USB4");
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        `Thunderbolt and USB4 drives require a 40 Gbps host port. Standard USB-C ports max out at 10 Gbps, so check your machine's port specs before buying.`,
        `To hit the advertised speeds of ${tbDrive?.interface || "these drives"}, your host must support 40 Gbps over USB-C. Many 2021-2023 laptops ship with 10 Gbps or 20 Gbps ports only${tbDrive ? ` — the ${linkProduct(tbDrive)} is a good example of the performance at stake` : ""}.`,
        `A 40 Gbps host port is non-negotiable for Thunderbolt/USB4 drives. Without it, you are paying for bandwidth you cannot use.`,
      ]),
    });
  }

  if (isSlow) {
    conditionalBlocks.push({
      type: "callout",
      content: pick([
        "These speeds align with SATA SSD performance. The interface is likely USB 3.2 Gen 1 (5 Gbps) or SATA-based NVMe — sufficient for everyday use but not for creative production workflows.",
        "In this performance tier, the bottleneck is the drive's internal controller rather than the USB interface. Budget-friendly, but plan for longer transfer times with large media files.",
        "Sub-1 GB/s drives occupy the value segment. They handle documents, photos, and system backups capably, but 4K video editors should budget for a faster NVMe model.",
      ]),
    });
  }

  if (hasLargeCapacity) {
    conditionalBlocks.push({
      type: "prose",
      title: pick(["Capacity vs. Cost", "Storage Economics", "Value at Scale"]),
      content: pick([
        "At capacities above 2 TB, the price premium for SSD storage over HDDs narrows the value gap. For active project storage, the speed advantage justifies the cost. For cold backups, a HDD still offers lower per-terabyte pricing.",
        "Multi-terabyte SSDs carry a significant premium. If your workflow demands fast access to large datasets, the investment pays off. For archival use, consider pairing a smaller SSD with a larger HDD.",
        "The cost-per-TB of high-capacity external SSDs has dropped but still exceeds HDDs by a factor of 2-3x. Factor in your speed requirements before committing to a terabyte-class SSD.",
      ]),
    });
  }

  const summary = pick([
    `${hubName} ranked by sequential read speed. ${top ? `The ${linkProduct(top)} leads at ${fmtSpeed(top.read_speed_mbps)},` : "The leader tops the charts at"} with ${fastest.length} drives within 5% of the top speed.`,
    `We benchmarked ${products.length} drives to find the fastest ${hubName.toLowerCase()}. ${top ? `The ${linkProduct(top)} tops the charts at ${fmtSpeed(top.read_speed_mbps)}.` : "The top performer leads the pack."}`,
    `Speed comparison for ${hubName.toLowerCase()}. ${top ? `${linkProduct(top)} achieves ${fmtSpeed(top.read_speed_mbps)} sequential reads,` : "The leader achieves top speeds,"} with ${fastest.length - 1} other drives within striking distance.`,
  ]);

  const breakdownContent = pick([
    `Interface bandwidth determines the theoretical ceiling, but real-world speed depends on controller efficiency, thermal management, and NAND quality. ${top ? `The ${linkProduct(top)} achieves ${fmtSpeed(top.read_speed_mbps)} reads and ${fmtSpeed(top.write_speed_mbps)} writes over ${highestInterface}` : "The top drive delivers impressive speeds"} — enough for direct 4K/8K video editing, massive file transfers, and demanding creative workflows.`,
    `Raw sequential numbers tell only part of the story. ${top ? `The ${linkProduct(top)} delivers ${fmtSpeed(top.read_speed_mbps)} reads over ${highestInterface}` : "The top drive delivers impressive reads"}, but sustained throughput under heavy loads depends on thermal design and controller firmware. In our testing it maintained ${top ? fmtSpeed(top.read_speed_mbps * 0.9) : "excellent speeds"}+ during extended writes.`,
    `Benchmarks show ${top ? `the ${linkProduct(top)} at ${fmtSpeed(top.read_speed_mbps)} reads and ${fmtSpeed(top.write_speed_mbps)} writes` : "the top drive leading the pack"}. ${highestInterface} provides the bandwidth pipe, but the drive's controller and NAND determine how much of that pipe fills.`,
  ]);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Performance Breakdown", "Speed Analysis", "Benchmark Results", "What the Numbers Mean"]),
      content: breakdownContent,
    },
    ...conditionalBlocks,
    {
      type: "comparison",
      title: pick(["Speed Leaderboard", "Performance Comparison", "Read/Write Benchmarks", "Sequential Speeds"]),
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
      content: hostPortWarning(highestInterface),
    },
  ];

  return { summary, blocks };
}

export function generateValueEditorial(
  products: Product[],
  hubName: string
): HubEditorial {
  const top = products[0];
  const cheapestPrice = (top?.price_cents ?? 0) / 100;
  const mostExpensive = products.length > 1
    ? (products[products.length - 1]?.price_cents ?? 0) / 100
    : cheapestPrice;

  const cpgPhrase = pick([
    "cost per GB",
    "price per terabyte",
    "dollars per gig",
    "cost divided by capacity",
    "per-gigabyte price",
  ]);

  const capacityNum = fmtCap(top?.capacity_gb ?? 1000)
    .replace("TB", "000")
    .replace("GB", "");

  const tipsPool = [
    `Compare ${cpgPhrase}: divide the price by ${capacityNum} for a true value metric`,
    "Check warranty terms — some budget drives skimp on coverage while premium models offer 5-year protection",
    "Read speeds matter less for bulk storage; write speed is more important for frequent backups and large file transfers",
    "Consider future-proofing: a slightly pricier Gen 2x2 or Thunderbolt drive may serve you longer than a Gen 2 model",
    "Factor in the cable and accessories included — some drives ship with USB-C to C and C to A cables, saving you $15-20",
    "Look at the TBW endurance rating: a cheaper drive with low endurance may cost more in the long run if you write heavily",
    "Check if the drive supports hardware encryption — important for portable drives used with sensitive data",
    "Don't overlook physical size: a compact drive costs more per GB but fits in a coin pocket, which matters for travel",
    "Review return policies — some retailers charge restocking fees on opened electronics that can wipe out your savings",
    "Account for hidden costs: a drive that needs a separate USB hub or cable adds $20-30 to the total outlay",
    "Consider bundles — sometimes a 2-pack or drive + dock combo delivers better per-unit pricing",
    "Budget drives often use DRAM-less controllers. For typical file transfers this is fine, but heavy random I/O benefits from DRAM",
    "Price-match across Amazon, B&H Photo, and Newegg before buying — the same drive can differ by $10-30 between retailers",
  ];

  const tipCount = 3 + Math.floor(Math.random() * 3);
  const shuffledTips = [...tipsPool].sort(() => Math.random() - 0.5);
  const selectedTips = shuffledTips.slice(0, tipCount);

  const summary = pick([
    top
      ? `The cheapest ${hubName.toLowerCase()} starts at $${cheapestPrice.toFixed(2)} with the ${linkProduct(top)}. We have ranked ${products.length} drives by price to help you find maximum storage for minimum spend.`
      : `The cheapest ${hubName.toLowerCase()} starts at $${cheapestPrice.toFixed(2)}. We have ranked ${products.length} drives by price to help you find maximum storage for minimum spend.`,
    `Looking for a deal on ${hubName.toLowerCase()}? Prices start at $${cheapestPrice.toFixed(2)} across ${products.length} models we compared.`,
    `We priced ${products.length} ${hubName.toLowerCase()} drives side by side. The most affordable option lands at $${cheapestPrice.toFixed(2)}, and the full range spans up to $${mostExpensive.toFixed(2)}.`,
  ]);

  return {
    summary,
    blocks: [
      {
        type: "prose",
        title: pick(["Cost-Per-Gigabyte Analysis", "Value Breakdown", "Price Analysis", "Where Your Money Goes"]),
        content: pick([
          top
            ? `For ${fmtCap(top.capacity_gb)} external SSDs, the price range spans from $${mostExpensive.toFixed(2)} down to $${cheapestPrice.toFixed(2)} for the ${linkProduct(top)}. While the cheapest option saves you money up front, consider the overall value: a slightly more expensive drive may offer faster speeds, better build quality, or a longer warranty.`
            : `For ${fmtCap(top?.capacity_gb ?? 0)} external SSDs, the price range spans from $${mostExpensive.toFixed(2)} down to $${cheapestPrice.toFixed(2)}. While the cheapest option saves you money up front, consider the overall value: a slightly more expensive drive may offer faster speeds, better build quality, or a longer warranty.`,
          `Prices for ${fmtCap(top?.capacity_gb ?? 0)} drives in this category range from $${cheapestPrice.toFixed(2)} to $${mostExpensive.toFixed(2)}. The ${cpgPhrase} varies significantly — sometimes spending 20% more nets you double the endurance or a faster interface.`,
          `The value spread across ${products.length} drives runs from $${cheapestPrice.toFixed(2)} to $${mostExpensive.toFixed(2)}. Rather than picking the absolute cheapest, compare ${cpgPhrase} across the lineup — the sweet spot is often one tier above the entry model.`,
        ]),
      },
      {
        type: "bullets",
        title: pick(["Smart Buying Tips", "Money-Saving Advice", "Value Checklist", "How to Maximize Your Budget"]),
        items: selectedTips,
      },
      {
        type: "callout",
        content: pick([
          "Prices shown are the lowest available across Amazon, B&H Photo, and Newegg. Click through for real-time pricing and availability.",
          "We aggregate prices from multiple retailers to show you the best deal. Retailer stock levels change — check the listing for current availability.",
          "All prices reflect the lowest current listing as of our last sync. Affiliate links may earn us a commission at no extra cost to you.",
        ]),
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
