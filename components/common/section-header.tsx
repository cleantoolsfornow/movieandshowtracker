import type { ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export function SectionHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  titleLevel = "h2",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
  titleLevel?: "h1" | "h2" | "h3" | "h4";
}) {
  const HeadingTag = titleLevel;

  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <HeadingTag className={cn("text-lg font-semibold text-foreground", titleClassName)}>
          {title}
        </HeadingTag>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
