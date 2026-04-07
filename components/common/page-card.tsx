import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export function PageCard({
  as: Component = "section",
  className,
  children,
  elevated = false,
  ...props
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  elevated?: boolean;
} & Omit<ComponentPropsWithoutRef<"section">, "as" | "children" | "className">) {
  return (
    <Component
      className={cn(
        "rounded-2xl p-4",
        elevated ? "app-panel-strong" : "app-panel",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
