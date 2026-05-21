"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { TextField } from "@/app/components/ui/TextField";
import { Checkbox } from "@/app/components/ui/Checkbox";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") ?? "/seasons";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    setLoading(false);
    const body = await response.json();

    if (!response.ok) {
      setError(body.error || "Unable to sign in. Please check your credentials.");
      return;
    }

    router.push(redirectTo);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:gap-14">
        <section className="mb-10 w-full max-w-2xl space-y-6 lg:mb-0 lg:flex-1">
          <span className="inline-flex rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-950">
            Enterprise access
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Secure login for your CookOff Arena team.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Access the competition dashboard with enterprise-grade authentication, secure sessions, and role-based access for admins, judges, and viewers.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Fast access</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Sign in quickly with email and password to manage scores, view rankings, and monitor live competition status.
              </p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Built for teams</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Separate access levels keep judges, admins, and viewers in the right workflows with secure role protection.
              </p>
            </article>
          </div>
        </section>

        <section className="w-full max-w-lg lg:flex-1">
          <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Sign in</p>
              <h2 className="text-3xl font-semibold text-white">Welcome back, chef.</h2>
              <p className="text-sm leading-6 text-slate-400">
                Enter your workspace credentials to continue to the competition operations center.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <Link href="/forgot-password" className="text-sm font-medium text-amber-400 transition hover:text-amber-300">
                  Forgot password?
                </Link>
              </div>

              {error ? <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Signing in…" : "Continue to dashboard"}
              </Button>
            </form>

            <div className="mt-8 border-t border-slate-700/60 pt-6 text-center text-sm text-slate-500">
              New to CookOff Arena?{' '}
              <Link href="/register" className="font-semibold text-white hover:text-amber-400">
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
