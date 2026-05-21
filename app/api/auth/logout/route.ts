import { NextResponse } from "next/server";
import { logoutUser } from "@/application/auth/logout-user";
import { getRefreshTokenCookieValue, clearAuthCookies } from "@/infrastructure/auth/cookie-service";

export async function POST(request: Request) {
  const refreshToken = getRefreshTokenCookieValue(request) ?? null;
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? undefined;

  await logoutUser(refreshToken, clientIp);
  const response = NextResponse.json({ status: "logged_out" }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
