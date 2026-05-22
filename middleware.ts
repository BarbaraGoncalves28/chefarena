import type { NextRequest } from "next/server";
import { authMiddleware } from "./infrastructure/auth/auth-middleware";

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seasons/:path*",
    "/episodes/:path*",
    "/challenges/:path*",
    "/dishes/:path*",
    "/contestants/:path*",
    "/judges/:path*",
    "/rankings/:path*",
    "/eliminations/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/api/private/:path*",
    "/management/:path*",
  ],
};
