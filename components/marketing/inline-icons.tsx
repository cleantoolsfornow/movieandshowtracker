import type { SVGProps } from "react";

const baseClass = "h-4 w-4";

type IconProps = SVGProps<SVGSVGElement>;

export function SparkIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <path d="M12 3.5l1.75 4.75L18.5 10l-4.75 1.75L12 16.5l-1.75-4.75L5.5 10l4.75-1.75L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function UsersIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <path d="M8.2 13.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4zM15.8 11.8a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.8 19.3c.4-2.7 2.6-4.5 5.4-4.5s5 1.8 5.4 4.5M14 19.3c.3-1.8 1.8-3.1 3.8-3.1 1.1 0 2.1.4 2.9 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FilmIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5v14M16 5v14M3.5 9.7H20.5M3.5 14.3H20.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <circle cx="10.5" cy="10.5" r="5.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 15l4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LibraryIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <rect x="4" y="4.5" width="4.2" height="15" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9.9" y="4.5" width="4.2" height="15" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15.8" y="4.5" width="4.2" height="15" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ShieldIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <path d="M12 3.5l7 2.7v5.5c0 4.2-2.7 7.9-7 9.8-4.3-1.9-7-5.6-7-9.8V6.2l7-2.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.1 12.1l1.8 1.8 4.2-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? baseClass} {...props}>
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
