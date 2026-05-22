"use client";

import { Bell, LogOut, Search, Settings, UserRound } from "lucide-react";
import type { AuthenticatedSession } from "@/infrastructure/auth/session";
import { Breadcrumbs } from "@/app/components/shell/Breadcrumbs";
import { logoutAction } from "@/app/actions/auth";

type TopbarProps = {
  user: AuthenticatedSession["user"];
};

export function Topbar({ user }: TopbarProps) {
  const displayName = user.name ?? user.email;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center gap-4 px-4 pl-16 lg:px-6 lg:pl-6">
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>

        <label className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 md:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Search</span>
          <input className="w-full bg-transparent outline-none placeholder:text-zinc-400" placeholder="Search seasons, dishes, contestants..." />
        </label>

        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        <div className="group relative">
          <button
            type="button"
            className="flex h-10 items-center gap-3 rounded-md border border-zinc-200 bg-white px-2 text-left transition hover:bg-zinc-50"
            aria-label="User menu"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-950 text-xs font-semibold text-white">{initials}</span>
            <span className="hidden min-w-0 md:block">
              <span className="block max-w-36 truncate text-sm font-medium text-zinc-950">{displayName}</span>
              <span className="block text-xs text-zinc-500">{user.role}</span>
            </span>
          </button>

          <div className="invisible absolute right-0 top-11 w-64 rounded-lg border border-zinc-200 bg-white p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="border-b border-zinc-100 px-3 py-2">
              <p className="truncate text-sm font-medium text-zinc-950">{displayName}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
            <a href="/settings" className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </a>
            <a href="/settings#profile" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Profile
            </a>
            <form action={logoutAction}>
              <button type="submit" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
