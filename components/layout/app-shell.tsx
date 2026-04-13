"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import {
  FilmIcon,
  PickleIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/marketing/inline-icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: UsersIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/library", label: "Library", icon: FilmIcon },
];

const DESKTOP_NAV_ITEMS = [
  ...NAV_ITEMS,
  { href: "/settings", label: "Profile", icon: UsersIcon },
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
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_8%_0%,rgba(219,241,158,0.5),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(244,188,70,0.28),transparent_34%),radial-gradient(circle_at_65%_46%,rgba(52,111,85,0.18),transparent_40%)] blur-3xl"
      />
      <header className="border-border-subtle/85 bg-surface-strong/88 sticky top-0 z-20 border-b-0 backdrop-blur-2xl sm:border-b">
        <div className="w-full px-4 pt-2 pb-0 sm:py-3">
          <div className="flex items-center justify-between gap-3 py-1 sm:py-0">
            <Link
              href="/dashboard"
              className="text-foreground -ml-1 inline-flex min-w-0 items-center gap-3 text-sm font-bold tracking-[0.06em] sm:ml-0"
            >
              <span className="shadow-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(58,104,63,0.2)] bg-[linear-gradient(145deg,rgba(219,241,158,0.86),rgba(244,188,70,0.4))] text-[rgb(31,87,51)] sm:h-12 sm:w-12 sm:rounded-2xl">
                <PickleIcon className="h-7 w-7 sm:h-9 sm:w-9" />
              </span>
              <span className="font-display text-foreground block truncate text-base tracking-[0.01em] sm:text-xl">
                FilmPickle
              </span>
            </Link>

            <Link
              href="/settings"
              className="border-border-subtle bg-surface/90 text-text-muted hover:bg-surface-muted hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border sm:hidden"
              aria-label="Profile"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="ring-border-strong/40 h-7 w-7 rounded-full object-cover ring-1"
                />
              ) : (
                <span className="bg-surface-muted text-text-muted ring-border-strong/35 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-1">
                  {avatarFallback}
                </span>
              )}
            </Link>
          </div>

          <nav className="-mx-4 mt-1.5 max-w-none overflow-x-auto sm:mx-0 sm:mt-3">
            <div className="border-border-subtle bg-surface/92 grid grid-cols-3 border-y sm:hidden">
              {NAV_ITEMS.map((item, index) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-border-subtle/70 relative flex min-h-10 items-center justify-center px-2 py-2 text-center text-[0.96rem] font-semibold transition-colors ${
                      index < NAV_ITEMS.length - 1 ? "border-r" : ""
                    } ${
                      active
                        ? "bg-[linear-gradient(180deg,rgba(52,111,85,0.14),rgba(52,111,85,0.06))] text-[rgb(31,87,51)]"
                        : "text-text-muted hover:bg-surface-muted/70 hover:text-foreground"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="border-border-subtle bg-surface/90 hidden min-w-max items-center gap-1 rounded-2xl border p-1 sm:flex">
              {DESKTOP_NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                      active
                        ? "bg-[linear-gradient(140deg,var(--accent),var(--accent-strong))] text-accent-contrast"
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
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
