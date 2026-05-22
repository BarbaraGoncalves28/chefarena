import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/infrastructure/auth/jwt-service";
import { resolvePermissions } from "@/infrastructure/auth/permissions";
import type { AuthRole } from "@/domain/auth/roles";

export type AuthenticatedSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: AuthRole;
    permissions: string[];
  };
  sessionId: string;
};

const ACCESS_TOKEN_COOKIE = "cookoff_access_token";

export const getAuthenticatedSession = cache(async (): Promise<AuthenticatedSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = verifyAccessToken(token);
    const [user, activeSession] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: payload.sub,
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
        },
      }),
      prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      }),
    ]);

    if (!user || !activeSession) return null;

    const role = user.role as AuthRole;
    const rolePermissions = resolvePermissions(role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        permissions: Array.from(new Set([...rolePermissions, ...user.permissions])),
      },
      sessionId: activeSession.id,
    };
  } catch {
    return null;
  }
});

export async function requireAuthenticatedSession() {
  const session = await getAuthenticatedSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: AuthRole[]) {
  const session = await requireAuthenticatedSession();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}
