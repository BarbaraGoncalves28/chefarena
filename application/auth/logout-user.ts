import { prisma } from "@/lib/prisma";
import { hashToken } from "@/infrastructure/auth/token-service";
import { revokeSession, logAuthActivity } from "@/infrastructure/auth/auth-service";

export async function logoutUser(refreshToken: string | null, ipAddress?: string) {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { session: true },
  });

  if (!storedToken) {
    return;
  }

  await Promise.all([
    prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } }),
    revokeSession(storedToken.sessionId),
    logAuthActivity(storedToken.session.userId, "USER", "auth.logout", { ipAddress }),
  ]);
}
