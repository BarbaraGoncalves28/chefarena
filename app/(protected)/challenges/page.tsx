import Link from "next/link";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ChallengeForm } from "@/app/(protected)/challenges/_components/ChallengeForm";
import { ChallengeUseCases } from "@/application/challenges/challenge-use-cases";
import { getChallengeStatusTone } from "@/domain/challenges/challenge-lifecycle";
import { getChallengeTypeTone } from "@/domain/challenges/challenge-type";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function ChallengesPage() {
  const [session, challenges, episodes] = await Promise.all([
    requireAuthenticatedSession(),
    ChallengeUseCases.listChallenges(),
    ChallengeUseCases.listEpisodesForCreate(),
  ]);
  const canManage = session.user.role === "ADMIN";
  const canRun = session.user.role === "ADMIN" || session.user.role === "JUDGE";

  return (
    <div className="space-y-6">
      <PageHeader title="Challenges" description="Core gameplay system for challenge setup, live execution, scoring windows, and ranking-triggering finishes." />

      {canManage ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Create challenge</h2>
            <p className="mt-1 text-sm text-zinc-500">Challenges start in PENDING and must move through the state machine before scores are accepted.</p>
          </div>
          <ChallengeForm episodes={episodes} />
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/challenges/${challenge.id}`} className="font-semibold text-zinc-950 transition hover:text-amber-700">
                  {challenge.title}
                </Link>
                <p className="mt-1 text-sm text-zinc-500">
                  {challenge.episode.season.name} · Episode {challenge.episode.sequence}: {challenge.episode.title}
                </p>
              </div>
              <span className={`rounded-md px-3 py-1 text-xs font-semibold ${getChallengeStatusTone(challenge.lifecycleStatus)}`}>{challenge.lifecycleStatus}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className={`rounded-md px-2 py-1 ${getChallengeTypeTone(challenge.gameplayType)}`}>{challenge.gameplayType}</span>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">{challenge._count.dishes} contestants</span>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-700">{challenge._count.scores} scores</span>
            </div>
            {canRun ? (
              <div className="mt-5">
                <Link href={`/challenges/${challenge.id}/run`} className="inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
                  Open run cockpit
                </Link>
              </div>
            ) : null}
          </article>
        ))}
        {challenges.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No challenges found.</div> : null}
      </div>
    </div>
  );
}
