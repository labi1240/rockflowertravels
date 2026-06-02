'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminIdentity } from '@/lib/admin-auth';

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Set the seat capacity for a departure (route + date + time). Creates the inventory
 * row if it doesn't exist. Capacity can't be set below seats already booked.
 */
export async function setDepartureCapacity(input: {
  routeSlug: string;
  serviceDate: string; // "YYYY-MM-DD"
  departureTime: string;
  seatsTotal: number;
}): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };

  const routeSlug = input.routeSlug?.trim();
  const departureTime = input.departureTime?.trim();
  const seatsTotal = Number(input.seatsTotal);

  if (!routeSlug) return { ok: false, error: 'Route is required.' };
  if (!departureTime) return { ok: false, error: 'Departure time is required.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.serviceDate)) return { ok: false, error: 'Invalid date.' };
  if (!Number.isInteger(seatsTotal) || seatsTotal < 0 || seatsTotal > 200) {
    return { ok: false, error: 'Capacity must be between 0 and 200.' };
  }

  const serviceDate = new Date(`${input.serviceDate}T00:00:00Z`);
  const key = { routeSlug_serviceDate_departureTime: { routeSlug, serviceDate, departureTime } };

  // Provision the row if it doesn't exist yet (no-op when it already does).
  await prisma.departureInventory.createMany({
    data: [{ routeSlug, serviceDate, departureTime, seatsTotal, seatsBooked: 0 }],
    skipDuplicates: true,
  });

  // Atomic guard: only apply the new capacity while it still covers already-booked seats.
  // A single conditional UPDATE avoids the read-then-write TOCTOU race with concurrent
  // bookings that could otherwise increment seatsBooked above the new seatsTotal.
  const updated = await prisma.departureInventory.updateMany({
    where: { routeSlug, serviceDate, departureTime, seatsBooked: { lte: seatsTotal } },
    data: { seatsTotal },
  });
  if (updated.count === 0) {
    const current = await prisma.departureInventory.findUnique({ where: key, select: { seatsBooked: true } });
    return { ok: false, error: `${current?.seatsBooked ?? 0} seats already booked — capacity can't be lower.` };
  }

  revalidatePath('/admin/capacity');
  revalidatePath('/admin');
  return { ok: true };
}
