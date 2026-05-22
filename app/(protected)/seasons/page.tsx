import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { SeasonUseCases } from "@/application/seasons/season-use-cases";
import { getSeasonStatusTone } from "@/domain/seasons/season-status";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function SeasonsPage() {
  const [session, seasons] = await Promise.all([requireAuthenticatedSession(), SeasonUseCases.listSeasons()]);
  const canManage = session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seasons"
        description="Competition editions are the root aggregate for episodes, challenges, rosters, rankings, immunities, and eliminations."
        actions={
          canManage ? (
            <Link href="/seasons/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New season
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4">
        {seasons.map((season) => (
          <Link key={season.id} href={`/seasons/${season.id}`} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold text-zinc-950">{season.name}</p>
                  <span className={`rounded-md px-3 py-1 text-xs font-semibold ${getSeasonStatusTone(season.lifecycleStatus)}`}>{season.lifecycleStatus}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {season._count.episodes} episodes · {season._count.seasonContestants} contestants · {season._count.eliminations} eliminations
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm lg:min-w-64">
                <div>
                  <dt className="text-zinc-500">Starts</dt>
                  <dd className="font-medium text-zinc-950">{season.startDate ? season.startDate.toLocaleDateString("en-US") : "TBD"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Ends</dt>
                  <dd className="font-medium text-zinc-950">{season.endDate ? season.endDate.toLocaleDateString("en-US") : "TBD"}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}

        {seasons.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No seasons created yet. Admins can initialize the first competition edition.</div>
        ) : null}
      </div>
    </div>
  );
}
