import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AddStopForm from './AddStopForm';
import RouteBuilder from './RouteBuilder';

export const dynamic = 'force-dynamic';

export default async function NewRoutePage() {
  const stops = await prisma.stop.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, code: true, name: true },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/routes"
        className="inline-flex items-center gap-2 text-sm text-mist-500 transition-colors hover:text-mist-900"
      >
        ← All routes
      </Link>

      <header>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">New route</h2>
        <p className="mt-1 text-sm text-mist-500">
          Define the route, its timetable legs, and at least one bookable fare.
        </p>
      </header>

      <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-evergreen-700">
          Stops <span className="text-mist-400">({stops.length})</span>
        </h3>
        <p className="mb-4 text-sm text-mist-500">
          Legs connect stops. Add any missing stops here first, then build the route below.
        </p>
        <AddStopForm />
      </section>

      <RouteBuilder stops={stops} />
    </div>
  );
}
