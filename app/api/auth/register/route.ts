import { NextResponse } from "next/server";
import { registerSchema } from "@/domain/auth/dtos";
import { registerUser } from "@/application/auth/register-user";
import { attachAuthCookies } from "@/infrastructure/auth/cookie-service";

export async function POST(request: Request) {
  const payload = await request.json();
  const parseResult = registerSchema.safeParse(payload);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 422 });
  }

  try {
    const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const authResult = await registerUser(parseResult.data, clientIp, userAgent);

    const response = NextResponse.json({ user: authResult.user }, { status: 201 });
    attachAuthCookies(response, authResult.accessToken, authResult.refreshToken, authResult.refreshExpiresInSeconds);
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
