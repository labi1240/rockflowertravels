// ─────────────────────────────────────────────────────────────────────────────
//  Fare catalog — SINGLE SOURCE OF TRUTH for shuttle pricing.
//
//  Every surface (booking modal, hero form, service cards, schedule, FAQ, and the
//  server-authoritative /api/checkout/create-payment-intent route) MUST read prices
//  from here. Do NOT hardcode dollar amounts anywhere else — that is exactly what
//  made every route look like the same price.
//
//  Prices are CAD cents, per seat, pre-GST. GST (5% Alberta) is applied to the
//  fare + toll subtotal. The Moraine Lake toll is charged per passenger.
//
//  Source: client pricing sheet (June 2026). Three tiers:
//    • Sunrise (premium, 4:30 AM, isolated inventory)
//    • Daytime (from Banff, plus the Lake Louise ⇄ Moraine connector)
//    • Evening (Lake Louise → Banff return)
// ─────────────────────────────────────────────────────────────────────────────

export type FareId =
  | 'sunrise-banff-moraine'
  | 'sunrise-banff-ll'
  | 'banff-ll'
  | 'banff-ll-moraine'
  | 'll-moraine'
  | 'evening-ll-banff';

export type FareTier = 'sunrise' | 'daytime' | 'evening';

// Mirrors the Prisma `RouteKind` enum values (kept as a plain string union so this
// module stays import-safe in client components — no generated Prisma code pulled in).
export type RouteKindKey = 'SUNRISE_EXPRESS' | 'DAYTIME_CIRCUIT' | 'EVENING_RETURN';

export const GST_RATE = 0.05;

export interface Fare {
  id: FareId;
  tier: FareTier;
  routeKind: RouteKindKey; // inventory bucket + premium isolation
  label: string; // full descriptive label, e.g. "Banff → Lake Louise + Moraine Lake"
  short: string; // compact label for tight selectors
  origin: string;
  destination: string;
  priceCents: number; // base fare per seat, pre-toll, pre-GST
  tollCents: number; // Moraine Lake toll per passenger, pre-GST (0 if none)
  roundTrip: boolean; // true = one ticket covers both directions
  premium: boolean;
  defaultTime: string; // must be one of TIME_OPTIONS[id]
  note?: string; // short clarifying line shown in the trip summary
}

export const FARES: Record<FareId, Fare> = {
  // ── Sunrise (premium) ──────────────────────────────────────────────────────
  'sunrise-banff-moraine': {
    id: 'sunrise-banff-moraine',
    tier: 'sunrise',
    routeKind: 'SUNRISE_EXPRESS',
    label: 'Banff → Moraine Lake (Sunrise Express)',
    short: 'Sunrise · Banff → Moraine',
    origin: 'Banff',
    destination: 'Moraine Lake',
    priceCents: 9998, // $99.98
    tollCents: 0,
    roundTrip: false,
    premium: true,
    defaultTime: '4:30 AM',
    note: 'Premium direct departure — first light at Moraine Lake.',
  },
  'sunrise-banff-ll': {
    id: 'sunrise-banff-ll',
    tier: 'sunrise',
    routeKind: 'SUNRISE_EXPRESS',
    label: 'Banff → Lake Louise (Sunrise Express)',
    short: 'Sunrise · Banff → Lake Louise',
    origin: 'Banff',
    destination: 'Lake Louise',
    priceCents: 7999, // $79.99
    tollCents: 0,
    roundTrip: false,
    premium: true,
    defaultTime: '4:30 AM',
    note: 'Premium early departure to Lake Louise.',
  },

  // ── Daytime (from Banff + the Lake Louise ⇄ Moraine connector) ──────────────
  'banff-ll': {
    id: 'banff-ll',
    tier: 'daytime',
    routeKind: 'DAYTIME_CIRCUIT',
    label: 'Banff → Lake Louise',
    short: 'Banff → Lake Louise',
    origin: 'Banff',
    destination: 'Lake Louise',
    priceCents: 6599, // $65.99
    tollCents: 0,
    roundTrip: false,
    premium: false,
    defaultTime: '7:00 AM',
  },
  'banff-ll-moraine': {
    id: 'banff-ll-moraine',
    tier: 'daytime',
    routeKind: 'DAYTIME_CIRCUIT',
    label: 'Banff → Lake Louise + Moraine Lake',
    short: 'Banff → Both Lakes',
    origin: 'Banff',
    destination: 'Lake Louise & Moraine Lake',
    priceCents: 8999, // $89.99
    tollCents: 500, // +$5.00 Moraine Lake toll, per passenger
    roundTrip: false,
    premium: false,
    defaultTime: '7:00 AM',
    note: 'Visits both lakes. +$5 Moraine Lake toll per guest, plus GST.',
  },
  'll-moraine': {
    id: 'll-moraine',
    tier: 'daytime',
    routeKind: 'DAYTIME_CIRCUIT',
    label: 'Lake Louise ⇄ Moraine Lake (round trip)',
    short: 'Lake Louise ⇄ Moraine',
    origin: 'Lake Louise',
    destination: 'Moraine Lake',
    priceCents: 8999, // $89.99
    tollCents: 0,
    roundTrip: true,
    premium: false,
    defaultTime: '7:00 AM',
    note: 'Direct shuttle — one ticket covers both directions (there and back).',
  },

  // ── Evening return ─────────────────────────────────────────────────────────
  // NOTE: Not on the June 2026 pricing sheet. Priced to mirror the Banff → Lake
  // Louise one-way ($65.99). Confirm with the client before launch.
  'evening-ll-banff': {
    id: 'evening-ll-banff',
    tier: 'evening',
    routeKind: 'EVENING_RETURN',
    label: 'Lake Louise → Banff (Evening Return)',
    short: 'Evening · Lake Louise → Banff',
    origin: 'Lake Louise',
    destination: 'Banff',
    priceCents: 6599, // $65.99 — assumed, mirrors banff-ll
    tollCents: 0,
    roundTrip: false,
    premium: false,
    defaultTime: '6:00 PM',
    note: 'End-of-day transfer back to Banff.',
  },
};

export const FARE_IDS = Object.keys(FARES) as FareId[];

// Tier metadata for grouped selectors and marketing cards.
export const TIERS: { key: FareTier; label: string; window: string }[] = [
  { key: 'sunrise', label: 'Sunrise Express', window: '4:30 AM departure' },
  { key: 'daytime', label: 'Daytime', window: '7:00 AM – 5:20 PM' },
  { key: 'evening', label: 'Evening Return', window: '6:00 PM departure' },
];

export const FARES_BY_TIER: Record<FareTier, Fare[]> = {
  sunrise: FARE_IDS.map((id) => FARES[id]).filter((f) => f.tier === 'sunrise'),
  daytime: FARE_IDS.map((id) => FARES[id]).filter((f) => f.tier === 'daytime'),
  evening: FARE_IDS.map((id) => FARES[id]).filter((f) => f.tier === 'evening'),
};

// Cheapest fare per tier — for the "from $X" marketing labels.
export const TIER_FROM_CENTS: Record<FareTier, number> = {
  sunrise: Math.min(...FARES_BY_TIER.sunrise.map((f) => f.priceCents)),
  daytime: Math.min(...FARES_BY_TIER.daytime.map((f) => f.priceCents)),
  evening: Math.min(...FARES_BY_TIER.evening.map((f) => f.priceCents)),
};

// A representative fare to pre-select when the user enters from a tier-level CTA.
export const TIER_DEFAULT_FARE: Record<FareTier, FareId> = {
  sunrise: 'sunrise-banff-moraine',
  daytime: 'banff-ll-moraine',
  evening: 'evening-ll-banff',
};

export function getFare(id: FareId): Fare {
  return FARES[id];
}

export function isFareId(value: unknown): value is FareId {
  return typeof value === 'string' && value in FARES;
}

export interface Quote {
  fareCents: number; // base fare × passengers
  tollCents: number; // toll × passengers
  subtotalCents: number; // fare + toll (taxable base)
  gstCents: number; // 5% GST on subtotal
  totalCents: number; // grand total
}

// Server-authoritative AND client-preview pricing. Single implementation so the
// number the rider sees is exactly the number Stripe charges.
export function quote(id: FareId, passengers: number): Quote {
  const fare = FARES[id];
  const fareCents = fare.priceCents * passengers;
  const tollCents = fare.tollCents * passengers;
  const subtotalCents = fareCents + tollCents;
  const gstCents = Math.round(subtotalCents * GST_RATE);
  return {
    fareCents,
    tollCents,
    subtotalCents,
    gstCents,
    totalCents: subtotalCents + gstCents,
  };
}

// "$89.99" — formats CAD cents as a dollar string (no currency suffix).
export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
