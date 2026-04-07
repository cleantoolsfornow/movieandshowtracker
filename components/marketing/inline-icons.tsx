import { useId, type SVGProps } from "react";

const baseClass = "h-4 w-4";

type IconProps = SVGProps<SVGSVGElement>;

export function SparkIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <path
        d="M12 3.5l1.75 4.75L18.5 10l-4.75 1.75L12 16.5l-1.75-4.75L5.5 10l4.75-1.75L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PickleIcon({ className, ...props }: IconProps) {
  const id = useId();
  const bodyGradientId = `${id}-pickle-body`;
  const shadeGradientId = `${id}-pickle-shade`;
  const stemGradientId = `${id}-pickle-stem`;
  const shadowId = `${id}-pickle-shadow`;
  const stickerPath =
    "M34.8 6.5c.5-1.8 1.7-3.3 3.5-4 1.1-.4 2.4-.3 3.3.5-.2 1.8-.8 3.5-2 4.8 2.8 2.1 4.7 5.4 5.1 9.1.4 4.3-1.3 8.2-1.2 12.4.1 3.7 1.7 7.1 1.9 10.8.2 4.8-1.9 9.6-5.7 12.7-3.9 3.2-9.1 4.4-14.1 3.8-4.8-.5-9.3-2.8-12.1-6.8-2.7-4-3.5-9.2-2.1-13.8 1-3.3 3.1-6 3.8-9.4.9-4.2-.4-8.7 1.3-12.8 2-4.8 7.1-7.8 12.3-8.1 2-.1 4 .1 6 .8Z";

  return (
    <svg
      viewBox="0 -6 64 80"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <defs>
        <filter
          id={shadowId}
          x="0"
          y="-6"
          width="64"
          height="80"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2.2"
            floodColor="#1B2616"
            floodOpacity="0.18"
          />
        </filter>
        <linearGradient
          id={bodyGradientId}
          x1="14"
          y1="8"
          x2="49"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A7DB59" />
          <stop offset="0.45" stopColor="#6BB33B" />
          <stop offset="1" stopColor="#2F7E2F" />
        </linearGradient>
        <linearGradient
          id={shadeGradientId}
          x1="21"
          y1="11"
          x2="46"
          y2="55"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E962F" stopOpacity="0" />
          <stop offset="1" stopColor="#154D21" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id={stemGradientId}
          x1="34"
          y1="3"
          x2="40"
          y2="13"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B8C29" />
          <stop offset="1" stopColor="#2E5D1F" />
        </linearGradient>
      </defs>
      <g filter={`url(#${shadowId})`}>
        <g transform="rotate(-40 32 28)">
          <g transform="translate(0 -1) scale(0.96 1.16) translate(1.333 -1.6)">
            <path
              d={stickerPath}
              fill="none"
              stroke="#FFFDF8"
              strokeWidth="6.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d={stickerPath} fill={`url(#${bodyGradientId})`} />
            <path d={stickerPath} fill={`url(#${shadeGradientId})`} />
            <path
              d={stickerPath}
              stroke="#216228"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M36 7c.5-1.4 1.5-2.6 2.8-3.1.7-.2 1.4-.2 2 .1-.2 1.4-.8 2.7-1.8 3.7"
              stroke={`url(#${stemGradientId})`}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.2 16.4c2.5-2.4 6.1-3.8 9.7-3.7 4.2.1 8.2 2.2 10.6 5.6"
              stroke="#DFF39B"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M18.9 24.3c1.9-1.5 4.4-2.4 6.8-2.2"
              stroke="#CDEB7A"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M18.1 16.2c1.2-4.2 4.8-7.3 9.1-8.1"
              stroke="#F5FFC8"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M17.5 18.1c1.7 4.7 1.6 10-.1 14.6"
              stroke="#2F8C39"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M25.7 12.2c1.8 4.7 1.9 10 .3 14.7"
              stroke="#2A7C35"
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.38"
            />
            <path
              d="M34 12.8c1.4 5 1.5 10.5.1 15.6"
              stroke="#2A7C35"
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.34"
            />
            <path
              d="M41.7 16.6c.8 4.7.4 9.7-1.4 14.1"
              stroke="#225F2B"
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.28"
            />
            <ellipse cx="18.8" cy="21.2" rx="1.8" ry="2.1" fill="#2B7B2E" />
            <ellipse cx="24.4" cy="28.9" rx="1.7" ry="2" fill="#2D812F" />
            <ellipse cx="19.8" cy="35.1" rx="1.5" ry="1.8" fill="#266F28" />
            <ellipse cx="29.9" cy="20.6" rx="1.5" ry="1.8" fill="#2B742C" />
            <ellipse cx="31.9" cy="32.9" rx="1.6" ry="1.9" fill="#256B26" />
            <ellipse cx="37.7" cy="24.9" rx="1.4" ry="1.6" fill="#2A7029" />
            <ellipse cx="39.8" cy="38.8" rx="1.8" ry="2.2" fill="#205E25" />
            <ellipse cx="27.6" cy="43.8" rx="1.5" ry="1.8" fill="#276F28" />
            <ellipse cx="16.9" cy="43.6" rx="1.2" ry="1.5" fill="#2A712A" />
            <ellipse cx="34.9" cy="47.1" rx="1.2" ry="1.5" fill="#265E24" />
            <path
              d="M21.5 45.6c3.5 2.9 8.1 4.4 12.6 4"
              stroke="#E3F7AB"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.65"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function UsersIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <path
        d="M8.2 13.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4zM15.8 11.8a2.9 2.9 0 1 0 0-5.8 2.9 2.9 0 0 0 0 5.8z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.8 19.3c.4-2.7 2.6-4.5 5.4-4.5s5 1.8 5.4 4.5M14 19.3c.3-1.8 1.8-3.1 3.8-3.1 1.1 0 2.1.4 2.9 1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FilmIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 5v14M16 5v14M3.5 9.7H20.5M3.5 14.3H20.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function SearchIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="5.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 15l4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LibraryIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <rect
        x="4"
        y="4.5"
        width="4.2"
        height="15"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="9.9"
        y="4.5"
        width="4.2"
        height="15"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="15.8"
        y="4.5"
        width="4.2"
        height="15"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ShieldIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <path
        d="M12 3.5l7 2.7v5.5c0 4.2-2.7 7.9-7 9.8-4.3-1.9-7-5.6-7-9.8V6.2l7-2.7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 12.1l1.8 1.8 4.2-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <path
        d="M7 17L17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className ?? baseClass}
      {...props}
    >
      <path
        d="M5 12h14M13 6.5 19 12l-6 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
