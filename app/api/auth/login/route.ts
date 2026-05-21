import { NextResponse } from "next/server";
import { loginSchema } from "@/domain/auth/dtos";
import { loginUser } from "@/application/auth/login-user";
import { attachAuthCookies } from "@/infrastructure/auth/cookie-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const parseResult = loginSchema.safeParse(payload);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 422 });
  }

  try {
    const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const authResult = await loginUser(parseResult.data, clientIp, userAgent);

    const response = NextResponse.json({ user: authResult.user }, { status: 200 });
    attachAuthCookies(response, authResult.accessToken, authResult.refreshToken, authResult.refreshExpiresInSeconds);
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
