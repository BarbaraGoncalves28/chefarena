import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { SeasonAdminPanel } from "@/app/(protected)/seasons/_components/SeasonAdminPanel";
import { SeasonLifecycleActions } from "@/app/(protected)/seasons/_components/SeasonLifecycleActions";
import { RankingPanel } from "@/app/components/RankingPanel";
import { SeasonUseCases } from "@/application/seasons/season-use-cases";
import { getSeasonStatusTone } from "@/domain/seasons/season-status";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, season] = await Promise.all([requireAuthenticatedSession(), SeasonUseCases.getSeasonDetail(id)]);

  if (!season) notFound();

  const canManage = session.user.role === "ADMIN";
  const locked = season.lifecycleStatus === "FINISHED";
  const [assignableContestants, judges] = canManage
    ? await Promise.all([SeasonUseCases.listAssignableContestants(season.id), SeasonUseCases.listAssignableJudges()])
    : [[], []];

  const challengeCount = season.episodes.reduce((total, episode) => total + episode.challenges.length, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={season.name}
        description="Season details compose the production aggregate: roster, episode structure, challenges, rankings, and elimination history."
        actions={<SeasonLifecycleActions seasonId={season.id} status={season.lifecycleStatus} canManage={canManage} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Status", season.lifecycleStatus],
          ["Contestants", season.seasonContestants.length],
          ["Episodes", season.episodes.length],
          ["Challenges", challengeCount],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            {label === "Status" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getSeasonStatusTone(season.lifecycleStatus)}`}>{value}</span>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
            )}
          </section>
        ))}
      </div>

      {canManage ? <SeasonAdminPanel seasonId={season.id} locked={locked} contestants={assignableContestants} judges={judges} /> : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Contestants</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {season.seasonContestants.map(({ contestant }) => (
            <div key={contestant.id} className="rounded-md border border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-zinc-950">{contestant.name}</p>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">{contestant.status}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                {contestant._count.dishes} dishes · {contestant._count.scores} scores
              </p>
            </div>
          ))}
          {season.seasonContestants.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No contestants assigned.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Episodes and challenges</h2>
        <div className="mt-5 space-y-4">
          {season.episodes.map((episode) => (
            <div key={episode.id} className="rounded-md border border-zinc-200 p-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <h3 className="font-medium text-zinc-950">
                  Episode {episode.sequence}: {episode.title}
                </h3>
                <span className="text-sm text-zinc-500">{episode.airDate ? episode.airDate.toLocaleDateString("en-US") : "Unscheduled"}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {episode.challenges.map((challenge) => (
                  <div key={challenge.id} className="rounded-md bg-zinc-50 p-4">
                    <p className="font-medium text-zinc-950">{challenge.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {challenge.type} · {challenge.status} · {challenge._count.dishes} dishes · {challenge._count.scores} scores
                    </p>
                  </div>
                ))}
                {episode.challenges.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No challenges planned.</div> : null}
              </div>
            </div>
          ))}
          {season.episodes.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No episodes initialized.</div> : null}
        </div>
      </section>

      <RankingPanel seasonId={season.id} />

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Eliminations history</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {season.eliminations.map((elimination) => (
            <div key={elimination.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">{elimination.contestant.name}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {elimination.reason}
                  {elimination.episode ? ` · Episode ${elimination.episode.sequence}: ${elimination.episode.title}` : ""}
                </p>
              </div>
              <span className="text-sm text-zinc-500">{elimination.eliminatedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {season.eliminations.length === 0 ? <div className="py-4 text-sm text-zinc-500">No eliminations recorded yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
