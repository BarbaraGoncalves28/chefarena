import { assignJudgeToSeasonAction } from "@/app/actions/judges";

type JudgeAssignmentFormProps = {
  judgeId: string;
  seasons: Array<{ id: string; name: string; lifecycleStatus: string }>;
};

export function JudgeAssignmentForm({ judgeId, seasons }: JudgeAssignmentFormProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Season assignment</h2>
      <p className="mt-1 text-sm text-zinc-500">Assignments are recorded as season events and enforced before score submission.</p>

      <form action={assignJudgeToSeasonAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <input type="hidden" name="judgeId" value={judgeId} />
        <select name="seasonId" required className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Select season</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} ({season.lifecycleStatus})
            </option>
          ))}
        </select>
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Assign
        </button>
      </form>
    </section>
  );
}
