import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/shell/AppShell";
import { getNavigationForRole } from "@/application/shell/navigation";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await requireAuthenticatedSession();

  if (session.user.role !== "ADMIN" && session.user.role !== "JUDGE" && session.user.role !== "VIEWER") {
    redirect("/login");
  }

  const navigation = getNavigationForRole(session.user.role);

  return (
    <AppShell navigation={navigation} session={session}>
      {children}
    </AppShell>
  );
}
