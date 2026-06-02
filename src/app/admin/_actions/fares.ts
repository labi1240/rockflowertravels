'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminIdentity } from '@/lib/admin-auth';

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateFareSurfaces(id: string) {
  revalidatePath('/admin/fares');
  revalidatePath(`/admin/fares/${id}`);
  revalidatePath('/'); // home shows prices
  revalidatePath('/admin');
}

function parsePositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

/** Update base fare + toll (CAD cents). */
export async function updateFarePricing(input: {
  id: string;
  priceCents: number;
  tollCents: number;
}): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };

  const priceCents = parsePositiveInt(input.priceCents);
  const tollCents = parsePositiveInt(input.tollCents);
  if (priceCents === null || priceCents === 0) return { ok: false, error: 'Price must be a positive amount.' };
  if (tollCents === null) return { ok: false, error: 'Toll must be zero or a positive amount.' };

  const existing = await prisma.fare.findUnique({ where: { id: input.id }, select: { salePriceCents: true } });
  if (!existing) return { ok: false, error: 'Fare not found.' };
  if (existing.salePriceCents !== null && existing.salePriceCents >= priceCents) {
    return { ok: false, error: 'New base price is at or below the active sale price. Clear the sale first.' };
  }

  await prisma.fare.update({ where: { id: input.id }, data: { priceCents, tollCents } });
  revalidateFareSurfaces(input.id);
  return { ok: true };
}

/** Set or clear a temporary sale. Pass `sale: null` to clear it. */
export async function setFareSale(input: {
  id: string;
  sale: { salePriceCents: number; saleStartsAt: string | null; saleEndsAt: string | null } | null;
}): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };

  if (input.sale === null) {
    await prisma.fare.update({
      where: { id: input.id },
      data: { salePriceCents: null, saleStartsAt: null, saleEndsAt: null },
    });
    revalidateFareSurfaces(input.id);
    return { ok: true };
  }

  const fare = await prisma.fare.findUnique({ where: { id: input.id }, select: { priceCents: true } });
  if (!fare) return { ok: false, error: 'Fare not found.' };

  const salePriceCents = parsePositiveInt(input.sale.salePriceCents);
  if (salePriceCents === null || salePriceCents === 0) return { ok: false, error: 'Sale price must be a positive amount.' };
  if (salePriceCents >= fare.priceCents) {
    return { ok: false, error: 'Sale price must be below the base price.' };
  }

  const startsAt = input.sale.saleStartsAt ? new Date(input.sale.saleStartsAt) : null;
  const endsAt = input.sale.saleEndsAt ? new Date(input.sale.saleEndsAt) : null;
  if (startsAt && Number.isNaN(startsAt.getTime())) return { ok: false, error: 'Invalid sale start date.' };
  if (endsAt && Number.isNaN(endsAt.getTime())) return { ok: false, error: 'Invalid sale end date.' };
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { ok: false, error: 'Sale end must be after sale start.' };
  }

  await prisma.fare.update({
    where: { id: input.id },
    data: { salePriceCents, saleStartsAt: startsAt, saleEndsAt: endsAt },
  });
  revalidateFareSurfaces(input.id);
  return { ok: true };
}

/** Show or hide a fare from selectors + checkout. */
export async function setFareActive(input: { id: string; active: boolean }): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };
  await prisma.fare.update({ where: { id: input.id }, data: { active: input.active } });
  revalidateFareSurfaces(input.id);
  return { ok: true };
}
