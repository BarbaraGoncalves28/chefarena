import { assignContestantAction, assignJudgesAction, initializeSeasonStructureAction } from "@/app/actions/seasons";

type SeasonAdminPanelProps = {
  seasonId: string;
  locked: boolean;
  contestants: Array<{ id: string; name: string; status: string }>;
  judges: Array<{ id: string; name: string; expertise: string | null }>;
};

export function SeasonAdminPanel({ seasonId, locked, contestants, judges }: SeasonAdminPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Admin setup</h2>
        <p className="mt-1 text-sm text-zinc-500">Contestants are persisted on the season roster. Judge assignment is recorded as a season event until a dedicated SeasonJudge table is introduced.</p>
      </div>

      {locked ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This season is finished. Setup actions are locked.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <form action={assignContestantAction} className="space-y-3 rounded-md border border-zinc-200 p-4">
            <input type="hidden" name="seasonId" value={seasonId} />
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Assign contestant
              <select name="contestantId" required className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950">
                <option value="">Select contestant</option>
                {contestants.map((contestant) => (
                  <option key={contestant.id} value={contestant.id}>
                    {contestant.name} ({contestant.status})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              Add to roster
            </button>
          </form>

          <form action={assignJudgesAction} className="space-y-3 rounded-md border border-zinc-200 p-4">
            <input type="hidden" name="seasonId" value={seasonId} />
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Assign judges
              <select name="judgeIds" multiple required className="min-h-28 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950">
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.name} {judge.expertise ? `- ${judge.expertise}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              Record assignment
            </button>
          </form>

          <form action={initializeSeasonStructureAction} className="space-y-3 rounded-md border border-zinc-200 p-4">
            <input type="hidden" name="seasonId" value={seasonId} />
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Episodes
                <input name="episodeCount" type="number" min={1} max={30} defaultValue={12} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Challenges
                <input name="challengesPerEpisode" type="number" min={1} max={6} defaultValue={2} className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950" />
              </label>
            </div>
            <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              Initialize structure
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
