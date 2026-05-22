import { createJudgeTieBreakVoteAction, manualEliminationOverrideAction, runAutomaticEliminationAction } from "@/app/actions/eliminations";

type EliminationFormsProps = {
  seasonId: string;
  canAdminOverride: boolean;
  contestants: Array<{ contestant: { id: string; name: string; status: string } }>;
};

export function EliminationForms({ seasonId, canAdminOverride, contestants }: EliminationFormsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <form action={runAutomaticEliminationAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Automatic elimination</h2>
        <p className="text-sm text-zinc-500">Eliminates the lowest average score among contestants without immunity.</p>
        <input type="hidden" name="seasonId" value={seasonId} />
        <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Run automatic rule
        </button>
      </form>

      <form action={createJudgeTieBreakVoteAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Judge tie-break vote</h2>
        <input type="hidden" name="seasonId" value={seasonId} />
        <select name="contestantId" required className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Contestant</option>
          {contestants.map(({ contestant }) => (
            <option key={contestant.id} value={contestant.id}>
              {contestant.name} ({contestant.status})
            </option>
          ))}
        </select>
        <input name="judgeId" required className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Judge UUID" />
        <input name="value" type="number" min={1} max={10} defaultValue={1} className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" />
        <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
          Record vote
        </button>
      </form>

      {canAdminOverride ? (
        <form action={manualEliminationOverrideAction} className="space-y-3 rounded-lg border border-red-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Manual override</h2>
          <input type="hidden" name="seasonId" value={seasonId} />
          <select name="contestantId" required className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
            <option value="">Contestant</option>
            {contestants.map(({ contestant }) => (
              <option key={contestant.id} value={contestant.id}>
                {contestant.name} ({contestant.status})
              </option>
            ))}
          </select>
          <textarea name="reason" required minLength={8} className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950" placeholder="Override reason" />
          <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500">
            Override elimination
          </button>
        </form>
      ) : null}
    </div>
  );
}
