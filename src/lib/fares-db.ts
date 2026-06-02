import 'server-only';

import { prisma } from '@/lib/prisma';
import type { FareDTO, FareTier } from '@/lib/fares';

// Prisma Fare row shape we read (kept loose to avoid importing generated types here).
interface FareRow {
  id: string;
  tier: string;
  routeKind: string;
  routeSlug: string | null;
  label: string;
  short: string;
  origin: string;
  destination: string;
  priceCents: number;
  tollCents: number;
  roundTrip: boolean;
  premium: boolean;
  defaultTime: string;
  note: string | null;
  active: boolean;
  salePriceCents: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
  sortOrder: number;
}

/** Maps a Prisma Fare row to the serializable FareDTO (dates → epoch ms). */
export function toFareDTO(row: FareRow): FareDTO {
  return {
    id: row.id,
    tier: row.tier as FareTier,
    routeKind: row.routeKind,
    routeSlug: row.routeSlug,
    label: row.label,
    short: row.short,
    origin: row.origin,
    destination: row.destination,
    priceCents: row.priceCents,
    tollCents: row.tollCents,
    roundTrip: row.roundTrip,
    premium: row.premium,
    defaultTime: row.defaultTime,
    note: row.note,
    active: row.active,
    salePriceCents: row.salePriceCents,
    saleStartsMs: row.saleStartsAt ? row.saleStartsAt.getTime() : null,
    saleEndsMs: row.saleEndsAt ? row.saleEndsAt.getTime() : null,
    sortOrder: row.sortOrder,
  };
}

/** All active fares, tier/sortOrder ordered — for selectors and marketing surfaces. */
export async function getActiveFares(): Promise<FareDTO[]> {
  const rows = await prisma.fare.findMany({
    where: { active: true },
    orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
  });
  return rows.map(toFareDTO);
}

/** A single fare by id (active or not) — checkout decides whether inactive is sellable. */
export async function getFareById(id: string): Promise<FareDTO | null> {
  const row = await prisma.fare.findUnique({ where: { id } });
  return row ? toFareDTO(row) : null;
}
