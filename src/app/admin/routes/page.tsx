import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminRoutesPage() {
  const routes = await prisma.route.findMany({
    orderBy: [{ tier: 'asc' }, { displayName: 'asc' }],
    select: {
      id: true,
      slug: true,
      displayName: true,
      tier: true,
      isPremium: true,
      kind: true,
      _count: { select: { templates: true } },
    },
  });

  // Fare counts per routeSlug (sellability indicator).
  const fares = await prisma.fare.groupBy({ by: ['routeSlug'], _count: { _all: true } });
  const fareCountBySlug = new Map(fares.map((f) => [f.routeSlug, f._count._all]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-evergreen-800">Routes &amp; schedules</h2>
          <p className="mt-1 text-sm text-mist-500">
            Author a new route, timetable, and its fares. New routes sell through the standard
            checkout immediately.
          </p>
        </div>
        <Link
          href="/admin/routes/new"
          className="rounded-full bg-evergreen-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-evergreen-900"
        >
          + New route
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-mist-200 bg-white shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-mist-200 text-left text-xs font-semibold uppercase tracking-wider text-mist-500">
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Schedules</th>
              <th className="px-4 py-3 text-right">Fares</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-b border-mist-100 last:border-0 hover:bg-mist-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-mist-900">{r.displayName}</span>
                  {r.isPremium && (
                    <span className="ml-2 rounded-full bg-sunrise-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sunrise-700 ring-1 ring-sunrise-500/30">
                      Premium
                    </span>
                  )}
                  <span className="block font-mono text-xs text-mist-400">{r.slug ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-mist-700">{r.tier ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-700">{r._count.templates}</td>
                <td className="px-4 py-3 text-right tabular-nums text-mist-700">
                  {fareCountBySlug.get(r.slug) ?? 0}
                </td>
                <td className="px-4 py-3">
                  {r.kind ? (
                    <span className="text-xs text-mist-500">seeded</span>
                  ) : (
                    <span className="rounded-full bg-evergreen-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-evergreen-800">
                      admin
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
