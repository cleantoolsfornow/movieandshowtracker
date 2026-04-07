"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PickleIcon } from "@/components/marketing/inline-icons";
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
    <header className="sticky top-0 z-30 border-b border-[rgb(58,104,63,0.1)] bg-[rgba(255,249,240,0.82)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-5">
        <div className="flex min-h-[72px] items-center gap-3 sm:min-h-[76px] sm:gap-4">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[rgb(31,87,51)] sm:h-11 sm:w-11">
              <PickleIcon className="h-8 w-8 sm:h-9 sm:w-9" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold text-[rgb(23,35,18)] sm:text-2xl">
                FilmPickle
              </span>
              <span className="hidden truncate text-sm text-[rgb(87,101,66)] sm:block">
                Movie and show tracking for solo queues and shared households
              </span>
            </span>
          </Link>

          <nav
            aria-label="Public"
            className="ml-6 hidden flex-1 items-center justify-center gap-1.5 md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={
                  isActive(link.href)
                    ? "rounded-full bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-semibold text-[rgb(24,38,19)] shadow-[0_8px_18px_rgba(84,90,42,0.08)]"
                    : "rounded-full px-4 py-2 text-sm font-medium text-[rgb(70,84,54)] hover:bg-[rgba(255,255,255,0.58)] hover:text-[rgb(24,38,19)]"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <PublicAuthCta className="ml-auto hidden md:flex" />
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgb(58,104,63,0.08)] py-3 md:hidden">
          <nav
            aria-label="Public"
            className="flex flex-wrap items-center gap-1.5"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={
                  isActive(link.href)
                    ? "rounded-full bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-semibold text-[rgb(24,38,19)] shadow-[0_8px_18px_rgba(84,90,42,0.08)]"
                    : "rounded-full px-4 py-2 text-sm font-medium text-[rgb(70,84,54)] hover:bg-[rgba(255,255,255,0.58)] hover:text-[rgb(24,38,19)]"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <PublicAuthCta className="w-full justify-end" />
        </div>
      </div>
    </header>
  );
}
