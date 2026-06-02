import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Admin authorization for the Operations Center (`/admin`).
 *
 * `proxy.ts` already forces a Clerk session on `/admin(.*)`, so these helpers
 * only decide whether that signed-in user is an *admin*.
 *
 * An identity is treated as admin when EITHER:
 *   1. Clerk `publicMetadata.role === 'admin'` (set in the Clerk dashboard), OR
 *   2. their primary email is listed in the `ADMIN_EMAILS` env var
 *      (comma-separated) — a dev/bootstrap allowlist so the dashboard is usable
 *      before any Clerk metadata is configured.
 */

export interface AdminIdentity {
  clerkUserId: string;
  email: string;
  name: string;
}

// Parsed once at module load — the env var doesn't change at runtime.
const ADMIN_EMAIL_ALLOWLIST: string[] = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Returns the admin identity, or null when the current user is not an admin. */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const user = await currentUser();
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ?? '';
  const role = (user.publicMetadata as { role?: string } | null)?.role;

  const isAdmin =
    role === 'admin' || (email !== '' && ADMIN_EMAIL_ALLOWLIST.includes(email));
  if (!isAdmin) return null;

  return {
    clerkUserId: user.id,
    email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || email,
  };
}

/** Resolves the admin identity or redirects non-admins to the marketing site. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdminIdentity();
  if (!admin) redirect('/');
  return admin;
}
