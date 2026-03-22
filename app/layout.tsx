import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import StemPlayer from "@/components/StemPlayer";

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
      </body>
    </html>
  );
}
