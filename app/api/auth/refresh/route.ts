import { NextResponse } from "next/server";
import { refreshSession } from "@/application/auth/refresh-session";
import { getRefreshTokenCookieValue, attachAuthCookies } from "@/infrastructure/auth/cookie-service";

export async function POST(request: Request) {
  const refreshToken = getRefreshTokenCookieValue(request) ?? null;
  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
  }

  try {
    const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? undefined;
    const refreshResult = await refreshSession(refreshToken, clientIp);

    const response = NextResponse.json({ status: "ok" }, { status: 200 });
    attachAuthCookies(response, refreshResult.accessToken, refreshResult.refreshToken, refreshResult.refreshExpiresInSeconds);
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
