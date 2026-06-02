'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminIdentity } from '@/lib/admin-auth';

export type ActionResult = { ok: true; slug?: string } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STOP_CODE_RE = /^[A-Z0-9_]+$/;

interface NewLeg {
  fromStopId: string;
  toStopId: string;
  departMin: number;
  arriveMin: number;
  bookable: boolean;
  priceCents: number;
}

interface NewFare {
  id: string;
  label: string;
  short: string;
  origin: string;
  destination: string;
  priceCents: number;
  tollCents: number;
  roundTrip: boolean;
  premium: boolean;
  defaultTime: string;
  note?: string;
}

export interface CreateRouteInput {
  slug: string;
  displayName: string;
  tier: string;
  isPremium: boolean;
  description?: string;
  templateLabel: string;
  legs: NewLeg[];
  fares: NewFare[];
}

/** Create a stop admins can use as a leg endpoint. */
export async function createStop(input: {
  code: string;
  name: string;
  lat?: number | null;
  lng?: number | null;
}): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };

  const code = input.code?.trim().toUpperCase();
  const name = input.name?.trim();
  if (!code || !STOP_CODE_RE.test(code)) {
    return { ok: false, error: 'Stop code must be uppercase letters, numbers, or underscores.' };
  }
  if (!name) return { ok: false, error: 'Stop name is required.' };

  const existing = await prisma.stop.findUnique({ where: { code }, select: { id: true } });
  if (existing) return { ok: false, error: `Stop code "${code}" already exists.` };

  await prisma.stop.create({
    data: { code, name, lat: input.lat ?? null, lng: input.lng ?? null },
  });
  revalidatePath('/admin/routes/new');
  return { ok: true };
}

/**
 * Create a full route in one transaction: Route + one ScheduleTemplate + its legs +
 * one or more sellable Fares. New routes have no RouteKind enum value — they are
 * identified by `slug` and sold through the fare-catalog checkout path. Live seat
 * inventory (Trip/TripLeg) is NOT materialized here (deferred to a future phase).
 */
export async function createRouteWithSchedule(input: CreateRouteInput): Promise<ActionResult> {
  if (!(await getAdminIdentity())) return { ok: false, error: 'Not authorized.' };

  const slug = input.slug?.trim().toLowerCase();
  const displayName = input.displayName?.trim();
  const tier = input.tier?.trim().toLowerCase();
  const templateLabel = input.templateLabel?.trim();

  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: 'Slug must be kebab-case (e.g. "canmore-express").' };
  if (!displayName) return { ok: false, error: 'Display name is required.' };
  if (!tier) return { ok: false, error: 'Tier is required.' };
  if (!templateLabel) return { ok: false, error: 'Schedule label is required.' };
  if (!input.legs?.length) return { ok: false, error: 'Add at least one leg.' };
  if (!input.fares?.length) return { ok: false, error: 'Add at least one fare so the route is bookable.' };

  // Legs
  for (const [i, leg] of input.legs.entries()) {
    if (!leg.fromStopId || !leg.toStopId) return { ok: false, error: `Leg ${i + 1}: pick both stops.` };
    if (leg.fromStopId === leg.toStopId) return { ok: false, error: `Leg ${i + 1}: from and to must differ.` };
    if (!Number.isInteger(leg.departMin) || !Number.isInteger(leg.arriveMin) || leg.arriveMin <= leg.departMin) {
      return { ok: false, error: `Leg ${i + 1}: arrival must be after departure.` };
    }
    if (!Number.isInteger(leg.priceCents) || leg.priceCents < 0) {
      return { ok: false, error: `Leg ${i + 1}: price must be zero or positive.` };
    }
  }

  // Fares
  for (const [i, f] of input.fares.entries()) {
    const fid = f.id?.trim().toLowerCase();
    if (!fid || !SLUG_RE.test(fid)) return { ok: false, error: `Fare ${i + 1}: id must be kebab-case.` };
    if (!f.label?.trim() || !f.short?.trim()) return { ok: false, error: `Fare ${i + 1}: label and short label are required.` };
    if (!f.defaultTime?.trim()) return { ok: false, error: `Fare ${i + 1}: default departure time is required.` };
    if (!Number.isInteger(f.priceCents) || f.priceCents <= 0) return { ok: false, error: `Fare ${i + 1}: price must be positive.` };
    if (!Number.isInteger(f.tollCents) || f.tollCents < 0) return { ok: false, error: `Fare ${i + 1}: toll must be zero or positive.` };
  }

  // Uniqueness pre-checks (outside txn for friendlier errors).
  if (await prisma.route.findUnique({ where: { slug }, select: { id: true } })) {
    return { ok: false, error: `A route with slug "${slug}" already exists.` };
  }
  const fareIds = input.fares.map((f) => f.id.trim().toLowerCase());
  if (new Set(fareIds).size !== fareIds.length) return { ok: false, error: 'Duplicate fare ids in the form.' };
  const clashing = await prisma.fare.findMany({ where: { id: { in: fareIds } }, select: { id: true } });
  if (clashing.length) return { ok: false, error: `Fare id already exists: ${clashing.map((c) => c.id).join(', ')}.` };

  // Validate stop ids exist.
  const stopIds = [...new Set(input.legs.flatMap((l) => [l.fromStopId, l.toStopId]))];
  const stops = await prisma.stop.findMany({ where: { id: { in: stopIds } }, select: { id: true } });
  if (stops.length !== stopIds.length) return { ok: false, error: 'One or more legs reference an unknown stop.' };

  try {
    await prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          slug,
          tier,
          displayName,
          isPremium: input.isPremium,
          description: input.description?.trim() || null,
          kind: null,
        },
      });

      const template = await tx.scheduleTemplate.create({
        data: { routeId: route.id, label: templateLabel, sortOrder: 1 },
      });

      await tx.legTemplate.createMany({
        data: input.legs.map((leg, idx) => ({
          templateId: template.id,
          sequence: idx + 1,
          fromStopId: leg.fromStopId,
          toStopId: leg.toStopId,
          departMin: leg.departMin,
          arriveMin: leg.arriveMin,
          bookable: leg.bookable,
          priceCents: leg.priceCents,
        })),
      });

      await tx.fare.createMany({
        data: input.fares.map((f, idx) => ({
          id: f.id.trim().toLowerCase(),
          tier,
          routeKind: slug, // legacy column; new routes tag it with the slug (not an enum value)
          routeSlug: slug,
          label: f.label.trim(),
          short: f.short.trim(),
          origin: f.origin.trim(),
          destination: f.destination.trim(),
          priceCents: f.priceCents,
          tollCents: f.tollCents,
          roundTrip: f.roundTrip,
          premium: f.premium,
          defaultTime: f.defaultTime.trim(),
          note: f.note?.trim() || null,
          active: true,
          sortOrder: 100 + idx, // after the seeded fares
        })),
      });
    });
  } catch (err) {
    console.error('[createRouteWithSchedule] failed', err);
    return { ok: false, error: 'Could not create the route. Please try again.' };
  }

  revalidatePath('/admin/routes');
  revalidatePath('/admin/fares');
  revalidatePath('/');
  return { ok: true, slug };
}
