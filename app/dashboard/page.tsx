import { redirect } from "next/navigation";
import { getCurrentUser } from "@/infrastructure/auth/get-current-user";
import { logoutAction } from "@/app/actions/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">CookOff Arena</p>
            <h1 className="mt-4 text-4xl font-semibold">Welcome back, {user.email}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              You are signed in as <span className="font-semibold text-white">{user.role}</span>. Your session is protected by JWT, secure cookies, and refresh token rotation.
            </p>
          </div>
          <form action={logoutAction} className="mt-4 sm:mt-0">
            <button
              type="submit"
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <h2 className="text-xl font-semibold">Session details</h2>
            <dl className="mt-5 grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <dt className="font-medium text-slate-200">User ID</dt>
                <dd className="mt-1 break-all">{user.sub}</dd>
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-4">
                <dt className="font-medium text-slate-200">Role</dt>
                <dd className="mt-1">{user.role}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <h2 className="text-xl font-semibold">Security posture</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>• JWT access tokens stored in HTTP-only cookies</li>
              <li>• Refresh token rotation for session persistence</li>
              <li>• Role-based authorization for admin and judge workflows</li>
              <li>• Server-side route protection with Next.js middleware</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
