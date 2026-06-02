// Seeds reference data matching the RockFlower Travels daily schedule PDF.
// Run with: npx dotenv -e .env -- npx tsx prisma/seed.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { RouteKind } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const hm = (h: number, m: number) => h * 60 + m;

// Per-leg reference prices (CAD cents). NOTE: the authoritative, customer-facing
// pricing lives in src/lib/fares.ts — that catalog is what the checkout API charges.
// These leg values are kept roughly in sync for the schedule/admin views only.
const PRICES = {
  SUNRISE_BANFF_MORAINE: 9998,        // $99.98 — Sunrise Banff → Moraine
  DAYTIME_SAMSON_LL: 6599,            // $65.99 — Banff → Lake Louise daytime
  DAYTIME_LL_MORAINE: 8999,           // $89.99 — Lake Louise ⇄ Moraine connector
  DAYTIME_MORAINE_SAMSON: 6599,       // $65.99 — return leg
  EVENING_LL_BANFF: 6599,             // $65.99 — Evening Return (assumed, see fares.ts)
};

// Fare catalog — verbatim copy of the historical src/lib/fares.ts FARES map, now the
// DB source of truth. Seeded idempotently (upsert by id) so the cutover is price-neutral.
const FARE_SEED = [
  { id: "sunrise-banff-moraine", tier: "sunrise", routeKind: "SUNRISE_EXPRESS", routeSlug: "sunrise-express", label: "Banff → Moraine Lake (Sunrise Express)", short: "Sunrise · Banff → Moraine",        origin: "Banff",       destination: "Moraine Lake",               priceCents: 9998, tollCents: 0,   roundTrip: false, premium: true,  defaultTime: "4:30 AM", note: "Premium direct departure — first light at Moraine Lake.", sortOrder: 1 },
  { id: "sunrise-banff-ll",      tier: "sunrise", routeKind: "SUNRISE_EXPRESS", routeSlug: "sunrise-express", label: "Banff → Lake Louise (Sunrise Express)", short: "Sunrise · Banff → Lake Louise",   origin: "Banff",       destination: "Lake Louise",                priceCents: 7999, tollCents: 0,   roundTrip: false, premium: true,  defaultTime: "4:30 AM", note: "Premium early departure to Lake Louise.",               sortOrder: 2 },
  { id: "banff-ll",              tier: "daytime", routeKind: "DAYTIME_CIRCUIT", routeSlug: "daytime-circuit", label: "Banff → Lake Louise",                  short: "Banff → Lake Louise",            origin: "Banff",       destination: "Lake Louise",                priceCents: 6599, tollCents: 0,   roundTrip: false, premium: false, defaultTime: "7:00 AM", note: null,                                                    sortOrder: 3 },
  { id: "banff-ll-moraine",      tier: "daytime", routeKind: "DAYTIME_CIRCUIT", routeSlug: "daytime-circuit", label: "Banff → Lake Louise + Moraine Lake",   short: "Banff → Both Lakes",             origin: "Banff",       destination: "Lake Louise & Moraine Lake", priceCents: 8999, tollCents: 500, roundTrip: false, premium: false, defaultTime: "7:00 AM", note: "Visits both lakes. +$5 Moraine Lake toll per guest, plus GST.", sortOrder: 4 },
  { id: "ll-moraine",            tier: "daytime", routeKind: "DAYTIME_CIRCUIT", routeSlug: "daytime-circuit", label: "Lake Louise ⇄ Moraine Lake (round trip)", short: "Lake Louise ⇄ Moraine",       origin: "Lake Louise", destination: "Moraine Lake",               priceCents: 8999, tollCents: 0,   roundTrip: true,  premium: false, defaultTime: "7:00 AM", note: "Direct shuttle — one ticket covers both directions (there and back).", sortOrder: 5 },
  { id: "evening-ll-banff",      tier: "evening", routeKind: "EVENING_RETURN",  routeSlug: "evening-return",  label: "Lake Louise → Banff (Evening Return)", short: "Evening · Lake Louise → Banff",   origin: "Lake Louise", destination: "Banff",                      priceCents: 6599, tollCents: 0,   roundTrip: false, premium: false, defaultTime: "6:00 PM", note: "End-of-day transfer back to Banff.",                    sortOrder: 6 },
] as const;

async function main() {
  // ── Stops ────────────────────────────────────────────────────────────────────
  const stops = await Promise.all(
    [
      { code: "BANFF",        name: "Banff",                       lat: 51.1784,  lng: -115.5708, notes: "Sunrise origin and Evening return destination." },
      { code: "SAMSON",       name: "Samson Mall (Lake Louise Village)", lat: 51.4254,  lng: -116.1773, notes: "Main pickup point in Lake Louise Village." },
      { code: "LL_LAKESHORE", name: "Lake Louise Lakeshore",       lat: 51.4170,  lng: -116.2170, notes: "Use designated loading area per staff direction." },
      { code: "MORAINE",      name: "Moraine Lake",                lat: 51.3217,  lng: -116.1860, notes: "Designated loading area only." },
    ].map((s) =>
      prisma.stop.upsert({ where: { code: s.code }, create: s, update: s }),
    ),
  );
  const byCode = Object.fromEntries(stops.map((s) => [s.code, s.id]));

  // ── Routes ───────────────────────────────────────────────────────────────────
  // Backfill slug/tier onto any pre-existing routes (created before slug existed),
  // matched by their legacy `kind`, so the slug-keyed upserts below update — not duplicate.
  const slugByKind: Array<[RouteKind, string, string]> = [
    [RouteKind.SUNRISE_EXPRESS, "sunrise-express", "sunrise"],
    [RouteKind.DAYTIME_CIRCUIT, "daytime-circuit", "daytime"],
    [RouteKind.EVENING_RETURN, "evening-return", "evening"],
  ];
  for (const [kind, slug, tier] of slugByKind) {
    await prisma.route.updateMany({ where: { kind, slug: null }, data: { slug, tier } });
  }

  // Routes are keyed by `slug` (stable identity). `kind` is kept as a legacy tag.
  const sunrise = await prisma.route.upsert({
    where: { slug: "sunrise-express" },
    create: {
      slug: "sunrise-express",
      tier: "sunrise",
      kind: RouteKind.SUNRISE_EXPRESS,
      displayName: "Sunrise Express",
      isPremium: true,
      description: "Premium 4:30 AM departure from Banff direct to Moraine Lake.",
    },
    update: { tier: "sunrise", kind: RouteKind.SUNRISE_EXPRESS },
  });
  const daytime = await prisma.route.upsert({
    where: { slug: "daytime-circuit" },
    create: {
      slug: "daytime-circuit",
      tier: "daytime",
      kind: RouteKind.DAYTIME_CIRCUIT,
      displayName: "Daytime Circuit",
      isPremium: false,
      description: "Repeating loop: Samson Mall → Lake Louise Lakeshore → Moraine Lake → Samson Mall.",
    },
    update: { tier: "daytime", kind: RouteKind.DAYTIME_CIRCUIT },
  });
  const evening = await prisma.route.upsert({
    where: { slug: "evening-return" },
    create: {
      slug: "evening-return",
      tier: "evening",
      kind: RouteKind.EVENING_RETURN,
      displayName: "Evening Return",
      isPremium: false,
      description: "6:00 PM service from Lake Louise Lakeshore back to Banff.",
    },
    update: { tier: "evening", kind: RouteKind.EVENING_RETURN },
  });

  // ── Sunrise Express template ─────────────────────────────────────────────────
  // One revenue leg (Banff → Moraine) plus two positioning legs (non-bookable).
  await upsertTemplate({
    routeId: sunrise.id,
    label: "Sunrise Express (04:30)",
    sortOrder: 1,
    legs: [
      { sequence: 1, fromCode: "BANFF",        toCode: "MORAINE",      departMin: hm(4, 30),  arriveMin: hm(6, 0),  bookable: true,  priceCents: PRICES.SUNRISE_BANFF_MORAINE },
      { sequence: 2, fromCode: "MORAINE",      toCode: "LL_LAKESHORE", departMin: hm(6, 10),  arriveMin: hm(6, 35), bookable: false, priceCents: 0 },
      { sequence: 3, fromCode: "LL_LAKESHORE", toCode: "SAMSON",       departMin: hm(6, 35),  arriveMin: hm(6, 50), bookable: false, priceCents: 0 },
    ],
    stops: byCode,
  });

  // ── Daytime Circuits ─────────────────────────────────────────────────────────
  const circuits: Array<{ label: string; start: [number, number] }> = [
    { label: "Circuit 1 (07:00)", start: [7, 0] },
    { label: "Circuit 2 (09:00)", start: [9, 0] },
    { label: "Circuit 3 (11:00)", start: [11, 0] },
    { label: "Circuit 4 (13:30)", start: [13, 30] },
    { label: "Circuit 5 (15:30)", start: [15, 30] },
  ];
  // Offsets from the PDF: Samson→LL = +15m, LL→Moraine = +25m (so +40m), Moraine→Samson = +70m (so +110m).
  for (let i = 0; i < circuits.length; i++) {
    const { label, start } = circuits[i];
    const t0 = hm(start[0], start[1]);
    await upsertTemplate({
      routeId: daytime.id,
      label,
      sortOrder: i + 1,
      legs: [
        { sequence: 1, fromCode: "SAMSON",       toCode: "LL_LAKESHORE", departMin: t0,        arriveMin: t0 + 15,  bookable: true, priceCents: PRICES.DAYTIME_SAMSON_LL },
        { sequence: 2, fromCode: "LL_LAKESHORE", toCode: "MORAINE",      departMin: t0 + 15,   arriveMin: t0 + 40,  bookable: true, priceCents: PRICES.DAYTIME_LL_MORAINE },
        { sequence: 3, fromCode: "MORAINE",      toCode: "SAMSON",       departMin: t0 + 40,   arriveMin: t0 + 110, bookable: true, priceCents: PRICES.DAYTIME_MORAINE_SAMSON },
      ],
      stops: byCode,
    });
  }

  // ── Evening Return ───────────────────────────────────────────────────────────
  await upsertTemplate({
    routeId: evening.id,
    label: "Evening Return (18:00)",
    sortOrder: 1,
    legs: [
      { sequence: 1, fromCode: "LL_LAKESHORE", toCode: "BANFF", departMin: hm(18, 0), arriveMin: hm(19, 15), bookable: true, priceCents: PRICES.EVENING_LL_BANFF },
    ],
    stops: byCode,
  });

  // ── Vehicles ─────────────────────────────────────────────────────────────────
  for (let i = 1; i <= 4; i++) {
    const code = `BUS-0${i}`;
    await prisma.vehicle.upsert({
      where: { code },
      create: { code, seatCapacity: 25, active: true },
      update: { seatCapacity: 25, active: true },
    });
  }

  // ── Fare catalog ─────────────────────────────────────────────────────────────
  for (const fare of FARE_SEED) {
    const data = { ...fare, note: fare.note ?? null };
    await prisma.fare.upsert({ where: { id: fare.id }, create: data, update: data });
  }

  console.log("Seed complete: stops, routes, schedule templates, vehicles, fares.");
}

type LegInput = {
  sequence: number;
  fromCode: string;
  toCode: string;
  departMin: number;
  arriveMin: number;
  bookable: boolean;
  priceCents: number;
};

async function upsertTemplate(params: {
  routeId: string;
  label: string;
  sortOrder: number;
  legs: LegInput[];
  stops: Record<string, string>;
}) {
  // Idempotent: find existing template by (routeId, label) and reset its legs.
  const existing = await prisma.scheduleTemplate.findFirst({
    where: { routeId: params.routeId, label: params.label },
  });

  const template = existing
    ? await prisma.scheduleTemplate.update({
        where: { id: existing.id },
        data: { sortOrder: params.sortOrder, legs: { deleteMany: {} } },
      })
    : await prisma.scheduleTemplate.create({
        data: { routeId: params.routeId, label: params.label, sortOrder: params.sortOrder },
      });

  await prisma.legTemplate.createMany({
    data: params.legs.map((l) => ({
      templateId: template.id,
      sequence: l.sequence,
      fromStopId: params.stops[l.fromCode],
      toStopId: params.stops[l.toCode],
      departMin: l.departMin,
      arriveMin: l.arriveMin,
      bookable: l.bookable,
      priceCents: l.priceCents,
    })),
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
