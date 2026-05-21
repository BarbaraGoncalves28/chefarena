import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "cookoff_access_token";
const REFRESH_TOKEN_COOKIE = "cookoff_refresh_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function attachAuthCookies(response: NextResponse, accessToken: string, refreshToken: string, refreshExpiresInSeconds: number) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: refreshExpiresInSeconds,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

export function getAccessTokenCookieValue(request: Request | { cookies: { get(name: string): { value: string } | undefined } }) {
  if ("cookies" in request) {
    return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  }
  return undefined;
}

export function getRefreshTokenCookieValue(request: Request | { cookies: { get(name: string): { value: string } | undefined } }) {
  if ("cookies" in request) {
    return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  }
  return undefined;
}
