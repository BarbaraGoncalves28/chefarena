"use client";

// no client-side transition state required for the server action form
import { recordScoreAction } from "@/app/actions/score";

export function ScoreForm() {

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">Score submission</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Server action powered form for judges to submit weighted evaluations.
      </p>

      <form action={recordScoreAction} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Dish ID</label>
          <input name="dishId" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Dish UUID" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Judge ID</label>
          <input name="judgeId" className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Judge UUID" required />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Taste</label>
            <input name="taste" type="number" min="0" max="10" step="0.1" className="rounded-md border border-zinc-300 px-3 py-2" defaultValue={8} required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Presentation</label>
            <input name="presentation" type="number" min="0" max="10" step="0.1" className="rounded-md border border-zinc-300 px-3 py-2" defaultValue={8} required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Creativity</label>
            <input name="creativity" type="number" min="0" max="10" step="0.1" className="rounded-md border border-zinc-300 px-3 py-2" defaultValue={8} required />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Comments</label>
          <textarea name="comments" className="min-h-[96px] rounded-md border border-zinc-300 px-3 py-2" placeholder="Optional scoring notes" />
        </div>
        <button className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800" type="submit">
          Submit final score
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">Final score = taste * 0.5 + presentation * 0.3 + creativity * 0.2.</p>
    </section>
  );
}
