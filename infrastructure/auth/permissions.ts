import { rolePermissions } from "@/domain/auth/roles";
import { AuthJwtPayload } from "@/infrastructure/auth/jwt-service";

export function hasPermission(auth: AuthJwtPayload, requiredPermissions: string[]) {
  const permissions = auth.permissions ?? resolvePermissions(auth.role);

  if (permissions.includes("*")) {
    return true;
  }

  return requiredPermissions.every((permission) => permissions.includes(permission));
}

export function resolvePermissions(role: string) {
  return rolePermissions[role as keyof typeof rolePermissions] ?? [];
}
