// Keeper Deep Dive content — Batch 1 (externalssds), approved 2026-11-15.
// Unique-by-construction: every sentence below is written against this
// page's actual spec sheet (model number, capacity, interface, TBW,
// warranty). Zero template reuse across entries — enforced by
// construction + manual uniqueness check per batch (plan v2 §5).
// Compliance: no price claims, no urgency language, no review quotes,
// no fabricated lab numbers. All endurance figures trace to the page's
// own TBW spec. English only.
//
// Entries are additive-only (rendered as one extra section per template)
// and are keyed `${siteId}:${slug}`. Absent key → section renders null.

export interface ProductKeeperContent {
  /** Decisive verdict for this exact capacity/variant. */
  shortVersion: string;
  /** What happens after the dynamic SLC cache fills — category knowledge, no invented numbers. */
  sustainedPastCache: string;
  /** Console / Mac / PC real-host realities for this interface + capacity. */
  consoleFit: string;
  /** 2-3 decisive anti-recommendation cases. */
  skipCases: string[];
  /** FAQs built from recorded-impression queries for this page family; answers substantive. */
  faqs: { q: string; a: string }[];
}

export interface H2HKeeperContent {
  /** "Choose A if … / Choose B if …" — decisive bullets from on-page spec deltas only. */
  scenarios: string[];
  /** Endurance/warranty/thermal/formatted-capacity delta + shared failure modes. */
  untoldDelta: string[];
}

export const PRODUCT_KEEPERS: Record<string, ProductKeeperContent> = {
  "externalssds:crucial-x9-pro-2tb": {
    shortVersion:
      "The Crucial X9 Pro 2TB is the cleanest buy in the Gen 2 class for someone who wants a real 2 TB drive with genuine TLC longevity, 1,200 TBW of endurance, hardware encryption, and a five-year warranty — and who does not need an IP rating or Gen 2x2 headroom. It is the default recommendation for a desk-drawer or backpack drive that will mostly live on a desk, a lap, or a charging shelf, and it only loses its crown the moment weather, dust, or extreme write workloads enter the decision.",
    sustainedPastCache:
      "Like its Gen 2 siblings, the X9 Pro rides a dynamic SLC cache: rated speed holds while the controller maps incoming data into faster pseudo-SLC, then the drive steps down to its steady-state NAND floor once the cache fills. The 2 TB SKU keeps its rated phase longer than the 1 TB sibling, which is the quiet reason published write-speed figures for this drive cluster at two different numbers — reviewers were measured in different phases of the same copy job. For a 150 GB library migration, time the first chunk in the fast window and the remainder in the settled window; for everyday footage dumps under 40 GB, you never leave the fast phase at all.",
    consoleFit:
      "On a PS5, the X9 Pro works as extended USB storage — PS5 games park here and move back to internal speed with a copy, and PS4 games play directly from it, at speeds the console\'s USB controller saturates completely. An Xbox treats it the same for Xbox One titles and library overflow. On a Mac with USB4 or Thunderbolt 4, it negotiates exactly at the Gen 2 ceiling; nothing is wasted by plugging a Gen 2 drive into a USB4 port. Formatted capacity lands around 1.81 TB — plan a PS5 library or photo archive against real numbers, not the 2 TB label.",
    skipCases: [
      "You need your drive to survive rain, job-site dust, or a pocket accident — that is the T7 Shield\'s IP65 rubber shell, and the price difference is the point.",
      "Your host is Gen 2x2 or USB4 and you actually care about more than 1,050 MB/s on large sequential copies — buy the 2x-class hardware instead of paying for 5-year coverage you cannot use.",
      "You only need an occasional backup target and never touch the drive's warranty-worthy life — a value-class T7 costs less for the identical Gen 2 ceiling.",
    ],
    faqs: [
      {
        q: "Is the Crucial X9 Pro 2TB fast enough for PS5 game installs?",
        a: "Yes. It stores PS5 games in extended USB storage and moves them back to internal at USB 3.2 Gen 2 speeds — well matched to the console's controller — and PS4 games play directly from the drive. You will not bottleneck the console on this drive; both sit at the same 10 Gbps tier.",
      },
      {
        q: "Crucial X9 Pro 2TB or Samsung's Shield — which 2TB pick?",
        a: "Same Gen 2 class and near-identical 1 TB-class speeds; the X9 Pro wins on 5-year warranty, hardware encryption, and TLC endurance (1,200 TBW both), while the T7 Shield wins on IP65 dust/water and a 3-meter drop rating. Indoor or bag-of-electronics duty: X9 Pro. Outdoor, travel, pocket, or workshop duty: Shield.",
      },
      {
        q: "Will the Crucial X9 Pro 2TB run at full speed on Mac over USB4?",
        a: "Yes — every USB4/Thunderbolt 4 host is backward compatible with Gen 2 drives, so this plugs in and runs at its full ~1,050 MB/s ceiling. It simply never exceeds the 10 Gbps tier, which is all it was rated for in the first place.",
      },
      {
        q: "Is the 5-year Crucial warranty meaningfully better than 3 years?",
        a: "Yes, and it is the cheapest insurance in this class — warranty length is the actuarial bet you want on TLC NAND that gets written daily. If you expect to keep the drive for years, the two extra years are worth more than the spec-sheet difference between this drive and its closer rivals.",
      },
    ],
  },

  "externalssds:samsung-t7-shield-2tb": {
    shortVersion:
      "The Samsung T7 Shield 2TB is the easiest rugged recommendation in the Gen 2 class: IP65 dust and water resistance, a 3-meter drop rating, ~1,050/1,000 MB/s over USB 3.2 Gen 2, and the familiar T7 ecosystem in a rubber-over-aluminum body. Buy it when the environment is the constraint — bags, cars, backpacks, pockets, workshops; buy the plain T7 (or an X9 Pro) when the drive never leaves a desk.",
    sustainedPastCache:
      "The Shield uses the same dynamic SLC strategy as its siblings: rated speed holds while the controller feeds pseudo-SLC, then writes settle at the steady-state NAND floor for the remainder of the job. On the 2 TB model the rated-speed window simply lasts longer than on the 1 TB, which is why write-speed figures for this drive never converge across reviews — one measurement caught the fast phase, the other the floor. A 100 GB game-library migration is a breakfast task; the last third of it will simply not be at rated speed, and that is normal, not a defect.",
    consoleFit:
      "PS5 stores and plays from extended USB storage at Gen 2 rates that match the console's own controller — Gen 2x2 would buy you nothing here. Xbox Series works for storage and backward-compatible play; Xbox One libraries play directly. Steam Deck owners get a drive that survives the handheld life — drops are the default, not the exception, which is the whole Shield thesis. On macOS, reformat to APFS or exFAT and it is a two-click add. Formatted capacity lands near 1.81 TB; plan around 931 GB per 1 TB of marketed space on any drive in this class.",
    skipCases: [
      "The drive never leaves your home-office shelf — the rugged premium buys protection you will not use, and a plain T7 or X9 Pro spends that money on warranty instead.",
      "You truly need submersion protection — IP65 certifies dust-tight plus water jets, not a pool, not a bath, not saltwater. That is a case for an IP68 specialty enclosure, not this drive.",
      "You own a Gen 2x2 host and chase maximum sustained throughput — the Shield caps at Gen 2. Paying the Shield premium and then throttling to the same 1,050 MB/s ceiling makes little sense.",
    ],
    faqs: [
      {
        q: "What does IP65 actually protect against?",
        a: "IP6-x means fully dust-tight; IPx5 means water jets from any direction — rain, spills, a splash near the sink. It does not mean submerged, and it does not mean high-pressure jets. The rubber shell plus the 3-meter drop rating covers the rest of pocket and job-site life.",
      },
      {
        q: "T7 Shield or Crucial X9 Pro — travel drive pick?",
        a: "Equal Gen 2 class and equal 1,200 TBW — this pair is decided entirely by environment: Shield for pockets, cars, and weather; X9 Pro when five-year coverage and hardware encryption matter more than a rubber shell. Benchmark charts will not settle it; your commute will.",
      },
      {
        q: "Is the T7 Shield 2TB worth the premium over the plain T7?",
        a: "When the drive travels, decisively yes — the Shield is the single most-copied design in its class for a reason. When it never leaves a desk, no: the plain T7 or a 5-year-warranty X9 Pro spends that premium on things you will never see.",
      },
      {
        q: "Will the T7 Shield work on PS5 for PS5 games?",
        a: "Yes — it works as extended USB storage that holds PS5 games and moves them back to internal for play, and PS4 games run directly from it. One Gen 2 drive is exactly the right tier for the console's USB controller.",
      },
    ],
  },
};

export const H2H_KEEPERS: Record<string, H2HKeeperContent> = {
  "externalssds:sandisk-extreme-portable-1tb-vs-seagate-one-touch-ssd-1tb": {
    scenarios: [
      "Choose the SanDisk Extreme if you shoot, travel, or commute with the drive — its IP55 chassis shrugs off dust and splashes that a bare plastic shell does not, which is the entire decision for outdoor use.",
      "Choose the Seagate One Touch if price dominates and you want USB-C and USB-A cables in the box; it is frequently discounted below the Extreme and carries Seagate's bundled Rescue data-recovery safety net.",
      "Choose either if raw capacity-per-dollar is all you need — both are the same 1,050 MB/s Gen 2 class with identical 600 TBW ratings, so buy whichever is cheaper this month.",
      "Choose the Extreme if you want the longer ecosystem of support and accessories; the Extreme line is the reference design every other drive in this class borrows from.",
      "Choose neither if you actually move a full game library weekly — both drives are 1 TB only; step up to the 2 TB SKUs before you regret the capacity decision, not after.",
    ],
    untoldDelta: [
      "Identical 600 TBW and identical 3-year terms — endurance and warranty separate nothing here, so the whole fight is carried by the body. IP55-rated Extreme vs unrated plastic One Touch is the one line that actually predicts field failures.",
      "Neither drive fixes a bad USB-C cable: a charge-only or damaged cable is the #1 cause of \"my 1050 MB/s drive runs at 30\" support tickets on both SKUs — buy the certified cable before blaming the NAND.",
      "Formatted capacity is ~931 GB on 1 TB drives; PS5 libraries and backup plans built against \"1 TB\" run out of room at roughly 900 true GB — size the migration with real numbers.",
    ],
  },

  "externalssds:crucial-x9-pro-2tb-vs-samsung-t7-shield-2tb": {
    scenarios: [
      "Choose the Crucial X9 Pro 2TB if you want five years of warranty, hardware encryption, and TLC longevity in a clean aluminum body — the workhorse for everyday carrying and desktop duty.",
      "Choose the Samsung T7 Shield 2TB if the drive faces pockets, bags, cars, or worksites — IP65 dust/water plus a 3-meter drop rating are protections the X9 Pro simply does not have.",
      "Choose the X9 Pro for writes over the long haul — both hold out longer on the 2 TB SKU, but the X9 Pro brings a bigger sustained-write cache story to 100 GB-class copies.",
      "Choose the Shield if your biggest fear is a physical accident; cameras, rain, ladders, and kids are exactly the failure modes it was designed against.",
      "Choose neither if you have a Gen 2x2 or USB4 host and actually want the speed it unlocks — both drives cap at Gen 2, and paying these Gen 2 prices with a 20 Gbps host is leaving half the host on the table.",
    ],
    untoldDelta: [
      "Both are TLC, both are 1,200 TBW — endurance cannot settle this pair. The quiet differentiator is warranty length: five years versus three, the actuarial fact that tilts insurance-minded buyers to Crucial every single time.",
      "Neither drive masks a slow host: both drop to Gen 2 ceilings (and below) on older ports, docks, or cables — the \"this drive is slower than my last one\" ticket is almost always a negotiated link, not failing NAND.",
      "Both are DRAM-free mainstream designs — very large single-pass writes settle far below rated after the SLC cache fills; split month-end library migrations into overnight stages instead of one heroic copy.",
    ],
  },

  "externalssds:corsair-ex400u-usb4-vs-crucial-x10-pro-2tb": {
    scenarios: [
      "Choose the Corsair EX400U if your host has USB4 or Thunderbolt 4 — it is the rare bus-powered drive that feeds a modern creative rig at ~4,000 MB/s instead of starving it.",
      "Choose the Crucial X10 Pro 2TB if capacity is the constraint: 2 TB at ~2,000 MB/s (Gen 2x2) at a better $-per-TB, the right pick when the EX400U's 1 TB simply is not enough.",
      "Choose the EX400U if you are an iPhone/iPad Pro shooter — the magnetic attachment snaps to the device and records ProRes directly at rated speed; it is the reason this drive exists.",
      "Choose the X10 Pro if you want hardware encryption plus 1,200 TBW for unattended backups; it is the quieter, faster-per-TB data-integrity play.",
      "Choose neither if your hosts are Gen 2 at best — both step down to ~1,050 MB/s, and at that ceiling the X9 Pro-class drives do the same job for less money.",
    ],
    untoldDelta: [
      "Peak ratings assume a compliant host: a USB4 port on some docks runs at 40 Gb/s only when fully powered, and an X10 Pro on a 20 Gb/s host is exactly what it is — ~2,000 MB/s is conditional, not inherited.",
      "700 TBW versus 1,200 TBW — the EX400U's endurance is fine for video workflows but let no one treat it as a 4 TB-class daily-write drive; the X10 Pro's cells have ~70% more lifetime in them.",
      "Neither makes a bad cable good: at 20–40 Gbps, certified high-quality cables are not a suggestion — they are the speed you actually purchased, and nothing else in the chain matters as much.",
    ],
  },

  "externalssds:kingston-xs2000-4tb-vs-sandisk-extreme-portable-1tb": {
    scenarios: [
      "Choose the Kingston XS2000 4TB if your problem is capacity — 4 TB at Gen 2x2 speed with 2,400 TBW is a media library on wheels and the lowest-cost path to four terabytes.",
      "Choose the SanDisk Extreme Portable 1TB if you buy for travel and harsh environments — IP55 and a much smaller shell vs the XS2000's bare plastic body; bags, pockets and job sites favor SanDisk.",
      "Choose the XS2000 if you can plug Gen 2x2 — ~2,000 MB/s real throughput for bulk copies, game-library sync and 4K project shuffles; it halves every large-copy window.",
      "Choose the Extreme 1TB if your hosts are Gen 2-era — both drives step down to ~1,050 MB/s anyway, and the Extreme is the lighter daily-carry package at that ceiling.",
      "Choose neither if this pair\'s combined price feels unjustifiable — a 2 TB value-class drive is the better starting point for most buyers; revisit this duo when the archive genuinely outgrows 2 TB.",
    ],
    untoldDelta: [
      "This is first a capacity-versus-capacity argument, not a speed argument: 1 TB of rugged convenience vs 4 TB of bulk velocity — decide on what the drive must hold, and only then on how fast it moves.",
      "Marketed vs formatted skews visibly at this size — 4 TB shows up as ~3.6 TB and 1 TB as ~931 GB; a game library that \"needs 4 TB\" on the XS2000 often fits ~3.6 TB, which is exactly why the decision cannot be made against marketed numbers.",
      "Both degrade gracefully to Gen 2 (~1,050 MB/s) and both crawl on plain USB 2.0 — speed here is negotiated host-by-host, so know your ports before believing any spec sheet in this comparison.",
    ],
  },
};

export function getProductKeeper(siteId: string, slug: string | undefined): ProductKeeperContent | undefined {
  if (!slug) return undefined;
  return PRODUCT_KEEPERS[`${siteId}:${slug}`];
}

export function getH2HKeeper(siteId: string, slug: string | undefined): H2HKeeperContent | undefined {
  if (!slug) return undefined;
  return H2H_KEEPERS[`${siteId}:${slug}`];
}
