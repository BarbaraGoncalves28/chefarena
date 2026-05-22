"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutUser } from "@/application/auth/logout-user";

const ACCESS_TOKEN_COOKIE = "cookoff_access_token";
const REFRESH_TOKEN_COOKIE = "cookoff_refresh_token";

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  await logoutUser(refreshToken);

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  redirect("/login");
}
