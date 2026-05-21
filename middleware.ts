import type { NextRequest } from "next/server";
import { authMiddleware } from "./infrastructure/auth/auth-middleware";

export async function middleware(request: NextRequest) {
  return authMiddleware(request);
}

export const config = {
  matcher: ["/dashboard", "/admin/:path*", "/api/private/:path*", "/management/:path*"],
};
