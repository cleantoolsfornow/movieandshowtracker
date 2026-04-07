"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { PickleIcon } from "@/components/marketing/inline-icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const avatarUrl =
    profile?.avatarDataUrl ?? profile?.photoURL ?? user?.photoURL ?? null;
  const avatarFallback =
    (profile?.displayName ?? user?.displayName ?? user?.email ?? "P")
      .trim()
      .slice(0, 1)
      .toUpperCase() || "P";

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_10%_0%,rgba(219,241,158,0.44),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(244,188,70,0.24),transparent_34%),radial-gradient(circle_at_65%_50%,rgba(52,111,85,0.16),transparent_40%)] blur-3xl"
      />
      <header className="border-border-subtle/90 bg-surface-strong/90 sticky top-0 z-20 border-b backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="text-foreground inline-flex min-w-0 items-center gap-3 text-sm font-bold tracking-[0.08em]"
          >
            <span className="shadow-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgb(58,104,63,0.16)] bg-[linear-gradient(145deg,rgba(219,241,158,0.82),rgba(244,188,70,0.34))] text-[rgb(31,87,51)]">
              <PickleIcon className="h-9 w-9" />
            </span>
            <span className="min-w-0">
              <span className="app-kicker block leading-none">FilmPickle</span>
              <span className="font-display text-foreground block truncate text-base tracking-[0.02em] sm:text-lg">
                Household dashboard
              </span>
            </span>
          </Link>
          <nav className="max-w-full overflow-x-auto">
            <div className="border-border-subtle bg-surface shadow-soft flex min-w-max items-center gap-1 rounded-2xl border px-1 py-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
                      active
                        ? "bg-accent text-accent-contrast shadow-sm"
                        : "text-text-muted hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    {item.href === "/settings" ? (
                      <span className="inline-flex items-center gap-2">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt="Profile"
                            className="ring-border-strong/40 h-5 w-5 rounded-full object-cover ring-1"
                          />
                        ) : (
                          <span className="bg-surface-muted text-text-muted ring-border-strong/35 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ring-1">
                            {avatarFallback}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-7">
        {children}
      </main>
    </div>
  );
}
