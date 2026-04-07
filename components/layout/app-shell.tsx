"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

const NAV_ITEMS = [
  { href: "/home", label: "Home" },
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/home"
            className="text-sm font-bold tracking-wide text-slate-900"
          >
            Shared Movie & TV Tracker
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.href === "/settings" ? (
                    <span className="inline-flex items-center gap-2">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-300"
                        />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-300">
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
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
