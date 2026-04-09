import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type ChipTone = "neutral" | "accent" | "success" | "muted";

const toneClasses: Record<ChipTone, string> = {
  neutral: "border-border-strong/45 bg-surface/92 text-text-muted shadow-[inset_0_1px_0_rgb(255_255_255_/_0.52)]",
  accent:
    "border-accent/90 bg-[linear-gradient(140deg,var(--accent),var(--accent-strong))] text-accent-contrast",
  success:
    "border-shared-watch/80 bg-[linear-gradient(140deg,var(--shared-watch),#2b5f4f)] text-white",
  muted:
    "border-border-subtle bg-surface-muted/92 text-text-muted shadow-[inset_0_1px_0_rgb(255_255_255_/_0.38)]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
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
