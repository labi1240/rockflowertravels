'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateFarePricing, setFareSale } from '@/app/admin/_actions/fares';
import { quote, type FareDTO } from '@/lib/fares';

const dollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (value: string) => Math.round(parseFloat(value) * 100);

function toLocalInput(ms: number | null): string {
  if (ms == null) return '';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

const INPUT =
  'w-full rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none';

export default function FareEditForm({ fare }: { fare: FareDTO }) {
  const router = useRouter();

  const [price, setPrice] = useState(dollars(fare.priceCents));
  const [toll, setToll] = useState(dollars(fare.tollCents));
  const [priceMsg, setPriceMsg] = useState<string | null>(null);
  const [priceErr, setPriceErr] = useState<string | null>(null);
  const [savingPrice, startPrice] = useTransition();

  const hasSale = fare.salePriceCents !== null;
  const [saleEnabled, setSaleEnabled] = useState(hasSale);
  const [salePrice, setSalePrice] = useState(hasSale ? dollars(fare.salePriceCents as number) : '');
  const [saleStart, setSaleStart] = useState(toLocalInput(fare.saleStartsMs));
  const [saleEnd, setSaleEnd] = useState(toLocalInput(fare.saleEndsMs));
  const [saleMsg, setSaleMsg] = useState<string | null>(null);
  const [saleErr, setSaleErr] = useState<string | null>(null);
  const [savingSale, startSale] = useTransition();

  // Live "effective now" preview for one passenger using current form values.
  const previewSalePrice = saleEnabled && salePrice ? toCents(salePrice) : null;
  const preview = quote(
    {
      priceCents: price ? toCents(price) : fare.priceCents,
      tollCents: toll ? toCents(toll) : 0,
      salePriceCents: previewSalePrice,
      saleStartsMs: saleStart ? new Date(saleStart).getTime() : null,
      saleEndsMs: saleEnd ? new Date(saleEnd).getTime() : null,
    },
    1,
    Date.now(),
  );

  function savePrice() {
    setPriceMsg(null);
    setPriceErr(null);
    startPrice(async () => {
      const result = await updateFarePricing({
        id: fare.id,
        priceCents: toCents(price),
        tollCents: toll ? toCents(toll) : 0,
      });
      if (result.ok) {
        setPriceMsg('Saved.');
        router.refresh();
      } else {
        setPriceErr(result.error);
      }
    });
  }

  function saveSale() {
    setSaleMsg(null);
    setSaleErr(null);
    startSale(async () => {
      const result = await setFareSale({
        id: fare.id,
        sale: saleEnabled
          ? {
              salePriceCents: toCents(salePrice),
              saleStartsAt: saleStart || null,
              saleEndsAt: saleEnd || null,
            }
          : null,
      });
      if (result.ok) {
        setSaleMsg(saleEnabled ? 'Sale saved.' : 'Sale cleared.');
        router.refresh();
      } else {
        setSaleErr(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Base pricing */}
      <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-evergreen-700">
          Base pricing
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Base fare (CAD)
            </span>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 ${INPUT}`} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Toll per passenger (CAD)
            </span>
            <input type="number" step="0.01" min="0" value={toll} onChange={(e) => setToll(e.target.value)} className={`mt-1 ${INPUT}`} />
          </label>
        </div>
        {priceErr && <p className="mt-3 text-sm text-rose-700">{priceErr}</p>}
        {priceMsg && <p className="mt-3 text-sm text-emerald-700">{priceMsg}</p>}
        <button
          type="button"
          onClick={savePrice}
          disabled={savingPrice}
          className="mt-4 rounded-full bg-evergreen-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-evergreen-900 disabled:opacity-60"
        >
          {savingPrice ? 'Saving…' : 'Save price'}
        </button>
      </section>

      {/* Sale */}
      <section className="rounded-2xl border border-mist-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-evergreen-700">
            Sale price
          </h3>
          <label className="inline-flex items-center gap-2 text-sm text-mist-700">
            <input type="checkbox" checked={saleEnabled} onChange={(e) => setSaleEnabled(e.target.checked)} />
            Enable sale
          </label>
        </div>

        {saleEnabled && (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Sale fare (CAD)</span>
              <input type="number" step="0.01" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className={`mt-1 ${INPUT}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Starts (optional)</span>
              <input type="datetime-local" value={saleStart} onChange={(e) => setSaleStart(e.target.value)} className={`mt-1 ${INPUT}`} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Ends (optional)</span>
              <input type="datetime-local" value={saleEnd} onChange={(e) => setSaleEnd(e.target.value)} className={`mt-1 ${INPUT}`} />
            </label>
          </div>
        )}

        <p className="mt-4 text-sm text-mist-500">
          Effective price now (1 passenger):{' '}
          <span className="font-semibold text-mist-900 tabular-nums">
            ${(preview.totalCents / 100).toFixed(2)}
          </span>{' '}
          incl. GST {preview.onSale && <span className="text-rose-700">· sale active</span>}
        </p>
        {saleErr && <p className="mt-3 text-sm text-rose-700">{saleErr}</p>}
        {saleMsg && <p className="mt-3 text-sm text-emerald-700">{saleMsg}</p>}
        <button
          type="button"
          onClick={saveSale}
          disabled={savingSale}
          className="mt-4 rounded-full bg-evergreen-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-evergreen-900 disabled:opacity-60"
        >
          {savingSale ? 'Saving…' : saleEnabled ? 'Save sale' : 'Clear sale'}
        </button>
      </section>
    </div>
  );
}
