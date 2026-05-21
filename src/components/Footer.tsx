import React from 'react';

const QUICK_LINKS = [
  { href: '#schedule', label: 'Schedules' },
  { href: '#tracker', label: 'Live shuttle tracker' },
  { href: '#map', label: 'Route map' },
  { href: '#booking', label: 'Book shuttle' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-evergreen-700/40 bg-evergreen-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 pb-12 pt-20 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="text-2xl">🌸</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-extrabold text-white">RockFlower</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-300">Travels Inc.</span>
            </span>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-mist-300">
            Premium transportation across the Canadian Rockies. Experience Banff, Lake Louise,
            and Moraine Lake in comfort on our luxury shuttle coaches.
          </p>
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-2 text-xs text-mist-400">
            <div>
              <dt className="font-semibold uppercase tracking-[0.12em] text-mist-500">Prepared</dt>
              <dd className="mt-0.5 text-mist-300">May 03, 2026</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.12em] text-mist-500">Document</dt>
              <dd className="mt-0.5 text-mist-300">Schedule Draft v1.2</dd>
            </div>
          </dl>
        </div>

        <FooterColumn title="Quick links">
          {QUICK_LINKS.map((l) => (
            <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Contact">
          <FooterLink href="mailto:info@rockflowertravels.ca">info@rockflowertravels.ca</FooterLink>
          <FooterLink href="tel:+14035550199">+1 (403) 555-0199</FooterLink>
          <li className="text-sm text-mist-400">Banff Visitor Center</li>
        </FooterColumn>
      </div>

      <div className="border-t border-evergreen-700/40 bg-evergreen-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-mist-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RockFlower Travels Inc. All rights reserved.</p>
          <p className="italic">Buses depart strictly on time — arrive 10 minutes early.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-mist-400">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-mist-200 transition hover:text-sunrise-300"
      >
        {children}
      </a>
    </li>
  );
}
