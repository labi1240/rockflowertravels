import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
