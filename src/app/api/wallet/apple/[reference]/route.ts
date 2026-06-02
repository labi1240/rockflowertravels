import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncCurrentUser } from '@/lib/user-sync';
import { BookingStatus } from '@/generated/prisma/enums';

// ─────────────────────────────────────────────────────────────────────────────
//  Apple Wallet pass endpoint — SCAFFOLD (returns 501 until signing is wired).
//
//  GET /api/wallet/apple/<reference>
//    → on completion, streams a signed `.pkpass` (application/vnd.apple.pkpass)
//      that iOS opens directly into Wallet.
//
//  The auth + ownership + status checks below are the REAL guardrails and stay
//  as-is. Only the pass *generation* is stubbed. The "Add to Apple Wallet"
//  button in BookingModal is gated behind NEXT_PUBLIC_WALLET_ENABLED, so this
//  route is never linked until it's implemented.
//
//  ── To finish (Phase B) ──────────────────────────────────────────────────
//  1. Apple Developer account → create a Pass Type ID (e.g.
//     pass.ca.rockflowertravels.boarding) and download its signing cert.
//  2. Add a dependency: `bun add passkit-generator`.
//  3. Provide secrets (do NOT commit — use Vercel env / .env.local):
//       APPLE_PASS_TYPE_ID, APPLE_TEAM_ID,
//       APPLE_PASS_CERT (PEM), APPLE_PASS_KEY (PEM), APPLE_PASS_KEY_PASSPHRASE,
//       APPLE_WWDR_CERT (Apple WWDR intermediate cert, PEM).
//  4. Build the pass from a `.pass` template (pass.json + icon/logo @1x/2x/3x):
//       - eventTicket or generic style
//       - primaryFields: route, secondaryFields: date/time/pax
//       - barcodes: [{ format: 'PKBarcodeFormatQR',
//                      message: absoluteUrl(`/my-trips/${reference}`),
//                      messageEncoding: 'iso-8859-1' }]
//         (matches the on-screen QR so both scan identically)
//       - serialNumber: booking.reference
//     Then: `const buf = pass.getAsBuffer()` and return it with headers:
//       Content-Type: application/vnd.apple.pkpass
//       Content-Disposition: attachment; filename="<reference>.pkpass"
//  5. (Optional) Add a Wallet web service + APNs registration for live updates
//     (gate/seat/status changes pushed to the pass).
//  6. Flip NEXT_PUBLIC_WALLET_ENABLED=true.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const user = await syncCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { reference } = await params;

  const booking = await prisma.booking.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      userId: true,
      routeName: true,
      serviceDate: true,
      departureTime: true,
    },
  });

  // Don't leak existence of other users' bookings — same 404 for missing or
  // not-owned.
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    return NextResponse.json(
      { error: 'Only confirmed bookings can be added to Wallet' },
      { status: 409 },
    );
  }

  // TODO(Phase B): generate and stream the signed .pkpass here.
  return NextResponse.json(
    {
      error: 'Apple Wallet passes are not yet available.',
      detail:
        'Pass signing is not configured. See the implementation notes in this route file.',
      reference: booking.reference,
    },
    { status: 501 },
  );
}
