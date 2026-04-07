"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FilmIcon } from "@/components/marketing/inline-icons";
import { PublicAuthCta } from "@/components/marketing/public-auth-cta";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/donate", label: "Donate" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle/80 bg-surface-strong/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-[linear-gradient(145deg,rgba(42,99,255,0.16),rgba(21,122,110,0.12))] text-accent shadow-soft">
              <FilmIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="app-kicker block leading-none">Movie And Show Tracker</span>
              <span className="block truncate text-sm font-semibold text-foreground sm:text-base">
                Solo picks. Shared watch nights. One beautiful tracker.
              </span>
            </span>
          </Link>
          <PublicAuthCta className="hidden md:flex" />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 md:mt-1">
          <nav aria-label="Public" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={
                  isActive(link.href)
                    ? "rounded-lg border border-accent/35 bg-accent/10 px-3 py-2 text-sm font-semibold text-foreground"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-muted hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <PublicAuthCta className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
