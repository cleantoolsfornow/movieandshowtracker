import { HouseholdGuard } from "@/components/auth/household-guard";

export default function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <HouseholdGuard>{children}</HouseholdGuard>;
}
