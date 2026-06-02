import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EDMONTON_TZ } from '@/lib/edmonton';
import { RouteKind, BookingStatus } from '@/generated/prisma/enums';
import RefundButton from './RefundButton';

export const dynamic = 'force-dynamic';

const ROUTE_NAME: Record<RouteKind, string> = {
  SUNRISE_EXPRESS: 'Sunrise Express',
  DAYTIME_CIRCUIT: 'Daytime Circuit',
  EVENING_RETURN: 'Evening Return',
};

const STATUS_DISPLAY: Record<BookingStatus, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: 'Pending payment', tone: 'bg-amber-100 text-amber-800 ring-amber-500/30' },
  CONFIRMED: { label: 'Confirmed', tone: 'bg-emerald-100 text-emerald-800 ring-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  REFUNDED: { label: 'Refunded', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
  EXPIRED: { label: 'Expired', tone: 'bg-mist-100 text-mist-500 ring-mist-200' },
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: EDMONTON_TZ,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: EDMONTON_TZ,
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatCAD(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

interface PageProps {
  params: Promise<{ reference: string }>;
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const { reference } = await params;

  const booking = await prisma.booking.findUnique({
    where: { reference },
    select: {
      id: true,
      reference: true,
      status: true,
      routeKind: true,
      routeName: true,
      serviceDate: true,
      departureTime: true,
      guestFirstName: true,
      guestLastName: true,
      guestEmail: true,
      guestPhone: true,
      subtotalCents: true,
      gstCents: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      refundedAt: true,
      refundedBy: true,
      refundReason: true,
      seats: true,
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      payment: { select: { status: true, stripePaymentIntentId: true } },
    },
  });

  if (!booking) notFound();

  const statusInfo = STATUS_DISPLAY[booking.status];
  const routeName = booking.routeName ?? (booking.routeKind ? ROUTE_NAME[booking.routeKind] : '—');
  const name =
    [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(' ') ||
    [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(' ') ||
    '—';
  const email = booking.user?.email ?? booking.guestEmail ?? '—';
  const phone = booking.user?.phone ?? booking.guestPhone ?? '—';
  const seats = booking.seats;

  const canRefund =
    booking.status === 'CONFIRMED' &&
    booking.payment?.status === 'SUCCEEDED' &&
    !!booking.payment?.stripePaymentIntentId;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-sm text-mist-500 transition-colors hover:text-mist-900"
      >
        ← All bookings
      </Link>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusInfo.tone}`}
          >
            {statusInfo.label}
          </span>
          <span className="font-mono text-xs text-mist-500">{booking.reference}</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">{routeName}</h2>
        <p className="mt-1 text-sm text-mist-500">
          {booking.serviceDate ? DATE_FORMATTER.format(booking.serviceDate) : 'Date not set'}
          {booking.departureTime && ` · ${booking.departureTime}`}
        </p>
      </header>

      <Panel title="Passenger">
        <Row label="Name">{name}</Row>
        <Row label="Email">{email}</Row>
        <Row label="Phone">{phone}</Row>
        <Row label="Seats">{seats || '—'}</Row>
      </Panel>

      <Panel title="Payment">
        <Row label="Subtotal" mono>{formatCAD(booking.subtotalCents)}</Row>
        <Row label="GST (5%)" mono>{formatCAD(booking.gstCents)}</Row>
        <Row label="Total" mono emphasize>
          {formatCAD(booking.totalCents)} {booking.currency}
        </Row>
        <Row label="Payment status">{booking.payment?.status ?? '—'}</Row>
        {booking.payment?.stripePaymentIntentId && (
          <Row label="Stripe PI" subtle>{booking.payment.stripePaymentIntentId}</Row>
        )}
        <Row label="Booked" subtle>{DATETIME_FORMATTER.format(booking.createdAt)}</Row>
      </Panel>

      {booking.refundedAt && (
        <Panel title="Refund">
          <Row label="Initiated" subtle>{DATETIME_FORMATTER.format(booking.refundedAt)}</Row>
          <Row label="By">{booking.refundedBy ?? '—'}</Row>
          <Row label="Reason">{booking.refundReason ?? '—'}</Row>
        </Panel>
      )}

      <Panel title="Actions">
        {canRefund ? (
          <div className="pt-1">
            <RefundButton bookingId={booking.id} totalLabel={formatCAD(booking.totalCents)} />
          </div>
        ) : (
          <p className="py-3 text-sm text-mist-500">
            {booking.status === 'REFUNDED'
              ? 'This booking has been refunded.'
              : 'Refund is only available for confirmed, paid bookings.'}
          </p>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-evergreen-700">
        {title}
      </h3>
      <dl className="divide-y divide-mist-100">{children}</dl>
    </div>
  );
}

function Row({
  label,
  children,
  mono = false,
  emphasize = false,
  subtle = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  emphasize?: boolean;
  subtle?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-sm text-mist-500">{label}</dt>
      <dd
        className={`text-right ${mono ? 'tabular-nums' : ''} ${
          emphasize
            ? 'font-display text-lg font-bold text-mist-900'
            : subtle
              ? 'break-all font-mono text-xs text-mist-500'
              : 'text-mist-900'
        }`}
      >
        {children}
      </dd>
    </div>
  );
}
