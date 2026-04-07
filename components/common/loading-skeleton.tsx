import { cn } from "@/lib/ui/cn";

export function LoadingSkeleton({
  className = "h-8",
  rounded = "md",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-muted",
        rounded === "sm" && "rounded-sm",
        rounded === "md" && "rounded-md",
        rounded === "lg" && "rounded-lg",
        rounded === "xl" && "rounded-xl",
        rounded === "full" && "rounded-full",
        className,
      )}
    >
      <div className="absolute inset-0 animate-[skeleton-shimmer_1.15s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.55)_45%,transparent_100%)]" />
    </div>
  );
}
