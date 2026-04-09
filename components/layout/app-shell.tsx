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
      <header className="border-border-subtle/85 bg-surface-strong/88 sticky top-0 z-20 border-b backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="text-foreground inline-flex min-w-0 items-center gap-3 text-sm font-bold tracking-[0.06em]"
          >
            <span className="shadow-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgb(58,104,63,0.2)] bg-[linear-gradient(145deg,rgba(219,241,158,0.86),rgba(244,188,70,0.4))] text-[rgb(31,87,51)]">
              <PickleIcon className="h-9 w-9" />
            </span>
            <span className="min-w-0">
              <span className="app-kicker block leading-none">FilmPickle</span>
              <span className="font-display text-foreground block truncate text-base tracking-[0.01em] sm:text-lg">
                Your watch universe
              </span>
            </span>
          </Link>
          <nav className="max-w-full overflow-x-auto">
            <div className="border-border-subtle bg-surface/90 shadow-soft flex min-w-max items-center gap-1 rounded-2xl border p-1">
              {NAV_ITEMS.map((item) => {
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
                        ? "bg-[linear-gradient(140deg,var(--accent),var(--accent-strong))] text-accent-contrast shadow-[0_8px_18px_rgb(37_108_63_/_0.28)]"
                        : "text-text-muted hover:bg-surface-muted hover:text-foreground"
                    } app-interactive`}
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
