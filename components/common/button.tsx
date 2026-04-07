import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-accent-contrast hover:border-accent-strong hover:bg-accent-strong",
  secondary:
    "border border-border-strong/45 bg-surface text-text-muted hover:bg-surface-muted hover:text-foreground",
  ghost: "border border-transparent bg-transparent text-text-muted hover:bg-surface-muted hover:text-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-xl px-3 py-1.5 text-xs font-medium",
  md: "rounded-xl px-3.5 py-2 text-sm font-medium",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
