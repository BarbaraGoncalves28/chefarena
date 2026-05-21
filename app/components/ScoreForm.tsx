"use client";

// no client-side transition state required for the server action form
import { recordScoreAction } from "@/app/actions/score";

export function ScoreForm() {

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">Score submission</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Server action powered form for judges to submit weighted evaluations.
      </p>

      <form action={recordScoreAction} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Season ID</label>
          <input name="seasonId" className="rounded-xl border border-zinc-300 px-3 py-2" placeholder="Enter season UUID" required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Challenge ID</label>
          <input name="challengeId" className="rounded-xl border border-zinc-300 px-3 py-2" placeholder="Enter challenge UUID" required />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Contestant ID</label>
            <input name="contestantId" className="rounded-xl border border-zinc-300 px-3 py-2" placeholder="Contestant UUID" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Judge ID</label>
            <input name="judgeId" className="rounded-xl border border-zinc-300 px-3 py-2" placeholder="Judge UUID" required />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Score</label>
            <input name="value" type="number" min="0" max="100" className="rounded-xl border border-zinc-300 px-3 py-2" defaultValue={0} required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700">Category</label>
            <select name="category" className="rounded-xl border border-zinc-300 px-3 py-2">
              <option value="TASTE">Taste</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="TECHNIQUE">Technique</option>
              <option value="TEAMWORK">Teamwork</option>
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Comments</label>
          <textarea name="comments" className="min-h-[96px] rounded-2xl border border-zinc-300 px-3 py-2" placeholder="Optional scoring notes" />
        </div>
        <button className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800" type="submit">
          Submit score
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">Scores are recorded on the server action and emitted into the ranking pipeline.</p>
    </section>
  );
}
