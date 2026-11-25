import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import StemPlayer from "@/components/StemPlayer";
import { Analytics } from "@vercel/analytics/next";

// Self-hosted (latin subset, variable weight) instead of next/font/google:
// Vercel's builders started getting font URLs from Google Fonts that
// next/font 14 can't parse, which failed the production build. These are
// the same files Google serves (both fonts are SIL Open Font License).
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/fraunces-latin-italic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

const dmSans = localFont({
  src: [{ path: "./fonts/dm-sans-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-body",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Los Syringas",
  description: "Indie surf rock from Boise, ID. Forced fusion of Surf Rock, Latin, and Pop Jazz.",
  openGraph: {
    title: "Los Syringas",
    description: "Indie surf rock from Boise, ID.",
    siteName: "Los Syringas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
        <Nav />
        {children}
        <StemPlayer />
        <Analytics />
      </body>
    </html>
  );
}
