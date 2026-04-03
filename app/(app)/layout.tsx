import { HouseholdGuard } from "@/components/auth/household-guard";
import { AppShell } from "@/components/layout/app-shell";

export default function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <HouseholdGuard>
      <AppShell>{children}</AppShell>
    </HouseholdGuard>
  );
}
