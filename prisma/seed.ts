// Seeds reference data matching the RockFlower Travels daily schedule PDF.
// Run with: npx dotenv -e .env -- npx tsx prisma/seed.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { RouteKind } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const hm = (h: number, m: number) => h * 60 + m;

const PRICES = {
  SUNRISE_BANFF_MORAINE: 6499,        // $64.99 CAD per seat
  DAYTIME_SAMSON_LL: 6499,            // $64.99
  DAYTIME_LL_MORAINE: 6499,           // $64.99
  DAYTIME_MORAINE_SAMSON: 6499,       // $64.99
  EVENING_LL_BANFF: 6499,             // $64.99
};

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
  const sunrise = await prisma.route.upsert({
    where: { kind: RouteKind.SUNRISE_EXPRESS },
    create: {
      kind: RouteKind.SUNRISE_EXPRESS,
      displayName: "Sunrise Express",
      isPremium: true,
      description: "Premium 4:30 AM departure from Banff direct to Moraine Lake.",
    },
    update: {},
  });
  const daytime = await prisma.route.upsert({
    where: { kind: RouteKind.DAYTIME_CIRCUIT },
    create: {
      kind: RouteKind.DAYTIME_CIRCUIT,
      displayName: "Daytime Circuit",
      isPremium: false,
      description: "Repeating loop: Samson Mall → Lake Louise Lakeshore → Moraine Lake → Samson Mall.",
    },
    update: {},
  });
  const evening = await prisma.route.upsert({
    where: { kind: RouteKind.EVENING_RETURN },
    create: {
      kind: RouteKind.EVENING_RETURN,
      displayName: "Evening Return",
      isPremium: false,
      description: "6:00 PM service from Lake Louise Lakeshore back to Banff.",
    },
    update: {},
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

  console.log("Seed complete: stops, routes, schedule templates, vehicles.");
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
