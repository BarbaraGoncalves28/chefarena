"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/app/components/shell/Sidebar";
import { Topbar } from "@/app/components/shell/Topbar";

export function AppShell({ children, navigation, session }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="fixed inset-y-0 left-0 z-40">
        <Sidebar
          items={navigation}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      <div
        className={`transition-all duration-200 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[280px]"
        }`}
      >
        <Topbar user={session.user} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}