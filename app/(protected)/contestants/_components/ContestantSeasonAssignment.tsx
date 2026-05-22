import { assignContestantToSeasonAction } from "@/app/actions/contestants";

type ContestantSeasonAssignmentProps = {
  contestantId: string;
  seasons: Array<{ id: string; name: string; lifecycleStatus: string }>;
};

export function ContestantSeasonAssignment({ contestantId, seasons }: ContestantSeasonAssignmentProps) {
  const assignableSeasons = seasons.filter((season) => season.lifecycleStatus !== "FINISHED");

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Assign to season</h2>
      <p className="mt-1 text-sm text-zinc-500">Contestants can participate in multiple seasons. Performance and elimination stay scoped to each season.</p>

      <form action={assignContestantToSeasonAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_120px_auto]">
        <input type="hidden" name="contestantId" value={contestantId} />
        <select name="seasonId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Select season</option>
          {assignableSeasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} ({season.lifecycleStatus})
            </option>
          ))}
        </select>
        <input name="initialSeed" type="number" min={1} max={999} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950" placeholder="Seed" />
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Assign
        </button>
      </form>
    </section>
  );
}
