import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ChallengeAssignmentForms } from "@/app/(protected)/challenges/_components/ChallengeAssignmentForms";
import { ChallengeLifecycleControls } from "@/app/(protected)/challenges/_components/ChallengeLifecycleControls";
import { ChallengeScoreForm } from "@/app/(protected)/challenges/_components/ChallengeScoreForm";
import { ChallengeUseCases } from "@/application/challenges/challenge-use-cases";
import { JudgeUseCases } from "@/application/judges/judge-use-cases";
import { getChallengeStatusTone } from "@/domain/challenges/challenge-lifecycle";
import { getChallengeTypeTone } from "@/domain/challenges/challenge-type";
import { requireRole } from "@/infrastructure/auth/session";

export default async function ChallengeRunPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "JUDGE"]);
  const { id } = await params;
  const [challenge, judges] = await Promise.all([ChallengeUseCases.getChallengeDetail(id), JudgeUseCases.listJudges()]);

  if (!challenge) notFound();

  const assignedContestants = challenge.dishes.map((dish) => dish.contestant);
  const assignmentLocked = challenge.lifecycleStatus === "SCORING" || challenge.lifecycleStatus === "FINISHED";

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Run: ${challenge.title}`}
        description="Operational cockpit for challenge lifecycle, participant assignment, scoring, and ranking-triggering finish."
        actions={<ChallengeLifecycleControls challengeId={challenge.id} status={challenge.lifecycleStatus} />}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">State</p>
          <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getChallengeStatusTone(challenge.lifecycleStatus)}`}>{challenge.lifecycleStatus}</span>
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Type</p>
          <span className={`mt-3 inline-flex rounded-md px-3 py-1 text-sm font-semibold ${getChallengeTypeTone(challenge.gameplayType)}`}>{challenge.gameplayType}</span>
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Contestants</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{assignedContestants.length}</p>
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Scores</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{challenge.scores.length}</p>
        </section>
      </div>

      <ChallengeAssignmentForms
        challengeId={challenge.id}
        locked={assignmentLocked}
        teamChallenge={challenge.gameplayType === "TEAM"}
        contestants={challenge.episode.season.seasonContestants}
        teams={challenge.episode.season.teams}
      />

      <ChallengeScoreForm
        disabled={challenge.lifecycleStatus !== "SCORING"}
        dishes={challenge.dishes}
        judges={judges.map((judge) => ({ id: judge.id, name: judge.name }))}
      />

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">State machine</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {["PENDING", "ACTIVE", "SCORING", "FINISHED"].map((state) => (
            <div key={state} className={`rounded-md border p-4 text-sm font-semibold ${state === challenge.lifecycleStatus ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 text-zinc-600"}`}>
              {state}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
