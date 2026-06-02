import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/admin-auth';
import AdminNav from './_components/AdminNav';

// Operational data must never be cached — admins need live inventory + bookings.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-mist-50 text-mist-900">
      <header className="border-b border-mist-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sunrise-700">
              RockFlower Travels
            </p>
            <h1 className="font-display text-xl font-bold text-evergreen-800">
              Operations Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-mist-500 sm:inline">{admin.name}</span>
            <Link
              href="/"
              className="rounded-full border border-mist-200 px-4 py-2 text-sm font-semibold text-mist-700 transition-colors hover:border-evergreen-800/40 hover:text-evergreen-800"
            >
              Back to site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:flex-row">
        <aside className="sm:w-48 sm:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
