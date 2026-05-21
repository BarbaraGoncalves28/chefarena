import { cookies } from "next/headers";
import { verifyAccessToken, type AuthJwtPayload } from "@/infrastructure/auth/jwt-service";

export async function getCurrentUser(): Promise<AuthJwtPayload | null> {
  const allCookies = await cookies();
  const token = allCookies.get("cookoff_access_token")?.value;
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
