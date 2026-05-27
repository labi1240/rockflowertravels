# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Project Setup & Initialization

## Current Goal

- Establish foundational context files and initialize the core Next.js 16 repository.

## Completed

- Context file system (`project-overview.md`, `architecture.md`, `ui-context.md`, `code-standards.md`, `ai-workflow-rules.md`) established.
- **Home page SSR refactor (2026-05-24):** `src/app/page.tsx` is now a Server Component. Modal open/close state lifted into Zustand store `src/store/booking-modal.ts`. Client islands isolated to leaves: `HeroBookingForm`, `ScheduleInteractive`, `RouteMapInteractive`, plus existing client-only components (`Navbar`, `ShuttleTracker`, `BookingModal`, `LightRays`). Hero narrative copy, schedule/map section headers, and "Important travel notes" advisory now ship as server-rendered HTML for SEO. Verified via `curl localhost:3000` — H1 and all marketing copy present in initial response. `tsc --noEmit` clean.
- **Pricing & bundles section (2026-05-26):** Added server-rendered 3-card pricing block inside `ScheduleDashboard.tsx`, sitting between the "Pick your departure" header and the planner. Cards: Single trip ($64.99 CAD), Both lakes bundle ($84.99, sunrise-accent ring), Round-trip circuit ($84.99, primary tone). Each shows price, struck-through unbundled total, and savings note. Prices are marketing display only — checkout still reads `LegTemplate.priceCents` from Prisma; itinerary builder + auto-bundle discount logic is a separate workstream not yet scoped. `tsc --noEmit` clean.
- **Photo-backed service cards added (2026-05-26):** New `src/components/ServiceCards.tsx` (server) + `src/components/ServiceBookButton.tsx` (client-island for modal trigger). Three cards (Sunrise Express, Daytime Circuit, Evening Return) inserted at the top of `ScheduleDashboard` above the pricing block — establishing the three-tier funnel: orient → price → schedule. Each card has photo, eyebrow tag, name, time window, description, 3 highlight bullets, From-price, and a Book CTA that opens the modal with the correct `BookingRouteId`. Real location photos now wired in from `/public/images/locations/`: Sunrise→`moraine-lake-ten-peaks.jpg`, Daytime→`lake-louise-lakeshore.webp`, Evening→`banff.jpg`. User-supplied files were renamed from spaces/special-chars to kebab-case and moved from `/public/` root into `/public/images/locations/` (the original `Lake Louise Lakeshore .webp` had a trailing space before the extension — actively broken). next/image `unoptimized` flag removed so resize + format conversion (AVIF/WebP) kicks in. Unused photos remaining for future Popular Destinations grid: `moraine-lake.jpg`, `samson-mall.jpeg`. Orphaned SVG placeholders at `/public/images/routes/` left in place — safe to delete. `tsc --noEmit` clean.
- **FAQ visual restyle (2026-05-26):** Replaced the single white-box container with 4 separate per-group cards (each `rounded-2xl` with shadow + ring). Each group now leads with an icon chip (sunrise-100 bg) + group name + question count. Toggle changed from small `+` rotating to `×` → larger circular chevron that rotates 180° on open with a stronger color swap (mist → evergreen-800/sunrise-500). Added a sunrise accent stripe on the left edge of the summary row that scales in when an item opens. Header eyebrow upgraded from text-only to a sunrise-bordered pill with a dot ("17 answers, no marketing fluff"). Body text size bumped from 14px → 15px, summary text bumped to 17px on `sm`+. Container width expanded from `max-w-3xl` → `max-w-4xl`. All 17 questions, 6 TODO callouts, and the `SUPPORT_EMAIL` constant unchanged. `tsc --noEmit` clean.
- **FAQ accordion added (2026-05-26):** New `src/components/Faq.tsx` server component inserted between `<RouteMap />` and `<Footer />`. Uses native `<details>`/`<summary>` — no client JS, no Zustand, fully keyboard-accessible by default. 17 questions across 4 groups (Booking & pricing · Schedule · Pickup & logistics · Policies). 11 questions ship with **real answers** derived from the May 03 2026 schedule PDF and the published bundle pricing; the 6 policy questions (cancellation, reschedule, missed bus, pets, accessibility, luggage) render a high-visibility amber "Policy pending — do not ship" callout instead of an answer, so they cannot be shipped accidentally. Support email is a placeholder constant `SUPPORT_EMAIL` at the top of the file. SEO `FAQPage` JSON-LD schema deliberately NOT added — would index the TODO copy. Add schema only once all 17 answers are finalized. `tsc --noEmit` clean.
- **Social proof section added (2026-05-26):** New `src/components/SocialProof.tsx` server component inserted between `<ShuttleTracker />` and `<ScheduleDashboard />` in `src/app/page.tsx`. Contains: eyebrow + headline, 5-column grid mixing 2 rating badges (Google, Tripadvisor — inline brand glyphs as SVG, no asset deps) and 3 operational stat chips, plus 3 testimonial cards in a md:grid-cols-3 layout with star rows and service tag. **All ratings, stats, and testimonials are placeholders** — extracted to `PLACEHOLDER_BADGES` / `PLACEHOLDER_STATS` / `PLACEHOLDER_REVIEWS` constants at the top of the file with a "REPLACE BEFORE LAUNCH" comment banner. Shipping them as-is would be misleading advertising; swap in real Google/Tripadvisor data and verified customer quotes before production. Pure server component, no new deps. `tsc --noEmit` clean.
- **Sunrise Express schedule reverted to PDF (2026-05-26):** The operational PDF (`RockFlower_Daily_Shuttle_Schedule.pdf`, prepared May 03 2026) is canonical and explicitly tags the Moraine→Lakeshore (6:10) and Lakeshore→Samson (6:35) legs as **(positioning)** — non-bookable. Earlier in this session a "catalog" message claimed 6 customer-bookable Sunrise routes; that was reconciled against the PDF and rolled back. `sunriseRoutes` now has 3 entries with a `kind: 'premium' | 'positioning'` discriminator (kept the cleaner per-route `origin`/`dest` fields from the prior refactor — did not regress to the index-based lookup). Only Banff→Moraine is bookable; positioning rows show muted times, "Positioning" badge, and a disabled "Internal" button. Cross-checked Daytime circuit times (C1–C5) and Evening Return (Lakeshore→Banff 6:00–7:15 PM) against the PDF — both already matched, no changes needed. `tsc --noEmit` clean.

## In Progress

- None yet.

## Next Up

- Unit 01: Initialize Next.js 16 App Router repository with Tailwind 4.0 and shadcn/ui.
- Unit 02: Configure Clerk authentication with `proxy.ts` (Node.js runtime).
- Unit 03: Set up Prisma schema and connect to PostgreSQL database.

## Open Questions

- Which specific shadcn/ui components will be required for the first feature build?
- What are the initial data sources to be ingested for the Ammo Terminal aggregator functionality?

## Architecture Decisions

- **Framework:** Next.js 16 utilizing async Request-time APIs exclusively to prevent application crashes.
- **Routing/Auth:** Clerk implemented via `proxy.ts` (Node.js runtime) rather than the deprecated `middleware.ts`.
- **State Management:** Strict segregation between server data fetching (TanStack Query) and global client UI state (Zustand).
- **Styling:** Tailwind 4.0 with HSL custom properties to allow predictable lightness and saturation adjustments.

## Session Notes

- Context files are complete and locked in. 
- Ready to begin spec-driven development. 
- Ensure the first prompt instructs the AI to read the context files and `Unit 01` spec before executing any terminal commands or generating code.