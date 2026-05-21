import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/infrastructure/auth/password-service";
import { createSession, createRefreshToken, buildAccessToken, logAuthActivity } from "@/infrastructure/auth/auth-service";
import { resolvePermissions } from "@/infrastructure/auth/permissions";
import { type RegisterInput } from "@/domain/auth/dtos";

export async function registerUser(input: RegisterInput, ipAddress?: string, userAgent?: string) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await hashPassword(input.password);
  const role = input.role ?? "VIEWER";
  const permissions = resolvePermissions(role);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role,
      permissions,
      password: hashedPassword,
    },
  });

  const authRole = (user.role === "ADMIN" || user.role === "JUDGE" || user.role === "VIEWER")
    ? user.role
    : "VIEWER";

  const session = await createSession(user.id, ipAddress, userAgent);
  const refreshToken = await createRefreshToken(session.id, ipAddress);
  const accessToken = await buildAccessToken({
    userId: user.id,
    email: user.email,
    role: authRole,
    permissions,
  }, session.id);

  await logAuthActivity(user.id, "USER", "auth.register", {
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
