import { LightRays } from '@/components/ui/light-rays';
import HeroBookingForm from '@/components/HeroBookingForm';

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <LightRays />

      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/hero_banner.png"
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full object-cover"
      >
        <source src="/hero_video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-evergreen-950/95 via-evergreen-950/85 to-evergreen-900/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-evergreen-950/30 via-transparent to-evergreen-950/40" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-32 pt-20 md:pb-40 md:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-48 lg:pt-32">
        {/* Left — narrative (server-rendered for SEO) */}
        <div className="max-w-2xl animate-fade-in text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-200">
            <span aria-hidden className="size-1.5 rounded-full bg-sunrise-400" />
            Premium Rocky Mountain Shuttles
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[0.98] tracking-tighter text-balance text-white sm:text-5xl lg:text-[3.75rem]">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-mist-300 sm:text-sm">Banff to</span>
            <span className="block text-sunrise-400">Lake Louise <span className="text-mist-300">&amp;</span> Moraine Lake</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist-200 sm:text-lg">
            Reliable, scenic, premium daily transit. Beat the parking crowds and travel in
            absolute comfort on our state-of-the-art shuttle coaches.
          </p>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-mist-200">
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="text-sunrise-400">✦</span>
              <span className="font-medium">Sunrise access at 4:30&nbsp;AM</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="text-sunrise-400">✦</span>
              <span className="font-medium">Buses depart on time</span>
            </li>
            <li className="inline-flex items-center gap-2">
              <span aria-hidden className="text-sunrise-400">✦</span>
              <span className="font-medium">Reserved seating</span>
            </li>
          </ul>
        </div>

        {/* Right — booking card (client island) */}
        <div className="w-full animate-fade-in [animation-delay:120ms]">
          <HeroBookingForm />
        </div>
      </div>
    </section>
  );
}
