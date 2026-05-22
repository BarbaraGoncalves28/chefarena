import type { ReactNode } from "react";
import { Sidebar } from "@/app/components/shell/Sidebar";
import { Topbar } from "@/app/components/shell/Topbar";
import type { NavigationItem } from "@/application/shell/navigation";
import type { AuthenticatedSession } from "@/infrastructure/auth/session";

type AppShellProps = {
  children: ReactNode;
  navigation: NavigationItem[];
  session: AuthenticatedSession;
};

export function AppShell({ children, navigation, session }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="fixed inset-y-0 left-0 z-40">
        <Sidebar items={navigation} />
      </div>
      <div className="lg:pl-[280px]">
        <Topbar user={session.user} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
