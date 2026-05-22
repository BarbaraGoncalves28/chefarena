import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, type AuthJwtPayload } from "@/infrastructure/auth/jwt-edge";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/favicon.ico"];

const routeAuthorizationRules: Array<{
  matcher: RegExp;
  allowedRoles: AuthJwtPayload["role"][];
}> = [
  { matcher: /^\/dashboard(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/seasons(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/episodes(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/challenges(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/dishes(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/contestants(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/judges(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/rankings(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/eliminations(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE"] },
  { matcher: /^\/admin(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE"] },
  { matcher: /^\/settings(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/api\/private(?:\/.*)?$/, allowedRoles: ["ADMIN", "JUDGE", "VIEWER"] },
  { matcher: /^\/management(?:\/.*)?$/, allowedRoles: ["ADMIN"] },
];

function extractAccessToken(request: NextRequest) {
  return request.cookies.get("cookoff_access_token")?.value;
}

function getRouteRoles(pathname: string) {
  return routeAuthorizationRules.find((rule) => rule.matcher.test(pathname));
}

function unauthorizedResponse(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

function forbiddenResponse() {
  return new Response("Forbidden", { status: 403 });
}

function attachAuthHeaders(request: NextRequest, payload: AuthJwtPayload) {
  const headers = new Headers(request.headers);
  headers.set("x-auth-user-id", payload.sub);
  headers.set("x-auth-user-email", payload.email);
  headers.set("x-auth-user-role", payload.role);

  return NextResponse.next({ request: { headers } });
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const routeRule = getRouteRoles(pathname);
  if (!routeRule) {
    return NextResponse.next();
  }

  const token = extractAccessToken(request);
  if (!token) {
    return unauthorizedResponse(request);
  }

  let payload: AuthJwtPayload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return unauthorizedResponse(request);
  }

  if (!routeRule.allowedRoles.includes(payload.role)) {
    return forbiddenResponse();
  }

  return attachAuthHeaders(request, payload);
}
