import Link from "next/link";

import { PageCard } from "@/components/common/page-card";
import { SectionHeader } from "@/components/common/section-header";

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  actionHref,
  actionVariant = "secondary",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionVariant?: "primary" | "secondary";
}) {
  return (
    <PageCard className="border-dashed bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.12))] text-center">
      <SectionHeader
        title={title}
        titleLevel="h3"
        className="justify-center"
        titleClassName="text-center"
      />
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      {actionLabel && actionHref ? (
        <div className="mt-4">
          <Link
            href={actionHref}
            className={
              actionVariant === "primary"
                ? "inline-flex items-center justify-center rounded-xl border border-accent/90 bg-[linear-gradient(140deg,var(--accent),var(--accent-strong))] px-3 py-1.5 text-xs font-semibold text-accent-contrast shadow-[0_8px_20px_rgb(37_108_63_/_0.24)] hover:-translate-y-[1px]"
                : "inline-flex items-center justify-center rounded-xl border border-border-strong/45 bg-surface/90 px-3 py-1.5 text-xs font-semibold text-text-muted shadow-[0_6px_18px_rgb(70_74_34_/_0.12)] hover:-translate-y-[1px] hover:bg-surface-muted hover:text-foreground"
            }
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </PageCard>
  );
}
