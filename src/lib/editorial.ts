import type { Product } from "./db";

export type ArchetypeId =
  | "elite-pro-creator"
  | "console-gaming"
  | "rugged-portable"
  | "highspeed-usb-pro"
  | "budget-everyday";

export interface ProseBlock {
  type: "prose";
  title?: string;
  content: string;
}

export interface BulletBlock {
  type: "bullets";
  title?: string;
  items: string[];
}

export interface CalloutBlock {
  type: "callout";
  content: string;
}

export type EditorialBlock = ProseBlock | BulletBlock | CalloutBlock;

export interface DriveArchetype {
  id: ArchetypeId;
  label: string;
  tagline: string;
  blocks: EditorialBlock[];
}

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function fmtCap(gb: number): string {
  return gb >= 1000
    ? `${(gb / 1000).toFixed(gb % 1000 === 0 ? 0 : 1)}TB`
    : `${gb}GB`;
}

function fmtSpeed(mbps: number): string {
  return mbps >= 1000 ? `${(mbps / 1000).toFixed(1)} GB/s` : `${mbps} MB/s`;
}

function xferTime(mbps: number, fileGb: number): string {
  const s = (fileGb * 1000) / mbps;
  if (s < 1) return "under a second";
  if (s < 60) return `~${Math.round(s)} seconds`;
  return `~${Math.round(s / 60)} minutes`;
}

function shuffleIn(count: number, pool: string[]): string[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

// ---- Conditional NAND-aware helpers ----

function endurancePhrase(tbw: number): string {
  if (tbw >= 1000)
    return pick([
      `${tbw.toLocaleString()} TBW endurance positions this as pro-grade — built for daily rewrite cycles without degradation.`,
      `With ${tbw.toLocaleString()} TBW, this is pro-grade endurance designed for sustained professional workloads.`,
      `${tbw.toLocaleString()} TBW endurance exceeds what most consumer drives offer — engineered for creators who write terabytes per week.`,
    ]);
  if (tbw < 500)
    return pick([
      `${tbw.toLocaleString()} TBW endurance is sufficient for typical use — regular backups, file transfers, and everyday computing.`,
      `Rated at ${tbw.toLocaleString()} TBW, this drive handles typical daily workloads comfortably.`,
      `${tbw.toLocaleString()} TBW endurance covers standard home and office use without concern.`,
    ]);
  return pick([
    `${tbw.toLocaleString()} TBW endurance balances durability with affordability — suitable for regular use with room to spare.`,
    `${tbw.toLocaleString()} TBW endurance covers moderate daily use across a multi-year lifespan.`,
    `Rated at ${tbw.toLocaleString()} TBW, this drive handles a solid mix of daily reads and writes.`,
  ]);
}

function warrantyPhrase(years: number): string {
  if (years >= 5)
    return pick([
      `The ${years}-year warranty is well above the industry standard — a strong differentiator.`,
      `A ${years}-year warranty backs this drive, signaling manufacturer confidence in its longevity.`,
      `Most externals offer 2-3 years of coverage. The ${years}-year warranty here is a meaningful differentiator.`,
    ]);
  return pick([
    `The ${years}-year warranty provides standard coverage for the expected lifespan of the drive.`,
    `Backed by a ${years}-year warranty, this drive offers typical protection for its class.`,
  ]);
}

function thermalWarning(speed: number): string | null {
  if (speed <= 2000) return null;
  return pick([
    "Sustained write workloads can push controller temperatures past 70°C, triggering thermal throttling that reduces throughput by 30-40%. Full metal enclosures manage heat better than slim plastic designs.",
    "At these speeds, thermal management matters. During extended writes, many compact drives throttle to 60-70% of peak speed after several minutes of continuous transfer.",
    "Peak sequential speeds are impressive on paper, but sustained performance depends on thermal design. Without adequate cooling, expect throughput to taper during large continuous file transfers.",
  ]);
}

function interfaceSpeedNote(iface: string, readSpeedMbps: number): string | null {
  if (iface !== "USB 3.2 Gen 2" || readSpeedMbps >= 1050) return null;
  return pick([
    "This speed range is typical of a SATA SSD running over USB — noticeably faster than any HDD, but well below what NVMe drives achieve over Gen 2x2 or Thunderbolt.",
    `${fmtSpeed(readSpeedMbps)} over USB 3.2 Gen 2 corresponds to roughly SATA SSD performance: fast for everyday use, but not built for 4K+ video editing directly from the drive.`,
    "This drive delivers SATA-class speeds over USB — adequate for documents, photos, and backups, but video editors should budget for a faster NVMe-based external.",
  ]);
}

function capacityCallout(capGb: number): ProseBlock | null {
  if (capGb < 2000) return null;
  return {
    type: "prose",
    title: pick(["Cost-Effective for Media Libraries", "Great Value at Scale", "Capacity Economics"]),
    content: pick([
      `At ${fmtCap(capGb)}, this drive hits a sweet spot for photo and video libraries. You can store thousands of RAW images or hours of 4K footage without juggling multiple drives.`,
      `${fmtCap(capGb)} provides generous headroom for creative workflows — a working photo library, active video projects, and a game library all on one portable drive.`,
      `With ${fmtCap(capGb)} of space, this drive doubles as both active project storage and a backup destination. The cost-per-GB at this capacity makes it practical for media libraries.`,
    ]),
  };
}

function hostPortCallout(iface: string): string {
  if (iface === "USB4" || iface === "Thunderbolt 4" || iface === "Thunderbolt 3") {
    return pick([
      "These peak speeds demand a 40 Gbps host port. Connected to standard USB-C, the drive negotiates down to the port's maximum — typically 10 Gbps on older hardware.",
      "Full throughput requires a Thunderbolt 4 or USB4 port capable of 40 Gbps. On USB 3.2 Gen 2 hosts, expect roughly 10 Gbps.",
      "Without a 40 Gbps host port you won't hit rated speeds. Check your laptop or desktop specs — many USB-C ports top out at 10 or 20 Gbps.",
    ]);
  }
  if (iface === "USB 3.2 Gen 2x2") {
    return pick([
      "USB 3.2 Gen 2x2 requires a 20 Gbps host port, often labeled 'SSP+' or '20 Gbps'. Most laptops before 2023 lack this — verify compatibility.",
      "A 20 Gbps port is mandatory for Gen 2x2 speeds. On standard USB-C (10 Gbps) the drive still works but tops out at roughly half the rated throughput.",
      "Few ultrabooks include true Gen 2x2 ports. Without one, this drive performs like a fast 10 Gbps USB 3.2 Gen 2 drive.",
    ]);
  }
  return pick([
    "Standard USB 3.2 Gen 2 (10 Gbps) provides ample bandwidth. No special host hardware required beyond any USB-C port.",
    "This drive runs at full speed over any USB 3.x port. USB-C or USB-A — it negotiates the highest available rate automatically.",
    "Unlike Gen 2x2 or Thunderbolt drives, this one hits full speed on virtually any modern USB port. No compatibility headaches.",
  ]);
}

function consoleSpeedCallout(readSpeedMbps: number): string | null {
  if (readSpeedMbps <= 1500) return null;
  return pick([
    "With read speeds exceeding 1500 MB/s, this drive exceeds what most consoles can fully utilize over USB — you'll see internal-SSD-like load times for backward-compatible and optimized titles.",
    "This drive's throughput surpasses the USB bandwidth threshold most consoles can leverage. In practice, load times will be faster than any HDD but capped by the console's USB controller.",
    `At ${fmtSpeed(readSpeedMbps)} reads, this is one of the fastest USB drives you can pair with a console. Load times will rival internal SSD performance for many titles.`,
  ]);
}

// ---- Archetype generators ----

function eliteProCreator(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  const t50 = xferTime(p.write_speed_mbps, 50);
  const t100 = xferTime(p.write_speed_mbps, 100);

  const idealForPool = [
    `8K and 4K video editors moving ${t50} project files between workstation and set`,
    `Photographers transferring ${cap}+ catalogs during multi-day shoots`,
    `Sound engineers transporting large multi-track session files`,
    `Creative pros who shuttle work between Mac, PC, and iPad`,
    `After Effects and motion graphics artists rendering directly to external storage`,
    `Data scientists managing large training datasets on the go`,
    `Video editors cutting proxy-free 8K footage from the drive`,
    `DAW users streaming sample libraries directly from external storage`,
    `Professionals who need AES 256-bit hardware encryption for sensitive client data on portable drives`,
    `Users who push sustained transfers and need an aluminum enclosure for passive thermal management`,
  ];

  const variant = Math.floor(Math.random() * 4);
  let speedProse: string;
  if (variant === 0) {
    speedProse = `With ${read} sequential reads and ${write} sequential writes over ${p.interface}, this drive redefines what an external SSD can do. A 50GB 4K video project transfers in ${t50}; a 100GB RAW photo session moves in ${t100}.`;
  } else if (variant === 1) {
    speedProse = `${read} reads and ${write} writes put this drive in elite territory. A 50GB file — think a Premiere Pro project folder with proxies — transfers in ${t50}, and a 100GB Lightroom catalog takes ${t100}. That's direct-edit performance without internal storage constraints.`;
  } else if (variant === 2) {
    speedProse = `Creative professionals working with large media files will appreciate ${read} reads and ${write} writes. Transferring a 50GB DaVinci Resolve project takes ${t50}, while a full 100GB RAW photo session moves in ${t100} — fast enough to eliminate proxy workflows entirely.`;
  } else {
    speedProse = `This drive delivers ${read} reads and ${write} writes — speeds that make external storage feel like internal. Move a 50GB 4K project in ${t50} or a 100GB asset library in ${t100}. No waiting, no proxies, no bottlenecks.`;
  }

  const enduranceText = endurancePhrase(p.tbw);
  const warrantyText = warrantyPhrase(p.warranty_years);
  const thermal = thermalWarning(p.read_speed_mbps);
  const capacityBlock = capacityCallout(p.capacity_gb);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Professional Transfer Speeds", "Speed That Changes Your Workflow", "Cutting the Wait"]),
      content: speedProse,
    },
    {
      type: "prose",
      title: pick(["Built for Sustained Workloads", "Endurance You Can Rely On", "Day-In, Day-Out Performance"]),
      content: `${enduranceText} ${warrantyText}`,
    },
    {
      type: "bullets",
      title: "Ideal for",
      items: shuffleIn(3 + Math.floor(Math.random() * 2), idealForPool),
    },
  ];

  if (capacityBlock) blocks.splice(1, 0, capacityBlock);
  if (thermal) blocks.push({ type: "callout", content: thermal });

  blocks.push({
    type: "callout",
    content: `${p.interface} delivers the bandwidth needed for seamless playback and editing of high-bitrate media directly from the drive — no file transfer required.`,
  });

  return {
    id: "elite-pro-creator",
    label: "Professional Creator",
    tagline: pick([
      `The ${p.brand_name} ${p.name} delivers ${read} reads and ${write} writes — a top-tier ${p.interface} drive for demanding professional workflows.`,
      `${read} reads / ${write} writes via ${p.interface}: the ${p.brand_name} ${p.name} is built for creators who cannot afford to wait on file transfers.`,
      `Professional-grade ${p.interface} storage with ${read} reads and ${write} writes — the ${p.brand_name} ${p.name} keeps your creative workflow moving.`,
      `The ${p.name} from ${p.brand_name} pushes ${read} reads and ${write} writes over ${p.interface} — purpose-built for creative professionals.`,
    ]),
    blocks,
  };
}

function consoleGaming(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const gamesLow = Math.floor(p.capacity_gb / 80);
  const gamesHigh = Math.floor(p.capacity_gb / 40);

  const gameCountVariants = [
    `${cap} of storage holds an estimated ${gamesLow}-${gamesHigh} AAA titles, depending on install size. That's enough for an active rotation of multiplayer titles alongside a deep single-player backlog.`,
    `Roughly ${gamesLow}-${gamesHigh} AAA games fit on ${cap} — enough to keep your current rotation installed without juggling uninstalls every time a new title drops.`,
    `${cap} translates to about ${gamesLow}-${gamesHigh} modern game installs. That's Call of Duty, Fortnite, your RPG of the month, and still room for a dozen indies.`,
  ];

  const bestPairedPool = [
    "Xbox Series X|S and PlayStation 5 for expanded external game storage",
    "Gaming laptops where internal SSD space runs out fast",
    "Steam Deck and ROG Ally for portable game libraries on the go",
    "Rapid game switching without traditional HDD thrash",
    "Nintendo Switch docked setups for faster load times",
    "PC gamers who want a dedicated game drive separate from the OS",
    "Game capture and streaming setups needing fast external storage",
    "Multi-console households sharing a single game library drive",
  ];

  const calloutVariants = [
    "While USB-connected externals store and play Xbox Series X|S and PS5 titles, native internal SSDs may be required for full next-gen optimized performance on certain titles.",
    "External USB drives work for playing Xbox and PlayStation games, but native internal NVMe storage is still required for Velocity Architecture and DirectStorage optimizations on some titles.",
    "You can store and play current-gen console games from an external USB drive, but the fastest load times still come from the console's internal SSD for games built with DirectStorage or the PS5's custom architecture.",
    "An NVMe-based external like this one still beats SATA-based externals for console use — expect 2-3x faster level loading and asset streaming compared to a SATA USB drive, even over the same USB interface.",
  ];

  const speedCallout = consoleSpeedCallout(p.read_speed_mbps);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Game-Ready Performance", "Built for Fast Loading", "Console-Class Speeds"]),
      content: pick([
        `With ${read} reads and ${fmtSpeed(p.write_speed_mbps)} writes, the ${p.name} delivers load times that rival internal SSDs. Open-world asset streaming, fast travel, and level transitions all benefit from the jump over traditional HDD external storage.`,
        `${read} reads means games load 3-5× faster than from an external HDD. The ${p.name} eliminates the lag between pressing start and being in the action — whether you are fast-traveling across a map or loading into a multiplayer match.`,
        `Game storage with ${read} reads and ${fmtSpeed(p.write_speed_mbps)} writes cuts load times dramatically compared to HDDs. Open-world games benefit most — assets stream in faster, reducing texture pop-in and stutter.`,
        `As an NVMe-based external, the ${p.name} loads games significantly faster than SATA-based USB drives — expect level transitions in roughly half the time versus a 550 MB/s SATA external, even on the same console USB port.`,
      ]),
    },
    {
      type: "prose",
      title: pick(["Capacity for the Modern Library", "Room for Your Collection", "Store More, Delete Less"]),
      content: pick(gameCountVariants),
    },
    {
      type: "bullets",
      title: "Best paired with",
      items: shuffleIn(3 + Math.floor(Math.random() * 2), bestPairedPool),
    },
    {
      type: "callout",
      content: pick(calloutVariants),
    },
  ];

  if (speedCallout) blocks.splice(2, 0, { type: "callout", content: speedCallout });

  return {
    id: "console-gaming",
    label: "Console Expansion",
    tagline: pick([
      `Expand your game library with the ${p.name} — ${cap} of ${read} NVMe storage purpose-built for consoles and gaming PCs.`,
      `The ${p.brand_name} ${p.name} adds ${cap} of ${read} NVMe game storage — plug, format, and start downloading.`,
      `${cap} at ${read} — the ${p.name} is the NVMe game drive that keeps up with your growing library.`,
      `Game storage expanded: ${cap}, ${read} NVMe, and console-ready. The ${p.name} loads games fast and holds dozens of titles.`,
      `NVMe-powered game storage: ${cap} at ${read} — faster than any SATA external and built for today's sprawling game libraries.`,
    ]),
    blocks,
  };
}

function ruggedPortable(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);

  const builtForProse = [
    `Unlike bare internal drives or fragile externals, the ${p.name} is engineered for the field. Drop-tested and sealed against dust and water ingress, it survives the bumps of daily commuting, coffee shop tables, and outdoor shoots.`,
    `The ${p.name} is built for real-world conditions — not just a desk. IP-rated dust and water resistance, drop protection, and a reinforced casing mean it handles the accidental knock, the coffee spill, and the packed bag.`,
    `Field-tested and weather-sealed, the ${p.name} shrugs off what would ruin a standard external drive. Rain, dust, drops from pocket height — this drive keeps your data safe when conditions get rough.`,
    `Rugged by design: the ${p.name} survives 2-meter drops, water immersion, and dust ingress. It is built for photographers in the field, contractors on site, and anyone whose storage leaves the desk.`,
  ];

  const idealForPool = [
    "Outdoor photographers and drone pilots backing up in the field without a laptop",
    "Field service technicians collecting data on site",
    "Students and commuters tossing a drive in a bag without a protective case",
    "Adventurers and travelers who need storage that survives the journey",
    "Journalists and documentarians working in unpredictable environments",
    "Construction and industrial sites where dust and drops are routine",
    "Videographers shooting on location who need weather-resistant backup",
    "Anyone who wants storage that keeps up with an active, on-the-go lifestyle",
    "Field workers handling sensitive data who need AES 256-bit hardware encryption on a rugged drive",
  ];

  const speedNote = p.read_speed_mbps > 1000
    ? pick([
        `Despite its tough exterior, the ${p.name} delivers ${read} reads and ${write} writes — you do not have to sacrifice speed for durability.`,
        `Rugged does not mean slow: ${read} reads and ${write} writes mean this drive handles 4K video playback and large file transfers just as well as non-rugged alternatives.`,
        `Durability meets performance: ${read} reads and ${write} writes in a package that survives drops and dunks. Most rugged drives at this price point cannot match these speeds.`,
      ])
    : `Despite its tough exterior, the ${p.name} delivers ${read} reads and ${write} writes — fast enough for 4K video playback, large file transfers, and daily backups.`;

  const endurance = endurancePhrase(p.tbw);
  const warranty = warrantyPhrase(p.warranty_years);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Built for Real-World Conditions", "Tough Enough for Anything", "Engineered for the Field", "Adventure-Ready Storage"]),
      content: pick(builtForProse),
    },
    {
      type: "prose",
      title: pick(["No Speed Sacrifice", "Tough Outside, Fast Inside", "Durable and Quick"]),
      content: `${speedNote} ${endurance} ${warranty}`,
    },
    {
      type: "bullets",
      title: "Ideal for",
      items: shuffleIn(3 + Math.floor(Math.random() * 2), idealForPool),
    },
    {
      type: "callout",
      content: pick([
        `${cap} of rugged, pocket-sized storage means less time worrying about your gear and more time focused on your work.`,
        `${cap} of weather-sealed storage that fits in a pocket. The ${p.name} goes where you go — no case required.`,
        `Portable, durable, ${cap} — the ${p.name} is the drive you grab when you head out the door and never think about again.`,
      ]),
    },
  ];

  return {
    id: "rugged-portable",
    label: "Rugged & Portable",
    tagline: pick([
      `The ${p.name} brings ${cap} of ${read} storage that is built to survive drops, dust, and water — your data follows you anywhere.`,
      `${cap} of ${read} rugged storage — the ${p.brand_name} ${p.name} is built for the field, not just the desk.`,
      `Drop-tested, sealed, and ${cap} of ${read} fast — the ${p.name} is the rugged drive that keeps pace with an active workflow.`,
      `Rugged, portable, and ${read} fast: the ${p.name} protects ${cap} of data through whatever the day throws at it.`,
      `${cap} rugged NVMe storage with AES 256-bit hardware encryption — the ${p.name} keeps your data safe from drops and prying eyes alike.`,
    ]),
    blocks,
  };
}

function highspeedUsbPro(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  const t50 = xferTime(p.write_speed_mbps, 50);

  const proseVariants = [
    `USB 3.2 Gen 2×2 unlocks a 20 Gbps pipeline, and the ${p.name} uses every bit of it. With ${read} reads and ${write} writes, this drive handles 4K and 6K video editing directly from the drive — a 50GB file transfers in ${t50}, making it a strong alternative to Thunderbolt solutions for professionals on a budget.`,
    `The ${p.brand_name} ${p.name} harnesses USB 3.2 Gen 2×2 to deliver ${read} reads and ${write} writes — a fraction of the cost of Thunderbolt storage with comparable real-world throughput for most creative workflows.`,
    `${read} reads and ${write} writes over USB 3.2 Gen 2×2 put the ${p.name} in a sweet spot: faster than any standard USB drive, without the premium Thunderbolt tax. Edit 4K video directly from the drive and move large project files in seconds.`,
    `Think of the ${p.name} as Thunderbolt performance without the Thunderbolt price. ${read} reads and ${write} writes over USB 3.2 Gen 2×2 handle 4K/6K video, massive photo catalogs, and frequent large file transfers with room to spare.`,
    `This NVMe drive over Gen 2×2 leaves SATA-based USB drives in the dust — expect 3-4x the throughput of a 550 MB/s SATA external. ${read} reads and ${write} writes put it in Thunderbolt-adjacent territory for a fraction of the cost.`,
  ];

  const whoItServesPool = [
    "Content creators editing 4K video directly from external storage",
    "Professionals who move large files between Mac and PC daily",
    `Users with Gen 2×2-capable hardware wanting maximum USB throughput`,
    `Photographers managing ${cap}+ photo and video libraries on the go`,
    "Video editors who need fast external storage but cannot justify Thunderbolt prices",
    "IT professionals deploying bootable external drives for diagnostics and recovery",
    "Creative teams sharing project files between workstations without a NAS",
    "Power users who want the fastest USB drive their laptop supports",
    "Professionals who need AES 256-bit encryption on a high-speed NVMe external",
    "Users who prioritize aluminum enclosure construction for sustained write performance",
  ];

  const hostNote = hostPortCallout(p.interface);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Pro-Grade USB Performance", "Thunderbolt Alternative", "USB Speed Done Right", "Maximum USB Throughput"]),
      content: pick(proseVariants),
    },
    {
      type: "prose",
      title: pick(["Universal Compatibility", "Works Everywhere", "Port Flexibility"]),
      content: pick([
        `Unlike Thunderbolt drives, the ${p.name} works with any USB-C or USB-A port, though Gen 2×2 speeds require a compatible host port. Connected to a standard USB 3.2 Gen 2 port, it still delivers up to 10 Gbps — enough for fast backups and everyday transfers.`,
        `The ${p.name} is backward compatible with every USB-C and USB-A port in existence. You only get the full 20 Gbps with a Gen 2×2 host, but it is still a fast 10 Gbps drive on standard USB-C — no special hardware required.`,
        `Plug the ${p.name} into any USB port and it works. For the full 20 Gbps, you need a Gen 2×2 host port — but even on standard USB 3.2 Gen 2, you get 10 Gbps of fast, reliable throughput.`,
      ]),
    },
    {
      type: "bullets",
      title: "Who it serves",
      items: shuffleIn(3 + Math.floor(Math.random() * 2), whoItServesPool),
    },
    {
      type: "callout",
      content: hostNote,
    },
  ];

  return {
    id: "highspeed-usb-pro",
    label: "High-Speed USB Pro",
    tagline: pick([
      `The ${p.brand_name} ${p.name} delivers ${write} writes and ${cap} capacity — pro-grade speed without the Thunderbolt price premium.`,
      `${read} reads, ${write} writes, ${cap} — the ${p.name} is the sweet spot between speed and value over USB 3.2 Gen 2×2.`,
      `Pro-grade USB storage: the ${p.name} hits ${read} reads and ${write} writes for a fraction of Thunderbolt pricing.`,
      `The ${p.brand_name} ${p.name} brings ${read} reads and ${cap} capacity over USB 3.2 Gen 2×2 — fast enough for professionals, priced for everyone else.`,
    ]),
    blocks,
  };
}

function budgetEveryday(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);

  const proseVariants = [
    `With ${read} reads and ${write} writes over a USB-C connection, the ${p.name} delivers reliable performance for daily computing needs. Backing up documents, transferring photos from a laptop to a desktop, or storing a media library — it handles routine tasks with consistent speed.`,
    `The ${p.brand_name} ${p.name} offers ${read} reads and ${write} writes — enough for everyday computing without breaking the bank. System backups, file transfers between machines, and external media storage all run smoothly.`,
    `At ${read} reads and ${write} writes, the ${p.name} is not trying to set speed records — it is trying to be the drive you reach for every day. And it succeeds: fast enough for backups and file transfers, cheap enough to buy without thinking twice.`,
    `${read} reads and ${write} writes cover everything a typical user needs: Time Machine backups, document archives, photo libraries, and game installs. The ${p.name} is the drive you plug in and forget about — it just works.`,
  ];

  const greatForPool = [
    "Daily system backups (Time Machine, File History, or rsync)",
    "Expanding a laptop or Chromebook's limited internal storage",
    "School and office file transport between devices",
    "Storing and organizing photo and music libraries",
    "A secondary game library for older or indie titles",
    "Bootable recovery or OS installation media",
    "Media server staging — downloading and organizing files before archiving",
    "A shared family drive for documents, photos, and homework files",
    "Users who want AES 256-bit hardware encryption without paying pro-tier prices",
  ];

  const speedCompareVariants = [
    `${read} reads are typical of a SATA SSD in an external enclosure — noticeably faster than any external HDD, yet well below the speed of Gen 2×2 or Thunderbolt drives. For most daily tasks, this is more than enough.`,
    `This drive performs like a SATA SSD over USB — roughly 5-6× faster than an external HDD for random reads, but not in the same league as NVMe-based externals. For documents, photos, and backups, the difference is academic.`,
    `In the speed hierarchy, the ${p.name} sits above HDDs and below NVMe. Think of it as a SATA SSD in your pocket — fast enough for 95% of daily tasks at a fraction of the cost of the fastest USB drives.`,
    `SATA-based externals like the ${p.name} are the sensible choice when NVMe speed is overkill — the 550 MB/s ceiling is plenty for system backups, media playback, and document storage, and the savings are significant.`,
  ];

  const endurance = endurancePhrase(p.tbw);
  const warranty = warrantyPhrase(p.warranty_years);
  const ifaceNote = interfaceSpeedNote(p.interface, p.read_speed_mbps);
  const capacityBlock = capacityCallout(p.capacity_gb);

  const blocks: EditorialBlock[] = [
    {
      type: "prose",
      title: pick(["Solid Everyday Performance", "Reliable Daily Driver", "Practical Performance", "All the Speed You Need"]),
      content: pick(proseVariants),
    },
    {
      type: "prose",
      title: pick(["Practical, No-Compromise Design", "Built for Real Life", "Simple, Affordable, Dependable"]),
      content: `${cap} of storage provides generous headroom for everyday files. The compact, lightweight design slips into any bag pocket. ${endurance} ${warranty}`,
    },
    {
      type: "bullets",
      title: "Great for",
      items: shuffleIn(3 + Math.floor(Math.random() * 2), greatForPool),
    },
  ];

  if (capacityBlock) blocks.splice(2, 0, capacityBlock);
  if (ifaceNote) blocks.push({ type: "callout", content: ifaceNote });

  blocks.push({
    type: "callout",
    content: pick(speedCompareVariants),
  });

  return {
    id: "budget-everyday",
    label: "Everyday Storage",
    tagline: pick([
      `Reliable ${cap} storage with ${read} reads — the ${p.name} is a practical, affordable choice for daily backups and file transport.`,
      `${cap} of ${read} storage for everyday use — the ${p.brand_name} ${p.name} delivers reliable performance without the premium price tag.`,
      `The ${p.name}: ${cap}, ${read} reads, ${write} writes, and a price that makes it an easy choice for daily backups and file transport.`,
      `Everyday external storage done right: ${cap} capacity, ${read} reads, and the reliability you expect from ${p.brand_name}.`,
    ]),
    blocks,
  };
}

export function classifyDrive(
  product: Product,
  categorySlug?: string
): DriveArchetype {
  const iface = product.interface;
  const readSpeed = product.read_speed_mbps;
  const name = product.name.toLowerCase();
  const cat = categorySlug || product.category_slug || "";

  if (
    iface === "Thunderbolt 4" ||
    iface === "Thunderbolt 3" ||
    iface === "USB4" ||
    iface === "NVMe PCIe 5.0"
  ) {
    return eliteProCreator(product);
  }

  if (
    cat === "gaming" ||
    /\b(gaming|console|xbox|playstation|game)\b/i.test(name)
  ) {
    return consoleGaming(product);
  }

  if (
    cat === "rugged" ||
    /\b(shield|extreme|rugged|armor|tough|armoured|tactical|field)\b/i.test(name)
  ) {
    return ruggedPortable(product);
  }

  if (iface === "USB 3.2 Gen 2x2" && readSpeed >= 1500) {
    return highspeedUsbPro(product);
  }

  return budgetEveryday(product);
}
