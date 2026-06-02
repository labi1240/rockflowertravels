import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

/**
 * Per-departure seat inventory (Phase 4).
 *
 * A "departure" is keyed by (routeSlug, serviceDate, departureTime) — exactly what a
 * Booking records and what a rider picks. `seatsBooked` includes pending holds.
 *
 * Oversell safety relies on a single atomic, conditional SQL UPDATE
 * (`... WHERE seatsBooked + n <= seatsTotal`): concurrent requests can't both pass the
 * guard because Postgres serializes the row update. Rows are auto-provisioned at the
 * default capacity on first reservation so admins needn't pre-create every departure.
 */

export const DEFAULT_DEPARTURE_SEATS = 25;

export interface DepartureKey {
  routeSlug: string;
  serviceDateISO: string; // "YYYY-MM-DD"
  departureTime: string; // "7:00 AM"
}

type Db = Prisma.TransactionClient | typeof prisma;

const toUTCDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

/**
 * Atomically reserve `seats` on a departure. Returns true if reserved, false if the
 * departure can't fit them (sold out). Auto-creates the inventory row at default
 * capacity if it doesn't exist. Run inside the booking transaction so a later failure
 * rolls the reservation back.
 */
export async function reserveDepartureSeats(
  db: Db,
  key: DepartureKey,
  seats: number,
): Promise<boolean> {
  await db.departureInventory.upsert({
    where: {
      routeSlug_serviceDate_departureTime: {
        routeSlug: key.routeSlug,
        serviceDate: toUTCDate(key.serviceDateISO),
        departureTime: key.departureTime,
      },
    },
    create: {
      routeSlug: key.routeSlug,
      serviceDate: toUTCDate(key.serviceDateISO),
      departureTime: key.departureTime,
      seatsTotal: DEFAULT_DEPARTURE_SEATS,
      seatsBooked: 0,
    },
    update: {},
  });

  const affected = await db.$executeRaw`
    UPDATE "DepartureInventory"
    SET "seatsBooked" = "seatsBooked" + ${seats}, "updatedAt" = now()
    WHERE "routeSlug" = ${key.routeSlug}
      AND "serviceDate" = ${key.serviceDateISO}::date
      AND "departureTime" = ${key.departureTime}
      AND "seatsBooked" + ${seats} <= "seatsTotal"`;

  return affected === 1;
}

/** Release `seats` back to a departure (floor at 0). Safe to call within or outside a txn. */
export async function releaseDepartureSeats(db: Db, key: DepartureKey, seats: number): Promise<void> {
  await db.$executeRaw`
    UPDATE "DepartureInventory"
    SET "seatsBooked" = GREATEST(0, "seatsBooked" - ${seats}), "updatedAt" = now()
    WHERE "routeSlug" = ${key.routeSlug}
      AND "serviceDate" = ${key.serviceDateISO}::date
      AND "departureTime" = ${key.departureTime}`;
}

/**
 * Expire PENDING_PAYMENT holds whose hold window has passed and release their seats.
 * Each booking is transitioned with a conditional update so a seat is released at most
 * once even under concurrent sweeps. Optionally scope to a single departure (cheap path
 * called at checkout) — omit `scope` for a global sweep (cron).
 */
export async function releaseExpiredHolds(scope?: DepartureKey): Promise<number> {
  const expired = await prisma.booking.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      holdExpiresAt: { lt: new Date() },
      ...(scope
        ? {
            routeSlug: scope.routeSlug,
            departureTime: scope.departureTime,
            serviceDate: toUTCDate(scope.serviceDateISO),
          }
        : {}),
    },
    select: { id: true, seats: true, routeSlug: true, serviceDate: true, departureTime: true },
  });

  let released = 0;
  for (const b of expired) {
    await prisma.$transaction(async (tx) => {
      const res = await tx.booking.updateMany({
        where: { id: b.id, status: 'PENDING_PAYMENT' },
        data: { status: 'EXPIRED' },
      });
      if (res.count === 1 && b.routeSlug && b.departureTime && b.serviceDate) {
        await releaseDepartureSeats(
          tx,
          {
            routeSlug: b.routeSlug,
            serviceDateISO: b.serviceDate.toISOString().slice(0, 10),
            departureTime: b.departureTime,
          },
          b.seats,
        );
        released += 1;
      }
    });
  }
  return released;
}
