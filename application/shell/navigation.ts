import type { AuthRole } from "@/domain/auth/roles";

export type NavigationIconName = "dashboard" | "seasons" | "episodes" | "challenges" | "dishes" | "contestants" | "judges" | "rankings" | "eliminations" | "scoring" | "admin" | "notifications" | "settings";

export type NavigationItem = {
  label: string;
  href: string;
  icon: NavigationIconName;
  roles: AuthRole[];
  children?: NavigationItem[];
};

const allRoles: AuthRole[] = ["ADMIN", "JUDGE", "VIEWER"];
const operatorRoles: AuthRole[] = ["ADMIN", "JUDGE"];
export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    roles: allRoles,
  },
  {
    label: "Seasons",
    href: "/seasons",
    icon: "seasons",
    roles: allRoles,
    children: [
      { label: "Episodes", href: "/episodes", icon: "episodes", roles: allRoles },
      { label: "Challenges", href: "/challenges", icon: "challenges", roles: allRoles },
    ],
  },
  {
    label: "Contestants",
    href: "/contestants",
    icon: "contestants",
    roles: allRoles,
  },
  {
    label: "Dishes",
    href: "/dishes",
    icon: "dishes",
    roles: allRoles,
  },
  {
    label: "Judges",
    href: "/judges",
    icon: "judges",
    roles: allRoles,
  },
  {
    label: "Rankings",
    href: "/rankings",
    icon: "rankings",
    roles: allRoles,
  },
  {
    label: "Eliminations",
    href: "/eliminations",
    icon: "eliminations",
    roles: operatorRoles,
  },
  {
    label: "Scoring",
    href: "/admin",
    icon: "scoring",
    roles: ["JUDGE"],
  },
  {
    label: "Admin panel",
    href: "/admin",
    icon: "admin",
    roles: ["ADMIN"],
  },
  {
    label: "Notifications",
    href: "/settings#notifications",
    icon: "notifications",
    roles: allRoles,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
    roles: allRoles,
  },
];

export function getNavigationForRole(role: AuthRole) {
  return navigationItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
}

export function canAccessRoute(pathname: string, role: AuthRole) {
  if (role === "ADMIN") return true;
  if (pathname.startsWith("/admin")) return role === "JUDGE";
  return navigationItems.some((item) => {
    if (!item.roles.includes(role)) return false;
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
    return item.children?.some((child) => child.roles.includes(role) && (pathname === child.href || pathname.startsWith(`${child.href}/`)));
  });
}
