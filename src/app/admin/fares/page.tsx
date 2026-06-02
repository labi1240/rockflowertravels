import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCents, isSaleActive, type FareTier } from '@/lib/fares';
import { toFareDTO } from '@/lib/fares-db';
import FareActiveToggle from './_components/FareActiveToggle';

export const dynamic = 'force-dynamic';

const TIER_LABEL: Record<FareTier, string> = {
  sunrise: 'Sunrise Express',
  daytime: 'Daytime',
  evening: 'Evening Return',
};

export default async function AdminFaresPage() {
  const rows = await prisma.fare.findMany({ orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }] });
  const fares = rows.map(toFareDTO);
  const nowMs = Date.now();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-evergreen-800">Fares &amp; pricing</h2>
        <p className="mt-1 text-sm text-mist-500">
          Edit prices, run sales, or hide a fare. Changes apply to the booking flow immediately.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mist-200 text-left text-xs font-semibold uppercase tracking-wider text-mist-500">
              <th className="px-4 py-3">Fare</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Toll</th>
              <th className="px-4 py-3">Sale</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {fares.map((f) => {
              const onSale = isSaleActive(f, nowMs);
              const saleScheduled = f.salePriceCents !== null && !onSale;
              return (
                <tr key={f.id} className="border-b border-mist-100 last:border-0 hover:bg-mist-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-mist-900">{f.label}</span>
                    <span className="block font-mono text-xs text-mist-400">{f.id}</span>
                  </td>
                  <td className="px-4 py-3 text-mist-700">{TIER_LABEL[f.tier]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {onSale ? (
                      <span>
                        <span className="font-semibold text-rose-700">
                          {formatCents(f.salePriceCents as number)}
                        </span>
                        <span className="ml-1.5 text-xs text-mist-400 line-through">
                          {formatCents(f.priceCents)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-mist-900">{formatCents(f.priceCents)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-mist-700">
                    {f.tollCents > 0 ? formatCents(f.tollCents) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {onSale ? (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-500/30">
                        On sale
                      </span>
                    ) : saleScheduled ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-500/30">
                        Scheduled
                      </span>
                    ) : (
                      <span className="text-xs text-mist-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FareActiveToggle id={f.id} active={f.active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/fares/${f.id}`}
                      className="text-sm font-semibold text-evergreen-700 hover:text-sunrise-700"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
