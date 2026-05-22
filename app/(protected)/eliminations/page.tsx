import { PageHeader } from "@/app/components/shell/PageHeader";
import { EliminationForms } from "@/app/(protected)/eliminations/_components/EliminationForms";
import { EliminationUseCases } from "@/application/eliminations/elimination-use-cases";
import { requireRole } from "@/infrastructure/auth/session";

export default async function EliminationsPage({
  searchParams,
}: {
  searchParams: Promise<{ seasonId?: string }>;
}) {
  const session = await requireRole(["ADMIN", "JUDGE"]);
  const params = await searchParams;
  const seasons = await EliminationUseCases.listSeasons();
  const seasonId = params.seasonId ?? seasons[0]?.id;

  if (!seasonId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Eliminations" description="Automatic rules, manual override, tie-break votes, and elimination history." />
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No season exists yet.</div>
      </div>
    );
  }

  const [preview, history, contestants] = await Promise.all([
    EliminationUseCases.previewAutomatic(seasonId),
    EliminationUseCases.listHistory(seasonId),
    EliminationUseCases.listSeasonContestants(seasonId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Eliminations" description="Automatic elimination removes the lowest average score, blocks immune contestants, and resolves ties with judge votes." />

      <form className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm font-medium text-zinc-700 md:max-w-sm">
          Season
          <select name="seasonId" defaultValue={seasonId} className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-950">
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} ({season.status})
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Eligible", preview.candidates.filter((candidate) => !candidate.immunity && !candidate.alreadyEliminated).length],
          ["Immune", preview.candidates.filter((candidate) => candidate.immunity).length],
          ["Eliminated", preview.candidates.filter((candidate) => candidate.alreadyEliminated).length],
          ["Next out", preview.decision ? preview.candidates.find((candidate) => candidate.contestantId === preview.decision?.contestantId)?.name ?? "None" : "None"],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
          </section>
        ))}
      </div>

      <EliminationForms seasonId={seasonId} canAdminOverride={session.user.role === "ADMIN"} contestants={contestants} />

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Candidate preview</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2">Contestant</th>
                <th className="border-b border-zinc-200 px-3 py-2">Avg score</th>
                <th className="border-b border-zinc-200 px-3 py-2">Scores</th>
                <th className="border-b border-zinc-200 px-3 py-2">Judge votes</th>
                <th className="border-b border-zinc-200 px-3 py-2">Immunity</th>
                <th className="border-b border-zinc-200 px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.candidates.map((candidate) => (
                <tr key={candidate.contestantId} className="odd:bg-zinc-50">
                  <td className="border-b border-zinc-100 px-3 py-3 font-medium text-zinc-950">{candidate.name}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{candidate.averageScore}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{candidate.scoreCount}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{candidate.judgeVoteCount}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{candidate.immunity ? "Yes" : "No"}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{candidate.alreadyEliminated ? "Eliminated" : "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Elimination history</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {history.map((entry) => (
            <div key={entry.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">{entry.contestant.name}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {entry.reason}
                  {entry.episode ? ` · Episode ${entry.episode.sequence}: ${entry.episode.title}` : ""}
                </p>
              </div>
              <span className="text-sm text-zinc-500">{entry.eliminatedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {history.length === 0 ? <div className="py-4 text-sm text-zinc-500">No eliminations recorded.</div> : null}
        </div>
      </section>
    </div>
  );
}
