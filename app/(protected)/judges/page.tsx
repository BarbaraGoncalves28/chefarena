import Link from "next/link";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { JudgeForm } from "@/app/(protected)/judges/_components/JudgeForm";
import { createJudgeAction } from "@/app/actions/judges";
import { JudgeUseCases } from "@/application/judges/judge-use-cases";
import { getJudgeProfileTone } from "@/domain/judges/judge-profile";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function JudgesPage() {
  const [session, judges] = await Promise.all([requireAuthenticatedSession(), JudgeUseCases.listJudges()]);
  const canManage = session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader title="Judges" description="Manage judging authorities, season assignments, scoring behavior profiles, and score history." />

      {canManage ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Create judge</h2>
            <p className="mt-1 text-sm text-zinc-500">Judges become scoring actors after being assigned to a season.</p>
          </div>
          <JudgeForm action={createJudgeAction} submitLabel="Create judge" />
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {judges.map((judge) => (
          <Link key={judge.id} href={`/judges/${judge.id}`} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-950">{judge.name}</h2>
                <p className="mt-2 text-sm text-zinc-500">{judge.expertise ?? "General culinary judging"}</p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getJudgeProfileTone(judge.behavior.profile)}`}>{judge.behavior.profile}</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-semibold text-zinc-950">{judge.behavior.totalScores}</p>
                <p className="text-zinc-500">Scores</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-950">{judge.behavior.averageScore}</p>
                <p className="text-zinc-500">Average</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-950">{judge.assignedSeasonCount}</p>
                <p className="text-zinc-500">Seasons</p>
              </div>
            </div>
          </Link>
        ))}
        {judges.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No judges found.</div> : null}
      </div>
    </div>
  );
}
