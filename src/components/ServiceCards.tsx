// ─────────────────────────────────────────────────────────────────────────────
//  ServiceCards — photo-backed top-of-funnel orientation
//
//  Each service is paired with its most iconic destination photo from
//  /public/images/locations/. To swap a photo, just drop a new file at the
//  same path and rename it (or update the `image` field below).
//  Orphaned SVG placeholders remain at /public/images/routes/ — safe to delete.
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image';
import type { BookingRouteId } from '@/store/booking-modal';
import ServiceBookButton from '@/components/ServiceBookButton';

type Service = {
  id: BookingRouteId;
  name: string;
  eyebrow: string;
  window: string;
  description: string;
  priceFromCents: number;
  image: string;
  highlights: string[];
};

const SERVICES: Service[] = [
  {
    id: 'sunrise-express',
    name: 'Sunrise Express',
    eyebrow: 'Premium · isolated inventory',
    window: '4:30 AM departure',
    description: 'Direct from Banff to Moraine Lake in time for first light. Ideal for photographers, hikers, and early risers.',
    priceFromCents: 6499,
    image: '/images/locations/moraine-lake-ten-peaks.jpg',
    highlights: ['Arrive Moraine 6:00 AM', 'Beat the crowds', 'Premium coach'],
  },
  {
    id: 'daytime-circuit',
    name: 'Daytime Circuit',
    eyebrow: 'Most flexible',
    window: '7:00 AM – 5:20 PM',
    description: 'Five repeating loops Samson Mall → Lakeshore → Moraine → Samson. Bundle two or three legs to save.',
    priceFromCents: 6499,
    image: '/images/locations/lake-louise-lakeshore.webp',
    highlights: ['5 daily circuits', 'Both Lakes bundle $84.99', 'Round-trip bundle $84.99'],
  },
  {
    id: 'evening-return',
    name: 'Evening Return',
    eyebrow: 'End-of-day transfer',
    window: '6:00 PM departure',
    description: 'Single late-day departure back to Banff after an afternoon at Lake Louise. Reservations recommended.',
    priceFromCents: 6499,
    image: '/images/locations/banff.jpg',
    highlights: ['Lakeshore → Banff', 'Arrive 7:15 PM', 'Reserved seating'],
  },
];

export default function ServiceCards() {
  return (
    <ul className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </ul>
  );
}

function ServiceCard({ service: s }: { service: Service }) {
  const dollars = Math.floor(s.priceFromCents / 100);
  const cents = (s.priceFromCents % 100).toString().padStart(2, '0');

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-mist-200/60 transition hover:shadow-[var(--shadow-card-hover)] dark:bg-evergreen-900 dark:ring-evergreen-700/30">
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-evergreen-900">
        <Image
          src={s.image}
          alt={`${s.name} — ${s.description}`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white ring-1 ring-white/25 backdrop-blur">
            {s.eyebrow}
          </span>
          <p className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tighter text-white">
            {s.name}
          </p>
          <p className="text-xs font-semibold tabular-nums text-white/80">{s.window}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm leading-relaxed text-mist-600 dark:text-mist-300">
          {s.description}
        </p>

        <ul className="space-y-1.5">
          {s.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-mist-600 dark:text-mist-300">
              <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-sunrise-500" />
              {h}
            </li>
          ))}
        </ul>

        {/* Price + CTAs */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-mist-100 pt-4 dark:border-evergreen-700/30">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mist-400 dark:text-mist-500">
              From
            </p>
            <p className="font-display text-2xl font-extrabold tracking-tighter tabular-nums text-mist-900 dark:text-white">
              ${dollars}
              <span className="text-base">.{cents}</span>
              <span className="ml-1 text-xs font-semibold text-mist-400 dark:text-mist-500">CAD</span>
            </p>
          </div>
          <ServiceBookButton route={s.id}>Book</ServiceBookButton>
        </div>
      </div>
    </li>
  );
}
