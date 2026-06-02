'use client';

import Image from 'next/image';
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
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-col sm:overflow-visible sm:px-0 sm:pb-0">
      <Link
        href="/"
        aria-label="Rock Flower Travels Inc. — home"
        className="mb-4 hidden items-center transition-transform hover:scale-[1.02] active:scale-95 sm:flex"
      >
        <Image
          src="/main_logo.png"
          alt="Rock Flower Travels Inc."
          width={400}
          height={195}
          priority
          className="h-10 w-auto"
        />
      </Link>
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
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
