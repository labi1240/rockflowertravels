import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { edmontonTodayUTC, edmontonTodayISO } from '@/lib/edmonton';

export const dynamic = 'force-dynamic';

// `today` is a UTC-midnight Date standing for the Edmonton calendar day, so format it in
// UTC — formatting in EDMONTON_TZ would render UTC-midnight as the *previous* day.
const TODAY_LABEL = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function formatCAD(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

export default async function OperationsCenterPage() {
  const today = edmontonTodayUTC();
  // Bookings that count as live demand for the day.
  const liveStatuses = ['CONFIRMED', 'PENDING_PAYMENT'] as const;

  const [bookingsToday, revenueAgg, seatsAgg, routeGroups, runs, routeRows] = await Promise.all([
    prisma.booking.count({
      where: { serviceDate: today, status: { in: [...liveStatuses] } },
    }),
    prisma.booking.aggregate({
      _sum: { totalCents: true },
      where: { serviceDate: today, status: 'CONFIRMED' },
    }),
    prisma.departureInventory.aggregate({
      _sum: { seatsBooked: true, seatsTotal: true },
      where: { serviceDate: today },
    }),
    prisma.booking.groupBy({
      by: ['routeName'],
      where: { serviceDate: today, status: { in: [...liveStatuses] } },
      _count: { _all: true },
    }),
    prisma.departureInventory.findMany({
      where: { serviceDate: today },
      orderBy: [{ routeSlug: 'asc' }, { departureTime: 'asc' }],
      select: { id: true, routeSlug: true, departureTime: true, seatsBooked: true, seatsTotal: true },
    }),
    prisma.route.findMany({ select: { slug: true, displayName: true } }),
  ]);

  const routeName = new Map(routeRows.map((r) => [r.slug, r.displayName]));
  const revenueToday = revenueAgg._sum.totalCents ?? 0;
  const seatsBooked = seatsAgg._sum.seatsBooked ?? 0;
  const seatsTotal = seatsAgg._sum.seatsTotal ?? 0;
  const occupancyPct = seatsTotal > 0 ? Math.round((seatsBooked / seatsTotal) * 100) : 0;

  const topRoute = routeGroups
    .filter((g) => g.routeName !== null)
    .sort((a, b) => b._count._all - a._count._all)[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-evergreen-800">Today at a glance</h2>
          <p className="mt-1 text-sm text-mist-500">{TODAY_LABEL.format(today)} · Mountain Time</p>
        </div>
        <Link
          href={`/admin/bookings?date=${edmontonTodayISO()}`}
          className="text-sm font-semibold text-sunrise-700 hover:text-sunrise-800"
        >
          View today&apos;s bookings →
        </Link>
      </div>

      {/* KPI cards — the most operationally critical numbers, emphasized. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Bookings today" value={String(bookingsToday)} hint="Confirmed + pending" />
        <KpiCard label="Revenue today" value={formatCAD(revenueToday)} hint="Confirmed bookings" accent />
        <KpiCard
          label="Seats sold"
          value={`${seatsBooked} / ${seatsTotal}`}
          hint={`${occupancyPct}% of capacity`}
        />
        <KpiCard
          label="Top route"
          value={topRoute ? (topRoute.routeName ?? '—') : '—'}
          hint={topRoute ? `${topRoute._count._all} booking(s)` : 'No demand yet'}
        />
      </div>

      {/* Capacity management — per-departure occupancy for the day. */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-evergreen-700">
            Capacity by departure
          </h3>
          <Link href="/admin/capacity" className="text-sm font-semibold text-sunrise-700 hover:text-sunrise-800">
            Manage capacity →
          </Link>
        </div>
        {runs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-mist-200 bg-mist-100 p-6 text-sm text-mist-500">
            No departures scheduled today.
          </p>
        ) : (
          <ul className="space-y-3">
            {runs.map((run) => {
              const pct =
                run.seatsTotal > 0 ? Math.round((run.seatsBooked / run.seatsTotal) * 100) : 0;
              const full = pct >= 100;
              const high = pct >= 80;
              return (
                <li
                  key={run.id}
                  className="rounded-2xl border border-mist-200 bg-white p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-mist-900">
                        {routeName.get(run.routeSlug) ?? run.routeSlug}
                        <span className="ml-2 font-normal text-mist-500">{run.departureTime}</span>
                      </p>
                    </div>
                    <p className="tabular-nums text-sm font-semibold text-mist-700">
                      {run.seatsBooked} / {run.seatsTotal}{' '}
                      <span className={full ? 'text-rose-600' : high ? 'text-amber-600' : 'text-mist-500'}>
                        ({pct}%)
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className={`h-full rounded-full ${
                        full ? 'bg-rose-500' : high ? 'bg-amber-500' : 'bg-evergreen-700'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${
        accent ? 'border-sunrise-500/30 bg-sunrise-50' : 'border-mist-200 bg-white'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-mist-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-evergreen-800 tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-mist-500">{hint}</p>
    </div>
  );
}
