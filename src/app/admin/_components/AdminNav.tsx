'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/bookings', label: 'Bookings', exact: false },
  { href: '/admin/fares', label: 'Fares', exact: false },
  { href: '/admin/routes', label: 'Routes', exact: false },
  { href: '/admin/capacity', label: 'Capacity', exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 sm:flex-col">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? 'bg-evergreen-800 text-white shadow-[var(--shadow-card)]'
                : 'text-mist-700 hover:bg-mist-100 hover:text-evergreen-800'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
