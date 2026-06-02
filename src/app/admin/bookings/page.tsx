import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { edmontonDateToUTC, edmontonTodayISO, EDMONTON_TZ } from '@/lib/edmonton';
import { RouteKind, BookingStatus } from '@/generated/prisma/enums';

export const dynamic = 'force-dynamic';

const ROUTE_NAME: Record<RouteKind, string> = {
  SUNRISE_EXPRESS: 'Sunrise Express',
  DAYTIME_CIRCUIT: 'Daytime Circuit',
  EVENING_RETURN: 'Evening Return',
};

const STATUS_DISPLAY: Record<BookingStatus, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: 'Pending', tone: 'bg-amber-100 text-amber-800 ring-amber-500/30' },
  CONFIRMED: { label: 'Confirmed', tone: 'bg-emerald-100 text-emerald-800 ring-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  REFUNDED: { label: 'Refunded', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  EXPIRED: { label: 'Expired', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: EDMONTON_TZ,
  month: 'short',
  day: 'numeric',
});

function formatCAD(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

interface PageProps {
  searchParams: Promise<{ date?: string; route?: string; status?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // `date` absent → default to today; explicit `date=all` → no date filter.
  const dateParam = params.date ?? edmontonTodayISO();
  const dateFilterActive = dateParam !== 'all' && /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
  const dateInputValue = dateFilterActive ? dateParam : '';

  // Route filter is by slug now (covers admin-authored routes with no enum value).
  const routeOptions = await prisma.route.findMany({
    where: { slug: { not: null } },
    orderBy: { displayName: 'asc' },
    select: { slug: true, displayName: true },
  });
  const validSlugs = new Set(routeOptions.map((r) => r.slug));
  const routeParam = params.route && validSlugs.has(params.route) ? params.route : 'all';
  const statusParam = isBookingStatus(params.status) ? params.status : 'all';

  const where = {
    ...(dateFilterActive ? { serviceDate: edmontonDateToUTC(dateParam) } : {}),
    ...(routeParam !== 'all' ? { routeSlug: routeParam } : {}),
    ...(statusParam !== 'all' ? { status: statusParam } : {}),
  };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ serviceDate: 'desc' }, { departureTime: 'asc' }, { createdAt: 'desc' }],
    take: 200,
    select: {
      reference: true,
      status: true,
      routeKind: true,
      routeName: true,
      serviceDate: true,
      departureTime: true,
      seats: true,
      totalCents: true,
      guestFirstName: true,
      guestLastName: true,
      guestEmail: true,
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">Bookings</h2>
        <p className="mt-1 text-sm text-mist-500">
          {dateFilterActive ? `Service date ${dateParam}` : 'All dates'} · showing {bookings.length}
          {bookings.length === 200 ? '+ (capped)' : ''}
        </p>
      </div>

      {/* Pure GET form — no client JS; filters live in the URL so views are shareable. */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-mist-200 bg-white p-4 shadow-[var(--shadow-card)]">
        <Field label="Service date">
          <input
            type="date"
            name="date"
            defaultValue={dateInputValue}
            className="rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none"
          />
        </Field>
        <Field label="Route">
          <select
            name="route"
            defaultValue={routeParam}
            className="rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none"
          >
            <option value="all">All routes</option>
            {routeOptions.map((r) => (
              <option key={r.slug} value={r.slug as string}>
                {r.displayName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={statusParam}
            className="rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none"
          >
            <option value="all">All statuses</option>
            {Object.values(BookingStatus).map((s) => (
              <option key={s} value={s}>
                {STATUS_DISPLAY[s].label}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="rounded-lg bg-evergreen-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-evergreen-900"
        >
          Apply
        </button>
        <Link
          href="/admin/bookings?date=all"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-mist-500 hover:text-evergreen-800"
        >
          Reset
        </Link>
      </form>

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist-200 bg-mist-100 p-6 text-sm text-mist-500">
          No bookings match these filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[var(--shadow-card)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-left text-xs font-semibold uppercase tracking-wider text-mist-500">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Date · Time</th>
                <th className="px-4 py-3 text-right">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const name =
                  [b.user?.firstName, b.user?.lastName].filter(Boolean).join(' ') ||
                  [b.guestFirstName, b.guestLastName].filter(Boolean).join(' ') ||
                  '—';
                const email = b.user?.email ?? b.guestEmail ?? '';
                const seats = b.seats;
                return (
                  <tr
                    key={b.reference}
                    className="border-b border-mist-100 last:border-0 hover:bg-mist-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${b.reference}`}
                        className="font-mono text-xs text-evergreen-700 hover:text-sunrise-700 hover:underline"
                      >
                        {b.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-mist-900">{name}</span>
                      {email && <span className="block text-xs text-mist-500">{email}</span>}
                    </td>
                    <td className="px-4 py-3 text-mist-700">
                      {b.routeName ?? (b.routeKind ? ROUTE_NAME[b.routeKind] : '—')}
                    </td>
                    <td className="px-4 py-3 text-mist-700">
                      {b.serviceDate ? DATE_FORMATTER.format(b.serviceDate) : '—'}
                      {b.departureTime && (
                        <span className="text-mist-500"> · {b.departureTime}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-mist-700">{seats}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          STATUS_DISPLAY[b.status].tone
                        }`}
                      >
                        {STATUS_DISPLAY[b.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-mist-900">
                      {formatCAD(b.totalCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">{label}</span>
      {children}
    </label>
  );
}

function isBookingStatus(value: string | undefined): value is BookingStatus {
  return value != null && Object.values(BookingStatus).includes(value as BookingStatus);
}
