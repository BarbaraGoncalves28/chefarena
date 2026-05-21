import { rolePermissions } from "@/domain/auth/roles";
import { AuthJwtPayload } from "@/infrastructure/auth/jwt-service";

export function hasPermission(auth: AuthJwtPayload, requiredPermissions: string[]) {
  if (auth.permissions.includes("*")) {
    return true;
  }

  return requiredPermissions.every((permission) => auth.permissions.includes(permission));
}

export function resolvePermissions(role: string) {
  return rolePermissions[role as keyof typeof rolePermissions] ?? [];
}
