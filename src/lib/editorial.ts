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

function eliteProCreator(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  const t50 = xferTime(p.write_speed_mbps, 50);
  const t100 = xferTime(p.write_speed_mbps, 100);
  return {
    id: "elite-pro-creator",
    label: "Professional Creator",
    tagline: `The ${p.brand_name} ${p.name} delivers ${read} reads and ${write} writes - a top-tier ${p.interface} drive for demanding professional workflows.`,
    blocks: [
      {
        type: "prose",
        title: "Professional Transfer Speeds",
        content: `With ${read} sequential reads and ${write} sequential writes over ${p.interface}, this drive redefines what an external SSD can do. A 50GB 4K video project transfers in ${t50}; a 100GB RAW photo session moves in ${t100}. For creative professionals working with 8K footage, massive Lightroom catalogs, or complex After Effects compositions, this speed eliminates the need for proxy workflows.`,
      },
      {
        type: "prose",
        title: "Built for Sustained Workloads",
        content: `Rated for ${p.tbw.toLocaleString()} TBW (terabytes written), the ${p.name} handles daily rewrite cycles without breaking a sweat. The ${p.warranty_years}-year warranty backs its endurance rating, making it a reliable choice for professionals who depend on their storage day in and day out.`,
      },
      {
        type: "bullets",
        title: "Ideal for",
        items: [
          `8K and 4K video editors needing ${t50} transfers of large project files`,
          `Photographers moving ${cap}+ catalogs between shoots and workstations`,
          `Sound engineers transporting multi-track session files`,
          `Creative pros who work across Mac, PC, and iPad`,
        ],
      },
      {
        type: "callout",
        content: `${p.interface} delivers the bandwidth needed for seamless playback and editing of high-bitrate media directly from the drive - no file transfer required.`,
      },
    ],
  };
}

function consoleGaming(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  const gamesLow = Math.floor(p.capacity_gb / 80);
  const gamesHigh = Math.floor(p.capacity_gb / 40);
  return {
    id: "console-gaming",
    label: "Console Expansion",
    tagline: `Expand your game library with the ${p.name} - ${cap} of ${read} storage purpose-built for consoles and gaming PCs.`,
    blocks: [
      {
        type: "prose",
        title: "Game-Ready Performance",
        content: `With ${read} reads and ${write} writes, the ${p.name} delivers load times that rival internal SSDs. Level transitions, fast travel, and open-world asset streaming all benefit from the jump over traditional HDD external storage - expect 3-5× faster load times in most titles.`,
      },
      {
        type: "prose",
        title: "Capacity for the Modern Library",
        content: `${cap} of storage holds an estimated ${gamesLow}-${gamesHigh} AAA titles, depending on install size. That is enough space for an active rotation of multiplayer titles alongside a deep single-player backlog, without juggling uninstalls.`,
      },
      {
        type: "bullets",
        title: "Best paired with",
        items: [
          `Xbox Series X|S and PlayStation 5 for external game storage`,
          `Gaming laptops with limited internal SSD space`,
          `Steam Deck and ROG Ally for portable game libraries`,
          `Rapid game switching without HDD thrash`,
        ],
      },
      {
        type: "callout",
        content: `While USB-connected externals store and play Xbox Series X|S and PS5 titles, native internal SSDs may be required for full next-gen optimized performance on certain titles.`,
      },
    ],
  };
}

function ruggedPortable(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  return {
    id: "rugged-portable",
    label: "Rugged & Portable",
    tagline: `The ${p.name} brings ${cap} of ${read} storage that is built to survive drops, dust, and water - your data follows you anywhere.`,
    blocks: [
      {
        type: "prose",
        title: "Built for Real-World Conditions",
        content: `Unlike bare internal drives or fragile externals, the ${p.name} is engineered for the field. Drop-tested and sealed against dust and water ingress, it survives the bumps of daily commuting, coffee shop tables, and outdoor shoots. Whether you are backing up drone footage at a remote location or transferring camera cards between shoots, this drive does not require kid-glove handling.`,
      },
      {
        type: "prose",
        title: "No Speed Sacrifice",
        content: `Despite its tough exterior, the ${p.name} delivers ${read} reads and ${write} writes - fast enough for 4K video playback, large file transfers, and daily backups. With ${p.tbw.toLocaleString()} TBW endurance and a ${p.warranty_years}-year warranty, it is built to last through years of active use.`,
      },
      {
        type: "bullets",
        title: "Ideal for",
        items: [
          `Outdoor photographers and drone pilots backing up in the field`,
          `Field service and industrial data collection`,
          `Students and commuters tossing a drive in a bag without a protective case`,
          `Anyone who wants storage that keeps up with an active lifestyle`,
        ],
      },
      {
        type: "callout",
        content: `${cap} of rugged, pocket-sized storage means less time worrying about your gear and more time focused on your work.`,
      },
    ],
  };
}

function highspeedUsbPro(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  const t50 = xferTime(p.write_speed_mbps, 50);
  const t100 = xferTime(p.write_speed_mbps, 100);
  return {
    id: "highspeed-usb-pro",
    label: "High-Speed USB Pro",
    tagline: `The ${p.brand_name} ${p.name} delivers ${write} writes and ${cap} capacity - pro-grade speed without the Thunderbolt price premium.`,
    blocks: [
      {
        type: "prose",
        title: "Pro-Grade USB Performance",
        content: `USB 3.2 Gen 2×2 unlocks a 20 Gbps pipeline, and the ${p.name} uses every bit of it. With ${read} reads and ${write} writes, this drive handles 4K and 6K video editing directly from the drive - a 50GB file transfers in ${t50}, making it a strong alternative to Thunderbolt solutions for professionals on a budget.`,
      },
      {
        type: "prose",
        title: "Universal Compatibility",
        content: `Unlike Thunderbolt drives, the ${p.name} works with any USB-C or USB-A port, though Gen 2×2 speeds require a compatible port. Connected to a standard USB 3.2 Gen 2 port, it still delivers up to 10 Gbps - enough for fast backups and everyday transfers. This makes it a versatile companion across different machines.`,
      },
      {
        type: "bullets",
        title: "Who it serves",
        items: [
          `Content creators editing video directly from external storage`,
          `Professionals who move large files between Mac and PC`,
          `Users with Gen 2×2 capable hardware wanting maximum USB throughput`,
          `Photographers managing ${cap}+ photo and video libraries`,
        ],
      },
      {
        type: "callout",
        content: `For maximum throughput, connect to a USB 3.2 Gen 2×2 port (marked with "20 Gbps" or "SSP+"). Backward compatible with all USB-C and USB-A ports.`,
      },
    ],
  };
}

function budgetEveryday(p: Product): DriveArchetype {
  const cap = fmtCap(p.capacity_gb);
  const read = fmtSpeed(p.read_speed_mbps);
  const write = fmtSpeed(p.write_speed_mbps);
  return {
    id: "budget-everyday",
    label: "Everyday Storage",
    tagline: `Reliable ${cap} storage with ${read} reads - the ${p.name} is a practical, affordable choice for daily backups and file transport.`,
    blocks: [
      {
        type: "prose",
        title: "Solid Everyday Performance",
        content: `With ${read} reads and ${write} writes over a USB-C connection, the ${p.name} delivers reliable performance for daily computing needs. Backing up documents, transferring photos from a laptop to a desktop, or storing a media library - this drive handles routine tasks with consistent speed and zero fuss.`,
      },
      {
        type: "prose",
        title: "Practical, No-Compromise Design",
        content: `${cap} of storage provides generous headroom for everyday files. The compact, lightweight design slips into any bag pocket, and with ${p.tbw.toLocaleString()} TBW endurance backed by a ${p.warranty_years}-year warranty, it is a storage investment that will serve you for years.`,
      },
      {
        type: "bullets",
        title: "Great for",
        items: [
          `Daily system backups (Time Machine, File History, or rsync)`,
          `Expanding a laptop or Chromebook storage`,
          `School and office file transport between devices`,
          `Storing and organizing photo and music libraries`,
        ],
      },
      {
        type: "callout",
        content: `${read} reads are typical of a SATA SSD in an external enclosure - noticeably faster than any external HDD, yet well below the speed of Gen 2×2 or Thunderbolt drives. For most daily tasks, this is more than enough.`,
      },
    ],
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
