'use client';

import { useBookingModal, type BookingRouteId } from '@/store/booking-modal';

export default function ServiceBookButton({
  route,
  variant = 'primary',
  children,
}: {
  route: BookingRouteId;
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
}) {
  const open = useBookingModal((s) => s.open);

  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400/40';
  const tone =
    variant === 'primary'
      ? 'bg-evergreen-800 text-white hover:bg-evergreen-700 dark:bg-sunrise-500 dark:text-evergreen-950 dark:hover:bg-sunrise-400'
      : 'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25';

  return (
    <button type="button" onClick={() => open(route)} className={`${base} ${tone}`}>
      {children}
      <span aria-hidden>→</span>
    </button>
  );
}
