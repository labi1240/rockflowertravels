import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export interface SyncedUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Resolves the signed-in Clerk user to a DB User row, creating it on first sight.
 * Also attaches any guest bookings (userId=null) whose guestEmail matches.
 *
 * Returns null when no Clerk session exists or the Clerk user has no primary email.
 *
 * Safe to call on every dashboard request — the upsert is idempotent and the guest-claim
 * updateMany is a no-op once all matching bookings already carry the userId.
 */
export async function syncCurrentUser(): Promise<SyncedUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
  if (!email) return null;

  const firstName = clerkUser.firstName ?? null;
  const lastName = clerkUser.lastName ?? null;

  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    create: { clerkUserId: clerkUser.id, email, firstName, lastName },
    update: { email, firstName, lastName },
    select: { id: true, clerkUserId: true, email: true, firstName: true, lastName: true },
  });

  // Claim past guest bookings made with the same email before this user signed up.
  await prisma.booking.updateMany({
    where: { userId: null, guestEmail: email },
    data: { userId: user.id },
  });

  return user as SyncedUser;
}
