"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function humanize(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-zinc-500">
      <Link href="/dashboard" className="shrink-0 transition hover:text-zinc-900">
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex min-w-0 items-center gap-1">
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-300" />
            {isLast ? (
              <span className="truncate font-medium text-zinc-900">{humanize(segment)}</span>
            ) : (
              <Link href={href} className="truncate transition hover:text-zinc-900">
                {humanize(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
