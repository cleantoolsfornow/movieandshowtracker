import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/donate", label: "Donate" },
  { href: "/sign-in", label: "Sign in" },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-border-subtle/80 bg-surface-strong/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Track movies and shows for yourself or your household.
          </p>
          <p className="text-xs text-text-soft">
            Currently free to use. Built to make watch decisions easier, faster, and more fun.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
