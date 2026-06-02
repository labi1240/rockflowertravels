// Demo data for exploring the Admin Operations Center.
//   Seed:   bun prisma/demo-seed.ts
//   Remove: bun prisma/demo-seed.ts clear
//
// Everything created here is tagged so it can be fully removed:
//   • bookings with reference starting "RF-DEMO-"
//   • fares with id starting "demo-"
//   • route slug "demo-canmore-express" (+ its templates/legs) and stop code "CANMORE"
//   • DepartureInventory rows on the demo dates/routes below
//   • a temporary sale on fare "banff-ll" and a hidden flag on "sunrise-banff-ll" (reverted on clear)
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CLEAR = process.argv.includes("clear");

// ── Date helpers (Edmonton calendar) ───────────────────────────────────────────
function edmontonISO(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}
const TODAY = edmontonISO(0);
const YEST = edmontonISO(-1);
const FUT = edmontonISO(3);
const dt = (iso: string) => new Date(`${iso}T00:00:00Z`);
const price = (fareCents: number, tollCents: number, seats: number) => {
  const subtotalCents = (fareCents + tollCents) * seats;
  const gstCents = Math.round(subtotalCents * 0.05);
  return { subtotalCents, gstCents, totalCents: subtotalCents + gstCents };
};

const DEMO_ROUTE_SLUG = "demo-canmore-express";
const DEMO_FARE_ID = "demo-canmore-banff";

// Inventory rows we own (so clear can remove exactly these).
const INVENTORY: Array<{ routeSlug: string; iso: string; time: string; total: number; booked: number }> = [
  { routeSlug: "daytime-circuit", iso: TODAY, time: "7:00 AM", total: 25, booked: 20 }, // amber 80%
  { routeSlug: "sunrise-express", iso: TODAY, time: "4:30 AM", total: 12, booked: 12 }, // full 100%
  { routeSlug: "evening-return", iso: TODAY, time: "6:00 PM", total: 25, booked: 6 }, //  green 24%
  { routeSlug: "daytime-circuit", iso: TODAY, time: "1:30 PM", total: 25, booked: 0 }, //  empty
  { routeSlug: DEMO_ROUTE_SLUG, iso: FUT, time: "8:00 AM", total: 20, booked: 2 }, //     future demo route
];

async function clearDemo() {
  await prisma.booking.deleteMany({ where: { reference: { startsWith: "RF-DEMO-" } } }); // cascades payments
  await prisma.fare.deleteMany({ where: { id: { startsWith: "demo-" } } });

  const route = await prisma.route.findUnique({ where: { slug: DEMO_ROUTE_SLUG }, select: { id: true } });
  if (route) {
    await prisma.scheduleTemplate.deleteMany({ where: { routeId: route.id } }); // cascades legTemplates
    await prisma.route.delete({ where: { id: route.id } });
  }
  await prisma.stop.deleteMany({ where: { code: "CANMORE" } });

  for (const inv of INVENTORY) {
    await prisma.departureInventory.deleteMany({
      where: { routeSlug: inv.routeSlug, serviceDate: dt(inv.iso), departureTime: inv.time },
    });
  }

  // Revert demo fare states.
  await prisma.fare.updateMany({
    where: { id: "banff-ll" },
    data: { salePriceCents: null, saleStartsAt: null, saleEndsAt: null },
  });
  await prisma.fare.updateMany({ where: { id: "sunrise-banff-ll" }, data: { active: true } });
}

async function seedDemo() {
  // ── A demo customer (links a booking to a real account view) ──────────────────
  const user = await prisma.user.upsert({
    where: { email: "lovepreetgill1238@gmail.com" },
    create: { email: "lovepreetgill1238@gmail.com", firstName: "Lovepreet", lastName: "Gill" },
    update: {},
    select: { id: true },
  });

  // ── Admin-authored route (Route + schedule + bookable fare) ───────────────────
  const canmore = await prisma.stop.upsert({
    where: { code: "CANMORE" },
    create: { code: "CANMORE", name: "Canmore", lat: 51.0884, lng: -115.3479 },
    update: {},
  });
  const banff = await prisma.stop.findUnique({ where: { code: "BANFF" }, select: { id: true } });
  if (!banff) throw new Error('Missing BANFF stop: run the main seed (bun prisma/seed.ts) before the demo seed.');
  const route = await prisma.route.create({
    data: {
      slug: DEMO_ROUTE_SLUG,
      tier: "daytime",
      kind: null,
      displayName: "Canmore Express (DEMO)",
      isPremium: false,
      description: "Demo admin-authored route: Canmore → Banff.",
    },
  });
  const template = await prisma.scheduleTemplate.create({
    data: { routeId: route.id, label: "Daily (08:00)", sortOrder: 1 },
  });
  await prisma.legTemplate.create({
    data: {
      templateId: template.id,
      sequence: 1,
      fromStopId: canmore.id,
      toStopId: banff.id,
      departMin: 8 * 60,
      arriveMin: 8 * 60 + 50,
      bookable: true,
      priceCents: 4999,
    },
  });
  await prisma.fare.create({
    data: {
      id: DEMO_FARE_ID,
      tier: "daytime",
      routeKind: DEMO_ROUTE_SLUG,
      routeSlug: DEMO_ROUTE_SLUG,
      label: "Canmore → Banff (DEMO)",
      short: "Canmore → Banff",
      origin: "Canmore",
      destination: "Banff",
      priceCents: 4999,
      tollCents: 0,
      roundTrip: false,
      premium: false,
      defaultTime: "8:00 AM",
      note: "Demo route created from the admin Routes builder.",
      active: true,
      sortOrder: 200,
    },
  });

  // ── Fare states: one on sale, one hidden ──────────────────────────────────────
  await prisma.fare.update({
    where: { id: "banff-ll" },
    data: {
      salePriceCents: 4999, // was $65.99 → $49.99
      saleStartsAt: dt(YEST),
      saleEndsAt: new Date(Date.now() + 7 * 86_400_000),
    },
  });
  await prisma.fare.update({ where: { id: "sunrise-banff-ll" }, data: { active: false } });

  // ── Departure inventory (varied occupancy) ────────────────────────────────────
  for (const inv of INVENTORY) {
    await prisma.departureInventory.upsert({
      where: {
        routeSlug_serviceDate_departureTime: {
          routeSlug: inv.routeSlug,
          serviceDate: dt(inv.iso),
          departureTime: inv.time,
        },
      },
      create: {
        routeSlug: inv.routeSlug,
        serviceDate: dt(inv.iso),
        departureTime: inv.time,
        seatsTotal: inv.total,
        seatsBooked: inv.booked,
      },
      update: { seatsTotal: inv.total, seatsBooked: inv.booked },
    });
  }

  // ── Bookings across every status / route / date ───────────────────────────────
  type B = {
    ref: string;
    status: "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED" | "REFUNDED" | "EXPIRED";
    payStatus: "SUCCEEDED" | "PROCESSING" | "FAILED" | "REFUNDED" | "REQUIRES_PAYMENT";
    iso: string;
    routeKind: "SUNRISE_EXPRESS" | "DAYTIME_CIRCUIT" | "EVENING_RETURN" | null;
    routeName: string;
    routeSlug: string;
    time: string;
    seats: number;
    fareCents: number;
    tollCents: number;
    guest: { email: string; first: string; last: string; phone: string };
    linkUser?: boolean;
    pi?: string;
    refund?: { byEmail: string; reason: string };
    holdMinutes?: number; // for pending: minutes until hold expires
  };

  const bookings: B[] = [
    { ref: "RF-DEMO-001", status: "CONFIRMED", payStatus: "SUCCEEDED", iso: TODAY, routeKind: "DAYTIME_CIRCUIT", routeName: "Daytime Circuit", routeSlug: "daytime-circuit", time: "7:00 AM", seats: 2, fareCents: 8999, tollCents: 500, guest: { email: "lovepreetgill1238@gmail.com", first: "Lovepreet", last: "Gill", phone: "+1 403 555 0101" }, linkUser: true, pi: "pi_demo_001" },
    { ref: "RF-DEMO-002", status: "CONFIRMED", payStatus: "SUCCEEDED", iso: TODAY, routeKind: "SUNRISE_EXPRESS", routeName: "Sunrise Express", routeSlug: "sunrise-express", time: "4:30 AM", seats: 1, fareCents: 9998, tollCents: 0, guest: { email: "aria@example.com", first: "Aria", last: "Mehta", phone: "+1 403 555 0102" }, pi: "pi_demo_002" },
    { ref: "RF-DEMO-003", status: "PENDING_PAYMENT", payStatus: "PROCESSING", iso: TODAY, routeKind: "DAYTIME_CIRCUIT", routeName: "Daytime Circuit", routeSlug: "daytime-circuit", time: "7:00 AM", seats: 3, fareCents: 6599, tollCents: 0, guest: { email: "noah@example.com", first: "Noah", last: "Tremblay", phone: "+1 403 555 0103" }, pi: "pi_demo_003", holdMinutes: 8 },
    { ref: "RF-DEMO-004", status: "CONFIRMED", payStatus: "SUCCEEDED", iso: TODAY, routeKind: "EVENING_RETURN", routeName: "Evening Return", routeSlug: "evening-return", time: "6:00 PM", seats: 4, fareCents: 6599, tollCents: 0, guest: { email: "sofia@example.com", first: "Sofia", last: "Rossi", phone: "+1 403 555 0104" }, pi: "pi_demo_004" },
    { ref: "RF-DEMO-005", status: "REFUNDED", payStatus: "REFUNDED", iso: YEST, routeKind: "DAYTIME_CIRCUIT", routeName: "Daytime Circuit", routeSlug: "daytime-circuit", time: "7:00 AM", seats: 2, fareCents: 8999, tollCents: 500, guest: { email: "liam@example.com", first: "Liam", last: "Chen", phone: "+1 403 555 0105" }, pi: "pi_demo_005", refund: { byEmail: "lovepreetgill1238@gmail.com", reason: "Customer cancellation — weather" } },
    { ref: "RF-DEMO-006", status: "CANCELLED", payStatus: "FAILED", iso: YEST, routeKind: "DAYTIME_CIRCUIT", routeName: "Daytime Circuit", routeSlug: "daytime-circuit", time: "9:00 AM", seats: 1, fareCents: 6599, tollCents: 0, guest: { email: "mia@example.com", first: "Mia", last: "Khan", phone: "+1 403 555 0106" } },
    { ref: "RF-DEMO-007", status: "EXPIRED", payStatus: "REQUIRES_PAYMENT", iso: YEST, routeKind: "EVENING_RETURN", routeName: "Evening Return", routeSlug: "evening-return", time: "6:00 PM", seats: 2, fareCents: 6599, tollCents: 0, guest: { email: "evan@example.com", first: "Evan", last: "Park", phone: "+1 403 555 0107" } },
    { ref: "RF-DEMO-008", status: "CONFIRMED", payStatus: "SUCCEEDED", iso: FUT, routeKind: null, routeName: "Canmore Express (DEMO)", routeSlug: DEMO_ROUTE_SLUG, time: "8:00 AM", seats: 2, fareCents: 4999, tollCents: 0, guest: { email: "demo.rider@example.com", first: "Demo", last: "Rider", phone: "+1 403 555 0108" }, pi: "pi_demo_008" },
  ];

  for (const b of bookings) {
    const { subtotalCents, gstCents, totalCents } = price(b.fareCents, b.tollCents, b.seats);
    await prisma.booking.create({
      data: {
        reference: b.ref,
        ...(b.linkUser ? { user: { connect: { id: user.id } } } : {}),
        status: b.status,
        holdExpiresAt: b.status === "PENDING_PAYMENT" ? new Date(Date.now() + (b.holdMinutes ?? 8) * 60_000) : null,
        seats: b.seats,
        routeKind: b.routeKind,
        routeName: b.routeName,
        routeSlug: b.routeSlug,
        serviceDate: dt(b.iso),
        departureTime: b.time,
        guestEmail: b.guest.email,
        guestFirstName: b.guest.first,
        guestLastName: b.guest.last,
        guestPhone: b.guest.phone,
        subtotalCents,
        gstCents,
        totalCents,
        currency: "CAD",
        ...(b.refund ? { refundedAt: new Date(), refundedBy: b.refund.byEmail, refundReason: b.refund.reason } : {}),
        payment: {
          create: {
            amountSubtotalCents: subtotalCents,
            gstCents,
            amountTotalCents: totalCents,
            currency: "CAD",
            status: b.payStatus,
            ...(b.pi ? { stripePaymentIntentId: b.pi } : {}),
          },
        },
      },
    });
  }

  console.log(`Demo seeded for ${TODAY}: ${bookings.length} bookings, ${INVENTORY.length} departures, 1 admin route, 1 sale, 1 hidden fare.`);
}

async function main() {
  await clearDemo();
  if (CLEAR) {
    console.log("Demo data cleared.");
    return;
  }
  await seedDemo();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
