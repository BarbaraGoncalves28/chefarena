"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart3, Ban, Bell, CalendarDays, ChefHat, ChevronDown, ClipboardList, Gavel, LayoutDashboard, Menu, PanelLeftClose, Settings, ShieldCheck, Soup, Trophy, Users, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import type { NavigationIconName, NavigationItem } from "@/application/shell/navigation";

type SidebarProps = {
  items: NavigationItem[];
  collapsed: boolean;
  setCollapsed: (value: boolean | ((v: boolean) => boolean)) => void;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const icons: Record<NavigationIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  seasons: CalendarDays,
  episodes: ClipboardList,
  challenges: ChefHat,
  dishes: Soup,
  contestants: Users,
  judges: Gavel,
  rankings: Trophy,
  eliminations: Ban,
  scoring: BarChart3,
  admin: ShieldCheck,
  notifications: Bell,
  settings: Settings,
};

export function Sidebar({ items, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <aside
      className={`flex h-full flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-4">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-50">
          <Image src="/image/logo.png" alt="Chef Arena" width={50} height={50} className="block h-full w-full object-cover" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950">Chef Arena</p>
    
          </div>
        )}
        <button
  type="button"
  onClick={() => setCollapsed((value) => !value)}
  className="ml-auto hidden lg:flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-950 hover:shadow-md active:scale-95"
  aria-label="Toggle sidebar"
>
  {collapsed ? (
    <ChevronRight className="h-5 w-5" />
  ) : (
    <ChevronLeft className="mr-0.5 h-5 w-5" />
  )}
</button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href) || item.children?.some((child) => isActive(pathname, child.href));
          const Icon = icons[item.icon];

          return (
            <div key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  active ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.children?.length ? (
                  <ChevronDown className="ml-auto h-4 w-4 text-current/60" aria-hidden="true" />
                ) : null}
              </Link>

              {!collapsed && item.children?.length ? (
                <div className="mt-1 space-y-1 pl-7">
                  {item.children.map((child) => {
                    const ChildIcon = icons[child.icon];
                    const childActive = isActive(pathname, child.href);

                    return (
                      <Link
                        key={`${child.label}-${child.href}`}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm transition ${
                          childActive ? "bg-amber-50 text-amber-700" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                        }`}
                      >
                        <ChildIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="hidden lg:block">{content}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-zinc-950/50" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
