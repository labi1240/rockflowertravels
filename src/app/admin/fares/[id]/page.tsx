import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { toFareDTO } from '@/lib/fares-db';
import FareEditForm from './FareEditForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminFareEditPage({ params }: PageProps) {
  const { id } = await params;
  const row = await prisma.fare.findUnique({ where: { id } });
  if (!row) notFound();
  const fare = toFareDTO(row);

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/admin/fares"
        className="inline-flex items-center gap-2 text-sm text-mist-500 transition-colors hover:text-mist-900"
      >
        ← All fares
      </Link>

      <header>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">{fare.label}</h2>
        <p className="mt-1 font-mono text-xs text-mist-400">{fare.id}</p>
      </header>

      <FareEditForm fare={fare} />
    </div>
  );
}
