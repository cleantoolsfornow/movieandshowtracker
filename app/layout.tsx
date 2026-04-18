import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import { AppProviders } from "@/app/providers";

const sansFont = localFont({
  src: [
    { path: "./fonts/manrope/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/manrope/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/manrope/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/manrope/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/manrope/manrope-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const displayFont = localFont({
  src: [
    { path: "./fonts/sora/sora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/sora/sora-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/sora/sora-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/sora/sora-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/sora/sora-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Movie And Show Tracker",
    template: "%s | Movie And Show Tracker",
  },
  description:
    "Track movies and shows in one elegant place for solo use or your household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
