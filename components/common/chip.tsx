import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type ChipTone = "neutral" | "accent" | "success" | "muted";

const toneClasses: Record<ChipTone, string> = {
  neutral: "border-border-strong/45 bg-surface text-text-muted",
  accent: "border-accent bg-accent text-accent-contrast",
  success: "border-shared-watch bg-shared-watch text-white",
  muted: "border-border-subtle bg-surface-muted text-text-muted",
};

type BaseChipProps = {
  tone?: ChipTone;
};

export type ChipProps = HTMLAttributes<HTMLSpanElement> & BaseChipProps;
export type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  BaseChipProps & {
    active?: boolean;
  };

export function Chip({ className, tone = "neutral", ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export function ChipButton({
  className,
  tone = "neutral",
  active = false,
  type = "button",
  ...props
}: ChipButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? tone === "neutral"
            ? toneClasses.accent
            : toneClasses[tone]
          : "border-border-strong/45 bg-surface text-text-muted hover:bg-surface-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
