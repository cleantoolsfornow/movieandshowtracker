import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-accent/85 bg-[linear-gradient(140deg,var(--accent),var(--accent-strong))] text-accent-contrast shadow-[0_10px_24px_rgb(37_108_63_/_0.26)] hover:-translate-y-[1px] hover:border-accent-strong hover:brightness-105",
  secondary:
    "border border-border-strong/45 bg-surface/92 text-text-muted shadow-[0_6px_18px_rgb(70_74_34_/_0.12)] hover:-translate-y-[1px] hover:bg-surface-muted hover:text-foreground",
  ghost:
    "border border-transparent bg-transparent text-text-muted hover:bg-surface-muted hover:text-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-xl px-3 py-1.5 text-xs font-semibold",
  md: "rounded-xl px-3.5 py-2 text-sm font-semibold",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-[0.01em] transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
