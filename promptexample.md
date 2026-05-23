## 🎨 PROMPT 1 — Master Prompt for Kimi K2.6

**When to use:** Paste this into Kimi K2.6 along with your Pinterest reference image. This is the prompt that generates the entire initial codebase.

**Tip:** Drop the Pinterest image into Kimi *first*, then paste this prompt below it. Kimi's MoonViT vision encoder reads the image as part of the same reasoning pass.

```markdown
Design and code a refined, atmospheric, deeply cinematic landing page for 
JAPAN TOURS — a premium 10-day curated travel experience across Osaka, 
Kyoto, and Tokyo. The aesthetic blends Wes Anderson's symmetric storytelling, 
Studio Ghibli's quiet wonder, and the editorial poise of a Kinfolk travel 
issue — a love letter to misty mountains, cherry blossoms, neon back-alleys, 
and the silent rituals of a tea house at dawn. Zero stock-travel-blog energy. 
Every visual surface is alive: real footage of mist rolling through valleys, 
lanterns swaying in narrow streets, a kimono sleeve catching wind, ramen 
steam curling against neon glow. The site should feel like it was 
art-directed by a filmmaker who shoots on 35mm and has spent three years 
studying Japanese spatial design.

---

HERO SECTION

Full-bleed hero composition layered in z-index depth — this is the single 
most important visual moment. Three distinct planes:

Background plane: A wide cinematic photograph of misty Japanese mountains 
at dawn — soft golden sun bleeding across distant ranges, low clouds 
settling into valleys. Graded warm: oat highlights, soft lavender shadows, 
terracotta midtones. Should feel like the opening frame of a Kurosawa film.

Mid-ground plane: Massive outlined display typography reading JAPAN — set 
in a thin condensed serif, stretching nearly the full width of the viewport. 
The mountains crop into the lower half of the letterforms, so the type 
appears to rise behind the landscape, only the upper portion of each letter 
floating above the mountain line. This z-index layering is non-negotiable. 
Letters should feel like ancient stone, weightless yet monumental.

Foreground plane: A solitary figure on the right side — a woman in a vibrant floral kimono, back turned, gazing into the valley. She is the human anchor. Cherry blossom branches frame her on the right edge.

Top-left: the JAPAN TOURS wordmark in tracked-out small caps with a small monoline globe icon. Top-right nav: About / Included / Contacts in tracked-out small caps with a thin underline that draws itself on hover. Top-right corner: a quiet outlined Book pill button. Right edge: three faint outlined social icons (Instagram, Facebook, Telegram) stacked vertically.

Below the typography, floating in the lower-left third: a horizontal strip of five polaroid-style cards, each containing a short looping video clip — a Kyoto pagoda, misty rice fields, a red shrine, a ramen shop interior with steam, a neon Shinjuku alley at night. Each card has a small caption in the bottom-left in mouse-type:
- 3 cities in Japan
- 10 days
- gigabytes of photos
- eat ramen
- enjoy the vibe

Cards drift left at 0.4x scroll speed (subtle parallax). On hover, the card lifts 6px, the video plays at full speed, and a faint warm glow appears behind it.

To the right of the kimono figure, floating: a chunky Book button in soft cream, with subtle backdrop-blur, on hover fills bottom-up with a warm amber gradient.

---

01 — ABOUT THE TOUR

Section opens against pure black background — the cinematic "fade to black" between scenes. Heading set centered in oversized condensed sans-serif: ABOUT THE TOUR, flanked by thin hairline rules extending to the edges of the viewport.

Two-column layout:

Left column (text): Short editorial paragraph in a clean serif — "We've planned a simple and convenient 10-day itinerary for your trip to Japan. You'll visit three cities: Osaka, Kyoto, and Tokyo." The phrase "Osaka, Kyoto, and Tokyo" lights up in a soft lime-yellow accent (#D4F87A) on scroll-in.

Below it, a second paragraph: "No need to worry about routes, schedules, or finding places — everything is already organized. We'll show you where to go, what to see, and where to eat, so you can simply enjoy the journey." The phrase "enjoy the journey" also picks up the lime-yellow accent.

Right column (vertical timeline): A vertical hairline rule running top-to-bottom with three nodes — small filled circles. Each node is labeled:
- Days 1–3 — Osaka (with a cluster of 2 offset photos: Osaka castle + city skyline)
- Days 4–6 — Kyoto (cluster of 2 offset photos: a pagoda + a red shrine)
- Days 7–10 — Tokyo (cluster of 2 offset photos: Shibuya neon + a Tokyo street)

Each photo cluster is rotated slightly (±2-4 degrees) for an editorial scrapbook feel. As the user scrolls, each cluster fades in and slides up sequentially using viewport-triggered stagger — Osaka first, then Kyoto, then Tokyo. Each photo has a subtle white border and soft shadow.

On hover over each cluster, photos separate slightly (one tilts left, one tilts right) revealing depth.

---

02 — WHAT'S INCLUDED

Full-width black section. Heading WHAT'S INCLUDED in oversized condensed sans-serif, left-aligned, with a thin hairline rule extending to the right edge.

Below: a four-up bento grid of cards. Each card is a soft glassmorphism panel — rgba(255,255,255,0.04) background, 1px border in rgba(255,255,255,0.1), generous interior padding, rounded corners.

Each card contains:
- A small monoline icon at the top-left in lime-yellow accent
- The category title in tracked-out small caps
- A short body description in body weight

The four cards:
1. Guides — 2 awesome guides who know everything about Japan!
2. Flights — Routes: Moscow — Osaka, Tokyo — Moscow
3. Transfers — From the airport to the hotels
4. Hotels — Comfortable accommodation, 2 people per room (breakfasts included)

On hover: card lifts 4px, border brightens to lime-yellow, icon scales up 1.1x. Subtle warm glow appears behind it.

---

03 — CONTACT / BOOK

Full-bleed cinematic background — a hero image of cherry blossoms in full bloom framing Mount Fuji and a red pagoda in the distance. Soft pastel sunrise grading. The image should feel like a postcard from heaven.

Floating over it on the left side: a frosted-glass form panel with heavy backdrop-blur (backdrop-blur-xl), rgba(20,20,20,0.5) background, soft white border.

Heading inside: "Want to join us, but still have questions?" in a clean serif. Below it: "Leave a request" in tracked-out small caps.

Form fields (each with thin hairline underline that lights up lime-yellow on focus):
- Your name
- Phone number
- Comment

The Send button is a chunky cream-white pill, full-width of the form. On hover, it shifts to lime-yellow accent.

---

FOOTER

Repeats the nav (Home / About / Included / Contacts). The JAPAN TOURS wordmark appears bottom-left with the globe icon. Three faint outlined social icons (Instagram, Facebook, Telegram) bottom-right. A thin hairline rule above the row.

---

COLOR PALETTE

Mist Black #0A0A0A — primary background
Mountain Cream #F5E8D3 — warm border / accent backgrounds
Kimono White #FAFAFA — primary text
Lime Accent #D4F87A — emphasis text, focus states, hover
Sakura Pink #FFB7C5 — used sparingly, accent only
Mouse-type Gray #888888 — captions, fine print
Glass Border rgba(255,255,255,0.1) — card borders

---

TYPOGRAPHY

Display headings: A thin condensed sans-serif (Bebas Neue, Anton, or Oswald) — for "JAPAN", "ABOUT THE TOUR", "WHAT'S INCLUDED"
Body & paragraphs: Inter or Söhne (regular, 400 weight)
Small caps & nav: Inter with +180 letter-spacing, uppercase, 12px
Editorial serif (for "Want to join us"): Cormorant Garamond or Playfair Display, light weight

---

MOTION SYSTEM

Smooth scroll: Lenis wrapper on the entire page
Hero parallax: Mountains translate up at 0.3x scroll, "JAPAN" typography at 0.5x, kimono figure stays fixed
Card strip drift: The hero polaroid strip translates left at 0.4x scroll speed
Timeline reveal: Each city cluster (Osaka → Kyoto → Tokyo) uses Framer Motion useInView with 200ms stagger between them. whileInView triggers fade + slide-up from y=40px
Card hover: All cards lift 4-6px with cubic-bezier(0.16, 1, 0.3, 1) easing, 300ms
Photo cluster hover: Photos separate with subtle rotation
Custom cursor: Small dot that grows into a thin outlined circle on interactive elements
Easing standard: cubic-bezier(0.16, 1, 0.3, 1) — confident, exhaled, never abrupt

---

TECH STACK

Next.js 16 (App Router, TypeScript)
Tailwind CSS (with arbitrary values for precise glassmorphism)
Framer Motion for all animations (useScroll, useTransform, useInView, whileHover)
Lenis (@studio-freight/lenis) for smooth scroll
Next/Image for all image optimization
No external UI libraries — pure custom components

---

PERFORMANCE & FEEL

Every image lazy-loaded with a 0.4s fade-in. Generous whitespace. Considered pacing. The site should feel like flipping through a leather-bound travel journal at a quiet café in Kyoto. Nothing decorative. Nothing extra. The whole experience should feel like walking from a misty mountain morning, into a temple at noon, into a neon Tokyo alley at night — a single 10-day journey told in scroll.

---

CRITICAL IMPLEMENTATION NOTES

1. Z-index layering in the hero is non-negotiable. The "JAPAN" typography MUST sit behind the mountain image, only the top portion visible. Use position: absolute with negative z-index and a mask or carefully cropped background image to achieve this.

2. The timeline stagger reveal is the centerpiece animation. Get this perfect — viewport-triggered, sequential, smooth.

3. The polaroid card strip needs subtle parallax drift, not a heavy effect. 0.4x scroll speed translation is enough.

4. Glassmorphism only works with proper backdrop-blur. Ensure all glass panels have backdrop-filter: blur() AND a semi-transparent background.

Build the full Next.js project with all sections. Output complete, production-ready code with no placeholders.
```
