"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { TextField } from "@/app/components/ui/TextField";
import { PasswordStrengthMeter } from "@/app/components/ui/PasswordStrengthMeter";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(value: string) {
  const errors: string[] = [];
  if (value.length < 8) {
    errors.push("At least 8 characters");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("One uppercase letter");
  }
  if (!/[a-z]/.test(value)) {
    errors.push("One lowercase letter");
  }
  if (!/[0-9]/.test(value)) {
    errors.push("One number");
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push("One special character");
  }
  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params?.get("redirect") ?? "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordErrors = useMemo(() => validatePassword(password), [password]);

  function validateForm() {
    const validationErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      validationErrors.name = "Enter your full name.";
    }

    if (!emailPattern.test(email)) {
      validationErrors.email = "Use a valid work email address.";
    }

    if (passwordErrors.length > 0) {
      validationErrors.password = "Create a stronger password using the checklist below.";
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);

    const payload = await response.json();
    if (!response.ok) {
      setFormError(payload.error || "Unable to create your account. Please try again.");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center gap-10 lg:flex-row lg:items-center">
        <section className="space-y-6 lg:w-1/2">
          <span className="inline-flex rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-950">
            Secure registration
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create your CookOff Arena account with confidence.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-400">
              Register securely and join the competition management platform for judges, admins, and viewers. Your account is protected by modern password controls and enterprise-grade validation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300 shadow-xl shadow-slate-950/10">
              <h2 className="font-semibold text-white">Enterprise-ready</h2>
              <p className="mt-3 leading-7">Strong form validation, password guidance, and accessibility built for high-trust environments.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300 shadow-xl shadow-slate-950/10">
              <h2 className="font-semibold text-white">Mobile responsive</h2>
              <p className="mt-3 leading-7">The experience adapts cleanly across desktop, tablet, and phone screens.</p>
            </div>
          </div>
        </section>

        <section className="lg:w-1/2">
          <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-10">
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Register</p>
              <h2 className="text-3xl font-semibold text-white">Secure your account</h2>
              <p className="text-sm leading-6 text-slate-400">
                Complete the form with your full name, email, and a strong password to begin using the platform.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Full name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jamie Oliver"
                error={errors.name}
                required
              />

              <TextField
                label="Work email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@cookoffarena.com"
                autoComplete="email"
                error={errors.email}
                required
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a secure password"
                autoComplete="new-password"
                error={errors.password}
                required
              />

              <PasswordStrengthMeter password={password} />

              <TextField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                required
              />

              {formError ? (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {formError}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} variant="primary">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already registered?{' '}
              <Link href="/login" className="font-semibold text-white hover:text-amber-400">
                Sign in instead
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
