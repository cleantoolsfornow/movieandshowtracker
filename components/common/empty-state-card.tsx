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
    <PageCard className="border-dashed text-center">
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
                ? "inline-flex items-center justify-center rounded-xl border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-contrast hover:border-accent-strong hover:bg-accent-strong"
                : "inline-flex items-center justify-center rounded-xl border border-border-strong/45 bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-foreground"
            }
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </PageCard>
  );
}
