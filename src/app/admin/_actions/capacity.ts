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

  const existing = await prisma.departureInventory.findUnique({
    where: key,
    select: { seatsBooked: true },
  });
  if (existing && seatsTotal < existing.seatsBooked) {
    return { ok: false, error: `${existing.seatsBooked} seats already booked — capacity can't be lower.` };
  }

  await prisma.departureInventory.upsert({
    where: key,
    create: { routeSlug, serviceDate, departureTime, seatsTotal, seatsBooked: 0 },
    update: { seatsTotal },
  });

  revalidatePath('/admin/capacity');
  revalidatePath('/admin');
  return { ok: true };
}
