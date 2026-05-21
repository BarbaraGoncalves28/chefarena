import { redirect } from "next/navigation";

export async function logoutAction() {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  redirect("/login");
}
