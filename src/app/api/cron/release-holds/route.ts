import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { releaseExpiredHolds } from '@/lib/inventory';

export const runtime = 'nodejs';

/** Constant-time string compare that doesn't leak length via early return. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    // Compare against self to keep timing uniform, then fail.
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Releases seats from expired PENDING_PAYMENT holds across all departures.
 * Checkout already sweeps the specific departure it touches; this catches the rest.
 *
 * Schedule via Vercel cron (vercel.json):
 *   { "crons": [{ "path": "/api/cron/release-holds", "schedule": "*\/5 * * * *" }] }
 * Vercel cron requests carry `Authorization: Bearer $CRON_SECRET`. If CRON_SECRET is set
 * we require it; otherwise the route is open (dev convenience).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (!safeEqual(auth, `Bearer ${secret}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const released = await releaseExpiredHolds();
    if (released > 0) console.log(`[cron/release-holds] released ${released} expired hold(s)`);
    return NextResponse.json({ released });
  } catch (err) {
    console.error('[cron/release-holds] sweep failed', err);
    return NextResponse.json({ error: 'Sweep failed' }, { status: 500 });
  }
}
