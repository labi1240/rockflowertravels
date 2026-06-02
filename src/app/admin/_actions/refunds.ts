'use server';

import { revalidatePath } from 'next/cache';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getAdminIdentity } from '@/lib/admin-auth';

export type RefundResult = { ok: true } | { ok: false; error: string };

/**
 * Initiates a Stripe refund for a booking. Admin-gated.
 *
 * Important: this does NOT write the REFUNDED status. The Stripe `charge.refunded`
 * webhook (src/app/api/webhooks/stripe/route.ts) is the single writer of refunded
 * state, so we only kick off the refund and record the audit trail here. The booking
 * row flips to REFUNDED asynchronously once the webhook lands.
 */
export async function refundBooking(input: {
  bookingId: string;
  reason?: string;
}): Promise<RefundResult> {
  const admin = await getAdminIdentity();
  if (!admin) return { ok: false, error: 'Not authorized.' };

  const bookingId = input.bookingId?.trim();
  if (!bookingId) return { ok: false, error: 'Missing booking id.' };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      status: true,
      payment: { select: { status: true, stripePaymentIntentId: true } },
    },
  });

  if (!booking) return { ok: false, error: 'Booking not found.' };
  if (booking.status !== 'CONFIRMED') {
    return { ok: false, error: `Only confirmed bookings can be refunded (status: ${booking.status}).` };
  }
  if (!booking.payment || booking.payment.status !== 'SUCCEEDED') {
    return { ok: false, error: 'No succeeded payment to refund.' };
  }
  const paymentIntentId = booking.payment.stripePaymentIntentId;
  if (!paymentIntentId) {
    return { ok: false, error: 'Booking has no Stripe payment intent.' };
  }

  try {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
  } catch (err) {
    console.error('[refundBooking] stripe refund failed', err);
    return { ok: false, error: 'Stripe refund failed. Check the dashboard and try again.' };
  }

  // Audit only — status transition is owned by the webhook.
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      refundedAt: new Date(),
      refundedBy: admin.email,
      refundReason: input.reason?.trim() || null,
    },
  });

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath('/admin');

  return { ok: true };
}
