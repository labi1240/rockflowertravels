// ─────────────────────────────────────────────────────────────────────────────
//  FAQ — mixed real + placeholder content
//
//  Questions are drafted from competitor FAQ inventories (Moraine Lake Bus Co.,
//  Lake Louise Shuttle, Fairview Tours). Answers are split into two groups:
//
//    ✓ REAL    — derived from project context (the May 03 2026 schedule PDF,
//                the published bundle pricing, and routing logistics). Safe to
//                ship as-is.
//
//    ⚠ TODO   — policy questions (cancellation, pets, accessibility, etc.)
//                that cannot be answered from project context. These render
//                with a visible "Policy pending" pill so they are obvious in
//                review and impossible to ship by accident. Replace each
//                placeholder before launch.
//
//  Future work: once all answers are confirmed, add a `<script type="application/ld+json">`
//  FAQPage schema block for SEO. Do NOT add the schema while TODO answers
//  are still present — Google will index the placeholder text.
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORT_EMAIL = 'hello@rockflowertravels.ca'; // TODO: confirm support email
const TOTAL_QUESTIONS = 17;

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-sunrise-200 bg-sunrise-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sunrise-700 dark:border-sunrise-500/30 dark:bg-sunrise-500/10 dark:text-sunrise-300">
          <span aria-hidden className="size-1.5 rounded-full bg-sunrise-500" />
          {TOTAL_QUESTIONS} answers, no marketing fluff
        </span>
        <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-mist-900 dark:text-white sm:text-5xl">
          Frequently asked
        </h2>
        <p className="mt-4 text-base text-mist-500 dark:text-mist-300">
          Quick answers about routes, pricing, and policies. Still stuck? Email{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-evergreen-700 underline decoration-sunrise-400 decoration-2 underline-offset-4 hover:text-evergreen-800 dark:text-sunrise-300 dark:hover:text-sunrise-200"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          and a real human will get back to you.
        </p>
      </header>

      <div className="mt-14 space-y-6">
        {/* Booking & pricing */}
        <FaqGroup label="Booking & pricing" count={4} icon={<TicketIcon />}>
          <FaqItem question="How much does the shuttle cost?">
            All seats are <strong>$64.99 CAD</strong> per person, per leg. Combine two Daytime Circuit
            legs for the <strong>Both Lakes bundle ($84.99)</strong> or three legs for the{' '}
            <strong>Round-trip circuit ($84.99)</strong>. 5% GST is added at checkout.
          </FaqItem>
          <FaqItem question="What's the difference between the Both Lakes and Round-trip bundles?">
            Both are priced at $84.99 CAD. The <strong>Both Lakes bundle</strong> covers any two
            Daytime Circuit legs — enough to reach Lake Louise Lakeshore and Moraine Lake in one
            day. The <strong>Round-trip circuit</strong> covers all three legs of a Daytime Circuit
            so you return to your starting stop. The discount applies automatically at checkout
            when you add qualifying legs.
          </FaqItem>
          <FaqItem question="Are prices one-way or round-trip?">
            Listed prices are per seat, per leg. The bundle pricing is what makes round-trip
            travel cheaper — three single legs would cost $194.97; the Round-trip bundle is $84.99
            for the same itinerary.
          </FaqItem>
          <FaqItem question="Can I bundle the Sunrise Express or Evening Return?">
            No. Bundle pricing applies to <strong>Daytime Circuit</strong> legs only. The Sunrise
            Express and Evening Return are standalone services at $64.99 CAD per seat.
          </FaqItem>
        </FaqGroup>

        {/* Schedule */}
        <FaqGroup label="Schedule" count={4} icon={<ClockIcon />}>
          <FaqItem question="What time is the first shuttle of the day?">
            The premium <strong>Sunrise Express</strong> departs Banff at <strong>4:30 AM</strong>
            {' '}and arrives at Moraine Lake at 6:00 AM. The first <strong>Daytime Circuit</strong>{' '}
            leaves Samson Mall (Lake Louise Village) at <strong>7:00 AM</strong>.
          </FaqItem>
          <FaqItem question="What time is the last shuttle back to Banff?">
            The <strong>Evening Return</strong> departs Lake Louise Lakeshore at{' '}
            <strong>6:00 PM</strong> and arrives in Banff at approximately 7:15 PM.
          </FaqItem>
          <FaqItem question="How long does a full Daytime Circuit take?">
            About <strong>1 hour 50 minutes</strong> for a full loop: Samson Mall → Lake Louise
            Lakeshore → Moraine Lake → back to Samson Mall. Five circuits run daily, starting at
            7:00, 9:00, 11:00, 1:30 PM, and 3:30 PM from Samson Mall.
          </FaqItem>
          <FaqItem question="Do the 6:10 AM and 6:35 AM Sunrise legs sell seats?">
            No. Those are internal repositioning legs — the bus moves from Moraine Lake to Lake
            Louise Lakeshore and then to Samson Mall to start the Daytime Circuit. Only the 4:30 AM
            Banff → Moraine Lake leg is customer-bookable.
          </FaqItem>
        </FaqGroup>

        {/* Logistics */}
        <FaqGroup label="Pickup & logistics" count={3} icon={<PinIcon />}>
          <FaqItem question="Where do I get picked up?">
            <strong>Samson Mall</strong> in Lake Louise Village is the main pickup point for the
            Daytime Circuit — it has food, retail, and restrooms while you wait. Lake Louise
            Lakeshore and Moraine Lake use <strong>designated loading areas</strong>; follow staff
            direction at the stop.
          </FaqItem>
          <FaqItem question="How early should I arrive?">
            <strong>10 minutes before</strong> your scheduled departure. Buses leave on time —
            late arrivals will miss the shuttle.
          </FaqItem>
          <FaqItem question="Can I visit both lakes in a single trip?">
            Yes. The Daytime Circuit loops through Lake Louise Lakeshore and Moraine Lake on every
            run, and the <strong>Both Lakes bundle ($84.99)</strong> is priced exactly for this —
            two legs lets you see both shores and return to a Village stop.
          </FaqItem>
        </FaqGroup>

        {/* Policies — placeholders */}
        <FaqGroup label="Policies" count={6} icon={<ShieldIcon />}>
          <FaqItem question="What is your cancellation and refund policy?" todo />
          <FaqItem question="Can I reschedule my booking to another day?" todo />
          <FaqItem question="What happens if I miss my shuttle?" todo />
          <FaqItem question="Can I bring my pet on the shuttle?" todo />
          <FaqItem question="Are your buses wheelchair accessible? Do you have child seats?" todo />
          <FaqItem question="What luggage and equipment can I bring on board?" todo />
        </FaqGroup>
      </div>
    </section>
  );
}

function FaqGroup({
  label, count, icon, children,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] ring-1 ring-mist-200/60 dark:bg-evergreen-900 dark:ring-evergreen-700/30">
      <header className="flex items-center gap-4 border-b border-mist-100 px-6 py-5 dark:border-evergreen-700/30">
        <span
          aria-hidden
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-sunrise-100 text-sunrise-700 dark:bg-sunrise-500/15 dark:text-sunrise-300"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-extrabold tracking-tight text-mist-900 dark:text-white">
            {label}
          </h3>
          <p className="text-xs text-mist-500 dark:text-mist-400">
            {count} {count === 1 ? 'question' : 'questions'}
          </p>
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

function FaqItem({
  question,
  children,
  todo = false,
}: {
  question: string;
  children?: React.ReactNode;
  todo?: boolean;
}) {
  return (
    <details className="group border-t border-mist-100 first:border-t-0 dark:border-evergreen-700/20">
      <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left transition-colors [&::-webkit-details-marker]:hidden hover:bg-mist-50/80 group-open:bg-sunrise-50/40 dark:hover:bg-evergreen-950/30 dark:group-open:bg-sunrise-500/5">
        {/* Accent stripe — only visible when open */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-sunrise-500 transition-transform duration-200 group-open:scale-y-100"
        />
        <span className="font-display text-base font-semibold leading-snug text-mist-900 dark:text-white sm:text-[17px]">
          {question}
        </span>
        <span
          aria-hidden
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-mist-100 text-mist-500 transition-all duration-200 group-hover:bg-mist-200 group-open:rotate-180 group-open:bg-evergreen-800 group-open:text-white dark:bg-evergreen-950/40 dark:text-mist-300 dark:group-hover:bg-evergreen-950/70 dark:group-open:bg-sunrise-500 dark:group-open:text-evergreen-950"
        >
          <ChevronIcon />
        </span>
      </summary>
      <div className="px-6 pb-6 pt-1 text-[15px] leading-relaxed text-mist-600 dark:text-mist-300">
        {todo ? (
          <div className="flex items-start gap-3 rounded-xl bg-sunrise-50 p-4 ring-1 ring-sunrise-200 dark:bg-sunrise-500/10 dark:ring-sunrise-500/30">
            <span
              aria-hidden
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sunrise-200 text-sunrise-800 dark:bg-sunrise-500/30 dark:text-sunrise-200"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM7 4.5h2v5H7v-5zm0 6h2v2H7v-2z" />
              </svg>
            </span>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-sunrise-700 dark:text-sunrise-300">
                Policy pending — do not ship
              </p>
              <p className="mt-1 text-sm text-mist-700 dark:text-mist-200">
                This answer needs operational input before launch. Replace in{' '}
                <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[11px] text-mist-900 dark:bg-evergreen-950/40 dark:text-white">
                  src/components/Faq.tsx
                </code>
                .
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </details>
  );
}

// ─── Inline icons (no Lucide dep) ────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
      <path d="M13 6v2M13 11v2M13 16v2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 3 4 6v6c0 4.5 3.2 8.5 8 9 4.8-.5 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
