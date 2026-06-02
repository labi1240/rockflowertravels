import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { prisma } from '@/lib/prisma';
import { syncCurrentUser } from '@/lib/user-sync';
import { RouteKind, BookingStatus } from '@/generated/prisma/enums';

export const dynamic = 'force-dynamic';

const ROUTE_DISPLAY: Record<RouteKind, { name: string; tone: string }> = {
  SUNRISE_EXPRESS: { name: 'Sunrise Express', tone: 'bg-sunrise-100 text-sunrise-700 ring-sunrise-500/30' },
  DAYTIME_CIRCUIT: { name: 'Daytime Circuit',  tone: 'bg-evergreen-100 text-evergreen-800 ring-evergreen-500/20' },
  EVENING_RETURN:  { name: 'Evening Return',   tone: 'bg-mist-100 text-mist-700 ring-mist-200' },
};

const STATUS_DISPLAY: Record<BookingStatus, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: 'Pending payment', tone: 'bg-amber-100 text-amber-800 ring-amber-500/30' },
  CONFIRMED:       { label: 'Confirmed',       tone: 'bg-emerald-100 text-emerald-800 ring-emerald-500/30' },
  CANCELLED:       { label: 'Cancelled',       tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  REFUNDED:        { label: 'Refunded',        tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  EXPIRED:         { label: 'Expired',         tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Edmonton',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatCAD(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

interface BookingRow {
  reference: string;
  status: BookingStatus;
  routeKind: RouteKind | null;
  routeName: string | null;
  serviceDate: Date | null;
  departureTime: string | null;
  totalCents: number;
  currency: string;
  createdAt: Date;
}

export default async function MyTripsPage() {
  const user = await syncCurrentUser();
  if (!user) notFound();

  const bookings: BookingRow[] = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: [{ serviceDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      reference: true,
      status: true,
      routeKind: true,
      routeName: true,
      serviceDate: true,
      departureTime: true,
      totalCents: true,
      currency: true,
      createdAt: true,
    },
  });

  // Edmonton "today" cutoff for upcoming/past split.
  const todayEdmonton = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' }),
  );
  todayEdmonton.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter(
    (b) =>
      b.serviceDate &&
      b.serviceDate >= todayEdmonton &&
      (b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT'),
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <>
      <Navbar />

      <main className="main-content min-h-screen bg-mist-50">
        <section className="mx-auto max-w-5xl px-6 pt-32 pb-24">
          <header className="mb-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sunrise-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sunrise-700">
              <span className="size-1.5 rounded-full bg-sunrise-500" /> My trips
            </p>
            <h1 className="font-display text-4xl font-bold text-evergreen-800 sm:text-5xl">
              Welcome back{user.firstName ? `, ${user.firstName}` : ''}
            </h1>
            <p className="mt-3 text-mist-700">
              All your RockFlower shuttle bookings in one place.
            </p>
          </header>

          {bookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-12">
              <BookingList
                title="Upcoming"
                emptyHint="No upcoming rides booked."
                bookings={upcoming}
              />
              <BookingList
                title="Past & cancelled"
                emptyHint="Nothing in your history yet."
                bookings={past}
                muted
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BookingModal />
    </>
  );
}

function BookingList({
  title,
  emptyHint,
  bookings,
  muted = false,
}: {
  title: string;
  emptyHint: string;
  bookings: BookingRow[];
  muted?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-evergreen-700">
        {title} <span className="ml-1 text-mist-500">({bookings.length})</span>
      </h2>

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist-200 bg-mist-100 p-6 text-sm text-mist-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.reference}>
              <Link
                href={`/my-trips/${b.reference}`}
                className={`group flex flex-col gap-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:border-sunrise-500/40 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:items-center sm:justify-between ${
                  muted ? 'opacity-80' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {b.routeKind ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          ROUTE_DISPLAY[b.routeKind].tone
                        }`}
                      >
                        {ROUTE_DISPLAY[b.routeKind].name}
                      </span>
                    ) : b.routeName ? (
                      <span className="inline-flex items-center rounded-full bg-evergreen-100 px-2.5 py-1 text-xs font-semibold text-evergreen-800 ring-1 ring-evergreen-500/20">
                        {b.routeName}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        STATUS_DISPLAY[b.status].tone
                      }`}
                    >
                      {STATUS_DISPLAY[b.status].label}
                    </span>
                  </div>
                  <p className="font-display text-lg font-semibold text-mist-900">
                    {b.serviceDate
                      ? DATE_FORMATTER.format(b.serviceDate)
                      : 'Date unavailable'}
                    {b.departureTime && (
                      <span className="ml-2 text-mist-500 font-normal">
                        · {b.departureTime}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-mist-500 font-mono">
                    {b.reference}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-display text-xl font-bold text-mist-900 tabular-nums">
                    {formatCAD(b.totalCents)}
                  </p>
                  <span className="text-xs text-mist-500 group-hover:text-sunrise-700 transition-colors">
                    View details →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-mist-200 bg-white p-12 text-center shadow-[var(--shadow-card)]">
      <p className="font-display text-2xl font-semibold text-mist-900">
        No bookings yet
      </p>
      <p className="mt-2 text-mist-700">
        Once you book a shuttle, it&apos;ll show up here.
      </p>
      <Link
        href="/#schedule"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sunrise-400 to-sunrise-500 px-6 py-2.5 text-sm font-bold text-evergreen-950 shadow-[0_0_15px_hsla(41,80%,58%,0.3)] transition-all hover:scale-105"
      >
        Browse schedules
      </Link>
    </div>
  );
}
