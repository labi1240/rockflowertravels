import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FaresProvider } from "@/components/FaresProvider";
import { getActiveFares } from "@/lib/fares-db";
import type { FareDTO } from "@/lib/fares";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RockFlower Travels | Banff, Lake Louise & Moraine Lake Shuttle Service",
  description: "Book premium daily shuttle services between Banff, Lake Louise Village (Samson Mall), Lake Louise Lakeshore, and Moraine Lake. View Sunrise Express and Daytime Circuit schedules.",
  metadataBase: new URL("https://rockflowertravels.ca"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RockFlower Travels | Banff & Lake Louise Shuttles",
    description: "Premium daily shuttle schedule connecting Banff, Moraine Lake, and Lake Louise. Travel in comfort.",
    url: "https://rockflowertravels.ca",
    siteName: "RockFlower Travels",
    locale: "en_US",
    type: "website",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load the fare catalog once and feed the client islands (booking modal, hero form)
  // via context. Degrade gracefully to an empty catalog if the DB is unavailable so a
  // pricing outage never takes down the whole app. `nowMs` is request-time and shared
  // across SSR + hydration so sale-price evaluation can't mismatch.
  let fares: FareDTO[] = [];
  try {
    fares = await getActiveFares();
  } catch (err) {
    console.error("[RootLayout] failed to load fares", err);
  }
  const nowMs = Date.now();

  return (
    <html lang="en" className={cn(outfit.variable, plusJakarta.variable, "font-sans", geist.variable)}>
      <body>
        <ClerkProvider>
          <FaresProvider fares={fares} nowMs={nowMs}>
            {children}
          </FaresProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
