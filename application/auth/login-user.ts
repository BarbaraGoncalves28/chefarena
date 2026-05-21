import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/infrastructure/auth/password-service";
import { createSession, createRefreshToken, buildAccessToken, logAuthActivity } from "@/infrastructure/auth/auth-service";
import { resolvePermissions } from "@/infrastructure/auth/permissions";
import { type LoginInput } from "@/domain/auth/dtos";

export async function loginUser(input: LoginInput, ipAddress?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const verified = await verifyPassword(input.password, user.password);
  if (!verified) {
    throw new Error("Invalid email or password.");
  }

  const role = user.role as "ADMIN" | "JUDGE" | "VIEWER";
  const permissions = resolvePermissions(role);

  const session = await createSession(user.id, ipAddress, userAgent);
  const refreshToken = await createRefreshToken(session.id, ipAddress);
  const accessToken = await buildAccessToken({
    userId: user.id,
    email: user.email,
    role,
    permissions,
  }, session.id);

  await logAuthActivity(user.id, "USER", "auth.login", {
    ipAddress,
    userAgent,
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
    refreshExpiresInSeconds: 30 * 24 * 60 * 60,
  };
}
