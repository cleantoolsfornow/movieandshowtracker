import Link from "next/link";

import { PickleIcon } from "@/components/marketing/inline-icons";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/donate", label: "Donate" },
  { href: "/sign-in", label: "Sign in" },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-[rgb(58,104,63,0.1)] bg-[rgba(255,249,240,0.78)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center text-[rgb(31,87,51)]">
            <PickleIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="text-base font-semibold text-[rgb(23,35,18)]">
              FilmPickle
            </p>
            <p className="text-sm text-[rgb(87,101,66)]">
              Track movies and shows, solo or with your household.
            </p>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-1.5"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-[rgb(69,84,53)] hover:bg-[rgba(255,255,255,0.58)] hover:text-[rgb(23,35,18)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
