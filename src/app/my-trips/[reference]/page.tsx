import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import { prisma } from '@/lib/prisma';
import { syncCurrentUser } from '@/lib/user-sync';
import { RouteKind, BookingStatus } from '@/generated/prisma/enums';

export const dynamic = 'force-dynamic';

const ROUTE_DISPLAY: Record<RouteKind, { name: string; tagline: string }> = {
  SUNRISE_EXPRESS: { name: 'Sunrise Express',  tagline: 'Premium 4:30 AM Banff → Moraine Lake' },
  DAYTIME_CIRCUIT: { name: 'Daytime Circuit',  tagline: 'Samson Mall ↔ Lake Louise ↔ Moraine' },
  EVENING_RETURN:  { name: 'Evening Return',   tagline: 'Lake Louise Lakeshore → Banff' },
};

const STATUS_DISPLAY: Record<BookingStatus, { label: string; tone: string; description: string }> = {
  PENDING_PAYMENT: {
    label: 'Pending payment',
    tone: 'bg-amber-100 text-amber-800 ring-amber-500/30',
    description: 'Your seat is held for 10 minutes. Complete payment to confirm.',
  },
  CONFIRMED: {
    label: 'Confirmed',
    tone: 'bg-emerald-100 text-emerald-800 ring-emerald-500/30',
    description: 'Your seat is reserved. See you at the pickup.',
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: 'bg-mist-100 text-mist-500 ring-mist-200',
    description: 'This booking was cancelled.',
  },
  REFUNDED: {
    label: 'Refunded',
    tone: 'bg-mist-100 text-mist-500 ring-mist-200',
    description: 'This booking was refunded.',
  },
  EXPIRED: {
    label: 'Expired',
    tone: 'bg-mist-100 text-mist-500 ring-mist-200',
    description: 'The payment hold expired before checkout completed.',
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Edmonton',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function formatCAD(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

interface PageProps {
  params: Promise<{ reference: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const user = await syncCurrentUser();
  if (!user) notFound();

  const { reference } = await params;

  const booking = await prisma.booking.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      userId: true,
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
      holdExpiresAt: true,
      payment: {
        select: { status: true, stripePaymentIntentId: true },
      },
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const statusInfo = STATUS_DISPLAY[booking.status];
  const route = booking.routeKind ? ROUTE_DISPLAY[booking.routeKind] : null;
  const routeTitle = route?.name ?? booking.routeName ?? 'Shuttle booking';
  const routeLabel = route?.name ?? booking.routeName ?? '—';
  const fullName = [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(' ');

  return (
    <>
      <Navbar />

      <main className="main-content min-h-screen bg-mist-50">
        <section className="mx-auto max-w-3xl px-6 pt-32 pb-24">
          <Link
            href="/my-trips"
            className="mb-8 inline-flex items-center gap-2 text-sm text-mist-500 transition-colors hover:text-mist-900"
          >
            ← Back to my trips
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusInfo.tone}`}
              >
                {statusInfo.label}
              </span>
              <span className="font-mono text-xs text-mist-500">{booking.reference}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-evergreen-800 sm:text-4xl">
              {routeTitle}
            </h1>
            {route && <p className="mt-1 text-mist-700">{route.tagline}</p>}
            <p className="mt-3 text-sm text-mist-700">{statusInfo.description}</p>
          </header>

          <div className="space-y-6">
            <Panel title="Trip details">
              <Row label="Date">
                {booking.serviceDate ? DATE_FORMATTER.format(booking.serviceDate) : 'Not set'}
              </Row>
              <Row label="Departure">
                {booking.departureTime ?? 'Not set'}
              </Row>
              <Row label="Route">{routeLabel}</Row>
            </Panel>

            <Panel title="Contact">
              <Row label="Name">{fullName || '—'}</Row>
              <Row label="Email">{booking.guestEmail ?? '—'}</Row>
              <Row label="Phone">{booking.guestPhone ?? '—'}</Row>
            </Panel>

            <Panel title="Receipt">
              <Row label="Subtotal" mono>{formatCAD(booking.subtotalCents)}</Row>
              <Row label="GST (5%)" mono>{formatCAD(booking.gstCents)}</Row>
              <Row label="Total" mono emphasize>
                {formatCAD(booking.totalCents)} {booking.currency}
              </Row>
              {booking.payment?.stripePaymentIntentId && (
                <Row label="Payment ref" mono subtle>
                  {booking.payment.stripePaymentIntentId}
                </Row>
              )}
            </Panel>

            <p className="text-xs text-mist-500">
              Booked {booking.createdAt.toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' })}.
              Need to make a change?{' '}
              <a
                href="mailto:hello@rockflowertravels.ca"
                className="text-evergreen-700 hover:text-evergreen-800 underline underline-offset-2"
              >
                Email us
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal />
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-evergreen-700">
        {title}
      </h2>
      <dl className="divide-y divide-mist-200">{children}</dl>
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
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-mist-500">{label}</dt>
      <dd
        className={`text-right ${mono ? 'tabular-nums' : ''} ${
          emphasize ? 'font-display text-lg font-bold text-mist-900' : subtle ? 'text-xs text-mist-500 font-mono break-all' : 'text-mist-900'
        }`}
      >
        {children}
      </dd>
    </div>
  );
}
