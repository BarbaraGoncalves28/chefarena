import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ContestantSeasonAssignment } from "@/app/(protected)/contestants/_components/ContestantSeasonAssignment";
import { ContestantUseCases } from "@/application/contestants/contestant-use-cases";
import { getContestantStatusTone } from "@/domain/contestants/contestant-status";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function ContestantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, contestant, seasons] = await Promise.all([
    requireAuthenticatedSession(),
    ContestantUseCases.getContestantProfile(id),
    ContestantUseCases.listSeasonFilters(),
  ]);

  if (!contestant) notFound();

  const canManage = session.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <PageHeader
        title={contestant.name}
        description={contestant.bio ?? "No biography provided."}
        actions={
          canManage ? (
            <Link href={`/contestants/${contestant.id}/edit`} className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
              Edit profile
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Status", contestant.status],
          ["Seasons", contestant.performance.seasonsCount],
          ["Wins", contestant.performance.wins],
          ["Losses", contestant.performance.losses],
          ["Avg score", contestant.performance.averageScore],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            {label === "Status" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getContestantStatusTone(contestant.status)}`}>{value}</span>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
            )}
          </section>
        ))}
      </div>

      {canManage ? <ContestantSeasonAssignment contestantId={contestant.id} seasons={seasons} /> : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Seasons participated</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {contestant.seasons.map((entry) => (
            <Link key={entry.season.id} href={`/seasons/${entry.season.id}`} className="rounded-md border border-zinc-200 p-4 transition hover:bg-zinc-50">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-zinc-950">{entry.season.name}</p>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">{entry.season.lifecycleStatus}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Joined {entry.joinedAt.toLocaleDateString("en-US")}
                {entry.initialSeed ? ` · Seed ${entry.initialSeed}` : ""}
              </p>
            </Link>
          ))}
          {contestant.seasons.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No season participation yet.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Ranking history</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="border-b border-zinc-200 px-3 py-2">Season</th>
                <th className="border-b border-zinc-200 px-3 py-2">Average score</th>
                <th className="border-b border-zinc-200 px-3 py-2">Score count</th>
                <th className="border-b border-zinc-200 px-3 py-2">Wins</th>
                <th className="border-b border-zinc-200 px-3 py-2">Losses</th>
              </tr>
            </thead>
            <tbody>
              {contestant.rankingHistory.map((metric) => (
                <tr key={metric.seasonId} className="odd:bg-zinc-50">
                  <td className="border-b border-zinc-100 px-3 py-3 font-medium text-zinc-950">{metric.seasonName}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{metric.averageScore}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{metric.scoreCount}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{metric.wins}</td>
                  <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{metric.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {contestant.rankingHistory.length === 0 ? <div className="py-4 text-sm text-zinc-500">No scoring history yet.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Dishes created</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {contestant.dishes.map((dish) => (
            <article key={dish.id} className="rounded-md border border-zinc-200 p-4">
              <p className="font-medium text-zinc-950">{dish.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{dish.description ?? "No dish description."}</p>
              <p className="mt-3 text-xs font-medium text-zinc-500">
                {dish.challenge.episode.season.name} · Episode {dish.challenge.episode.sequence}: {dish.challenge.episode.title} · {dish.challenge.title}
              </p>
            </article>
          ))}
          {contestant.dishes.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No dishes recorded yet.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Elimination history</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {contestant.eliminations.map((elimination) => (
            <div key={elimination.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">{elimination.season.name}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {elimination.reason}
                  {elimination.episode ? ` · Episode ${elimination.episode.sequence}: ${elimination.episode.title}` : ""}
                </p>
              </div>
              <span className="text-sm text-zinc-500">{elimination.eliminatedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {contestant.eliminations.length === 0 ? <div className="py-4 text-sm text-zinc-500">No eliminations recorded.</div> : null}
        </div>
      </section>
    </div>
  );
}
