import { prisma } from "@/lib/prisma";
import { hashToken, createRawRefreshToken } from "@/infrastructure/auth/token-service";
import { buildAccessToken, logAuthActivity } from "@/infrastructure/auth/auth-service";
import { resolvePermissions } from "@/infrastructure/auth/permissions";

const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

export async function refreshSession(refreshToken: string, ipAddress?: string) {
  const tokenHash = hashToken(refreshToken);

  const existingToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
      session: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    },
    include: {
      session: { include: { user: true } },
    },
  });

  if (!existingToken) {
    throw new Error("Refresh token is invalid or expired.");
  }

  const newRefreshToken = createRawRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);

  const rotated = await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: {
        revokedAt: new Date(),
      },
    }),
    prisma.refreshToken.create({
      data: {
        sessionId: existingToken.sessionId,
        tokenHash: newTokenHash,
        createdByIp: ipAddress,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const user = existingToken.session.user;
  const role = user.role as "ADMIN" | "JUDGE" | "VIEWER";
  const permissions = resolvePermissions(role);
  const accessToken = await buildAccessToken(
    {
      userId: user.id,
      email: user.email,
      role,
      permissions,
    },
    existingToken.sessionId,
  );

  await logAuthActivity(user.id, "USER", "auth.refresh", {
    ipAddress,
    rotatedRefreshToken: rotated[1].id,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    refreshExpiresInSeconds: REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60,
  };
}
