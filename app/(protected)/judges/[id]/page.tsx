import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { JudgeAssignmentForm } from "@/app/(protected)/judges/_components/JudgeAssignmentForm";
import { JudgeDeleteForm } from "@/app/(protected)/judges/_components/JudgeDeleteForm";
import { JudgeForm } from "@/app/(protected)/judges/_components/JudgeForm";
import { updateJudgeAction } from "@/app/actions/judges";
import { JudgeUseCases } from "@/application/judges/judge-use-cases";
import { getJudgeProfileTone } from "@/domain/judges/judge-profile";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function JudgeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, judge, seasons] = await Promise.all([
    requireAuthenticatedSession(),
    JudgeUseCases.getJudgeProfile(id),
    JudgeUseCases.listAssignableSeasons(),
  ]);

  if (!judge) notFound();

  const canManage = session.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <PageHeader
        title={judge.name}
        description={judge.expertise ?? "General culinary judging"}
        actions={canManage ? <JudgeDeleteForm judgeId={judge.id} /> : null}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Profile", judge.behavior.profile],
          ["Scores", judge.behavior.totalScores],
          ["Average", judge.behavior.averageScore],
          ["Bias @ 75", judge.behavior.simulatedBiasAt75],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            {label === "Profile" ? (
              <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getJudgeProfileTone(judge.behavior.profile)}`}>{value}</span>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
            )}
          </section>
        ))}
      </div>

      {canManage ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-950">Edit judge</h2>
            <JudgeForm action={updateJudgeAction} submitLabel="Save judge" judge={judge} />
          </section>
          <JudgeAssignmentForm judgeId={judge.id} seasons={seasons} />
        </div>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Assigned seasons</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {judge.assignedSeasons.map((season) => (
            <a key={season.id} href={`/seasons/${season.id}`} className="rounded-md border border-zinc-200 p-4 transition hover:bg-zinc-50">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-zinc-950">{season.name}</p>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">{season.lifecycleStatus}</span>
              </div>
            </a>
          ))}
          {judge.assignedSeasons.length === 0 ? <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">No season assignments recorded.</div> : null}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Judging history</h2>
        <div className="mt-5 divide-y divide-zinc-100">
          {judge.scores.map((score) => (
            <div key={score.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">
                  {score.value} points for {score.contestant.name}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {score.challenge.episode.season.name} · Episode {score.challenge.episode.sequence}: {score.challenge.episode.title} · {score.challenge.title} · {score.category}
                </p>
                {score.comments ? <p className="mt-2 text-sm text-zinc-500">{score.comments}</p> : null}
              </div>
              <span className="text-sm text-zinc-500">{score.recordedAt.toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {judge.scores.length === 0 ? <div className="py-4 text-sm text-zinc-500">No scores recorded by this judge yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
