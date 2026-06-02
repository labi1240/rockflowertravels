import { prisma } from '@/lib/prisma';
import { edmontonTodayUTC, edmontonTodayISO } from '@/lib/edmonton';
import CapacityManager, { type CapacityRow } from './CapacityManager';

export const dynamic = 'force-dynamic';

export default async function AdminCapacityPage() {
  const today = edmontonTodayUTC();

  const [rows, routes] = await Promise.all([
    prisma.departureInventory.findMany({
      where: { serviceDate: { gte: today } },
      orderBy: [{ serviceDate: 'asc' }, { routeSlug: 'asc' }, { departureTime: 'asc' }],
    }),
    prisma.route.findMany({
      where: { slug: { not: null } },
      orderBy: { displayName: 'asc' },
      select: { slug: true, displayName: true },
    }),
  ]);

  const routeName = new Map(routes.map((r) => [r.slug, r.displayName]));
  const routeOptions = routes.map((r) => ({ slug: r.slug as string, displayName: r.displayName }));

  const data: CapacityRow[] = rows.map((r) => ({
    id: r.id,
    routeSlug: r.routeSlug,
    routeName: routeName.get(r.routeSlug) ?? r.routeSlug,
    serviceDateISO: r.serviceDate.toISOString().slice(0, 10),
    departureTime: r.departureTime,
    seatsBooked: r.seatsBooked,
    seatsTotal: r.seatsTotal,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">Capacity</h2>
        <p className="mt-1 text-sm text-mist-500">
          Seat capacity per departure (today onward). Checkout blocks overselling against these
          numbers; expired holds release automatically.
        </p>
      </div>

      <CapacityManager routes={routeOptions} rows={data} todayISO={edmontonTodayISO()} />
    </div>
  );
}
