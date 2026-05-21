import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
