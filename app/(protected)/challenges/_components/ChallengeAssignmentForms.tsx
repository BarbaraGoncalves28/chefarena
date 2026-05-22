import { assignChallengeContestantAction, assignChallengeTeamsAction } from "@/app/actions/challenges";

type ChallengeAssignmentFormsProps = {
  challengeId: string;
  locked: boolean;
  teamChallenge: boolean;
  contestants: Array<{ contestant: { id: string; name: string; status: string } }>;
  teams: Array<{ id: string; name: string; description: string | null }>;
};

export function ChallengeAssignmentForms({ challengeId, locked, teamChallenge, contestants, teams }: ChallengeAssignmentFormsProps) {
  if (locked) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Assignments are locked for this challenge phase.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={assignChallengeContestantAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Assign contestant</h2>
        <select name="contestantId" required className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
          <option value="">Select contestant</option>
          {contestants.map(({ contestant }) => (
            <option key={contestant.id} value={contestant.id}>
              {contestant.name} ({contestant.status})
            </option>
          ))}
        </select>
        <input type="hidden" name="challengeId" value={challengeId} />
        <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
          Assign contestant
        </button>
      </form>

      {teamChallenge ? (
        <form action={assignChallengeTeamsAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Assign teams</h2>
          <select name="teamIds" multiple required className="min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950">
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="challengeId" value={challengeId} />
          <button type="submit" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Assign teams
          </button>
        </form>
      ) : null}
    </div>
  );
}
