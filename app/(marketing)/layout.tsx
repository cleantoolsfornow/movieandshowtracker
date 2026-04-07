import type { ReactNode } from "react";

import { MarketingLayout } from "@/components/marketing/marketing-layout";

export default function PublicMarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
