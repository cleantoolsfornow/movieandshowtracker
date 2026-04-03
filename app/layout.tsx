import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "Shared Movie & TV Tracker",
  description: "Track movies and shows for your household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
