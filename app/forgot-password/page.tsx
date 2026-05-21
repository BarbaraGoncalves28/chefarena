import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-xl rounded-4xl border border-white/10 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Password recovery</p>
          <h1 className="text-3xl font-semibold text-white">Reset your login details</h1>
          <p className="text-sm leading-7 text-slate-400">
            Submit your registered email and we will send a secure reset link so you can regain access.
          </p>
        </div>

        <form className="space-y-6">
          <label className="block text-sm text-slate-200">
            <span className="mb-2 block font-medium">Email address</span>
            <input
              type="email"
              className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400"
              placeholder="you@example.com"
              required
            />
          </label>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Send reset instructions
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Remembered your password?{' '}
          <Link href="/login" className="font-semibold text-white hover:text-amber-400">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
