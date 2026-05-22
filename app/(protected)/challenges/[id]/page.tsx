import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ChallengeLifecycleControls } from "@/app/(protected)/challenges/_components/ChallengeLifecycleControls";
import { ChallengeUseCases } from "@/application/challenges/challenge-use-cases";
import { getChallengeStatusTone } from "@/domain/challenges/challenge-lifecycle";
import { getChallengeTypeTone } from "@/domain/challenges/challenge-type";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, challenge] = await Promise.all([requireAuthenticatedSession(), ChallengeUseCases.getChallengeDetail(id)]);

  if (!challenge) notFound();

  const canRun = session.user.role === "ADMIN" || session.user.role === "JUDGE";

  return (
    <div className="space-y-8">
      <PageHeader
        title={challenge.title}
        description={challenge.description ?? "No challenge description provided."}
        actions={
          canRun ? (
            <div className="flex flex-wrap gap-2">
              <Link href={`/challenges/${challenge.id}/run`} className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
                Run
              </Link>
              <ChallengeLifecycleControls challengeId={challenge.id} status={challenge.lifecycleStatus} />
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Status", challenge.lifecycleStatus],
          ["Type", challenge.gameplayType],
          ["Contestants", challenge.dishes.length],
          ["Scores", challenge.scores.length],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            {label === "Status" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getChallengeStatusTone(challenge.lifecycleStatus)}`}>{value}</span>
            ) : label === "Type" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getChallengeTypeTone(challenge.gameplayType)}`}>{value}</span>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Assigned contestants</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {challenge.dishes.map((dish) => (
            <div key={dish.id} className="rounded-md border border-zinc-200 p-4">
              <p className="font-medium text-zinc-950">{dish.contestant.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{dish.title}</p>
              <p className="mt-3 text-sm text-zinc-500">{dish.scores.length} scores</p>
            </div>
          ))}
          {challenge.dishes.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No contestants assigned.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Scores</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {challenge.scores.map((score) => (
            <div key={score.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">
                  {score.value} points · {score.contestant.name}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {score.judge.name} · {score.category}
                </p>
              </div>
              <span className="text-sm text-zinc-500">{score.recordedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {challenge.scores.length === 0 ? <div className="py-4 text-sm text-zinc-500">No scores recorded.</div> : null}
        </div>
      </section>
    </div>
  );
}
