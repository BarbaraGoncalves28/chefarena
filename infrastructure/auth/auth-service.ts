import { prisma } from "@/lib/prisma";
import type { ActorType, Prisma } from "@prisma/client";
import { createRawRefreshToken, hashToken } from "@/infrastructure/auth/token-service";
import { signAccessToken } from "@/infrastructure/auth/jwt-service";
import { createActivityLog } from "@/infrastructure/auth/activity-log-service";
import { AuthRole } from "@/domain/auth/roles";

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export type AuthPayload = {
  userId: string;
  email: string;
  role: AuthRole;
  permissions: string[];
};

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  return prisma.session.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    },
  });
}

export async function createRefreshToken(sessionId: string, ipAddress?: string) {
  const rawToken = createRawRefreshToken();
  const tokenHash = hashToken(rawToken);

  await prisma.refreshToken.create({
    data: {
      sessionId,
      tokenHash,
      createdByIp: ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return rawToken;
}

export async function buildAccessToken(payload: AuthPayload, sessionId: string) {
  return signAccessToken({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions,
    sessionId,
  });
}

export async function revokeSession(sessionId: string) {
  await prisma.session.updateMany({
    where: { id: sessionId, isActive: true },
    data: { isActive: false },
  });
}

export async function revokeRefreshToken(tokenHash: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logAuthActivity(userId: string | null, actorType: ActorType, action: string, details?: Prisma.InputJsonValue | null) {
  await createActivityLog({
    userId,
    actorType,
    action,
    details,
  });
}
