import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { releaseDepartureSeats } from '@/lib/inventory';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) break;

        await prisma.$transaction([
          prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED', holdExpiresAt: null },
          }),
          prisma.payment.update({
            where: { bookingId },
            data: {
              status: 'SUCCEEDED',
              stripeCustomerId: typeof pi.customer === 'string' ? pi.customer : null,
            },
          }),
        ]);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) break;

        await prisma.payment.update({
          where: { bookingId },
          data: { status: 'FAILED' },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        if (!piId) break;

        const payment = await prisma.payment.findUnique({
          where: { stripePaymentIntentId: piId },
          select: { bookingId: true },
        });
        if (!payment) break;

        await prisma.$transaction(async (tx) => {
          // Conditional transition so a redelivered webhook can't release seats twice.
          const res = await tx.booking.updateMany({
            where: { id: payment.bookingId, status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] } },
            data: { status: 'REFUNDED' },
          });
          await tx.payment.update({ where: { bookingId: payment.bookingId }, data: { status: 'REFUNDED' } });
          if (res.count === 1) {
            const b = await tx.booking.findUnique({
              where: { id: payment.bookingId },
              select: { seats: true, routeSlug: true, routeKind: true, serviceDate: true, departureTime: true },
            });
            if (b?.serviceDate && b.departureTime) {
              await releaseDepartureSeats(
                tx,
                {
                  routeSlug: b.routeSlug ?? b.routeKind ?? '',
                  serviceDateISO: b.serviceDate.toISOString().slice(0, 10),
                  departureTime: b.departureTime,
                },
                b.seats,
              );
            }
          }
        });
        break;
      }

      default:
        // ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook] handler failed', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
