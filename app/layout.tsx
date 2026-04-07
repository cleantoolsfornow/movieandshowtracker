import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "./globals.css";
import { AppProviders } from "@/app/providers";

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
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
