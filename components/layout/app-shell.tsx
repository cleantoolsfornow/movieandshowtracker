"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

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
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-teal-500/15 blur-3xl"
      />
      <header className="sticky top-0 z-20 border-b border-border-subtle/90 bg-surface-strong/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="min-w-0 text-sm font-bold tracking-[0.08em] text-foreground"
          >
            <span className="app-kicker block leading-none">Household</span>
            <span className="block truncate font-display text-base tracking-[0.02em] text-foreground sm:text-lg">
              Movie & TV Tracker
            </span>
          </Link>
          <nav className="max-w-full overflow-x-auto">
            <div className="flex min-w-max items-center gap-1 rounded-2xl border border-border-subtle bg-surface px-1 py-1 shadow-soft">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                          className="h-5 w-5 rounded-full object-cover ring-1 ring-border-strong/40"
                        />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-text-muted ring-1 ring-border-strong/35">
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
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-7">{children}</main>
    </div>
  );
}
