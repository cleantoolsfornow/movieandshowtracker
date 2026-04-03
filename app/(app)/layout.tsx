import { HouseholdGuard } from "@/components/auth/household-guard";
import { HouseholdProvider } from "@/components/household/household-context";
import { AppShell } from "@/components/layout/app-shell";

export default function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <HouseholdGuard>
      <HouseholdProvider>
        <AppShell>{children}</AppShell>
      </HouseholdProvider>
    </HouseholdGuard>
  );
}
