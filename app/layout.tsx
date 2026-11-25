import type { Metadata } from "next";
import { Fraunces, DM_Sans, Caveat, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import StemPlayer from "@/components/StemPlayer";
import { Analytics } from "@vercel/analytics/next";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

// Handwritten faces for the Sueños sticky wall
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-marker",
  weight: "400",
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
      <body className={`${fraunces.variable} ${dmSans.variable} ${caveat.variable} ${marker.variable} antialiased`}>
        <Nav />
        {children}
        <StemPlayer />
        <Analytics />
      </body>
    </html>
  );
}
