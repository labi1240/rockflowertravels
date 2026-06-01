import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { RouteKind } from '@/generated/prisma/enums';
import { getFare, isFareId, quote, type FareId } from '@/lib/fares';

export const runtime = 'nodejs';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateReference(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const a = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const n = Math.floor(1000 + Math.random() * 9000);
  return `RF-${a}-${n}`;
}

interface Input {
  route: FareId;
  date: string;
  time: string;
  passengers: number;
  name: string;
  email: string;
  phone: string;
}

function validate(body: unknown): { ok: true; data: Input } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body must be an object' };
  const b = body as Record<string, unknown>;

  if (!isFareId(b.route)) return { ok: false, error: 'Invalid route' };
  if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) return { ok: false, error: 'Invalid date' };
  if (typeof b.time !== 'string' || b.time.length === 0) return { ok: false, error: 'Invalid time' };
  if (typeof b.passengers !== 'number' || !Number.isInteger(b.passengers) || b.passengers < 1 || b.passengers > 8) return { ok: false, error: 'Invalid passengers' };
  if (typeof b.name !== 'string' || b.name.trim().length === 0 || b.name.length > 120) return { ok: false, error: 'Invalid name' };
  if (typeof b.email !== 'string' || !EMAIL_RE.test(b.email)) return { ok: false, error: 'Invalid email' };
  if (typeof b.phone !== 'string' || b.phone.length < 5 || b.phone.length > 40) return { ok: false, error: 'Invalid phone' };

  return {
    ok: true,
    data: {
      route: b.route,
      date: b.date,
      time: b.time,
      passengers: b.passengers,
      name: b.name.trim(),
      email: b.email.trim(),
      phone: b.phone.trim(),
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const result = validate(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const { route, date, time, passengers, name, email, phone } = result.data;

    // Server-authoritative pricing — never trust amounts from the client.
    const fare = getFare(route);
    const { subtotalCents, gstCents, totalCents } = quote(route, passengers);

    const [firstName, ...rest] = name.split(/\s+/);
    const lastName = rest.join(' ') || null;
    const reference = generateReference();
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // If a Clerk session is present at checkout, upsert the User row and link the booking.
    // Guest checkouts (no session) leave userId null and rely on later email-match claiming.
    const { userId: clerkUserId } = await auth();
    let userId: string | null = null;
    if (clerkUserId) {
      const user = await prisma.user.upsert({
        where: { clerkUserId },
        create: { clerkUserId, email, firstName, lastName, phone },
        update: {},
        select: { id: true },
      });
      userId = user.id;
    }

    const booking = await prisma.booking.create({
      data: {
        reference,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
        status: 'PENDING_PAYMENT',
        holdExpiresAt,
        routeKind: fare.routeKind as RouteKind,
        serviceDate: new Date(`${date}T00:00:00Z`),
        departureTime: time,
        guestEmail: email,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestPhone: phone,
        subtotalCents,
        gstCents,
        totalCents,
        currency: 'CAD',
        payment: {
          create: {
            amountSubtotalCents: subtotalCents,
            gstCents,
            amountTotalCents: totalCents,
            currency: 'CAD',
            status: 'REQUIRES_PAYMENT',
          },
        },
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'cad',
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: `${fare.label} · ${date} · ${time}`,
      metadata: {
        bookingId: booking.id,
        reference,
        route,
        date,
        time,
        passengers: String(passengers),
      },
    });

    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      reference,
      holdExpiresAt: holdExpiresAt.toISOString(),
    });
  } catch (err) {
    console.error('[create-payment-intent] failed', err);
    return NextResponse.json({ error: 'Could not initialize payment' }, { status: 500 });
  }
}
