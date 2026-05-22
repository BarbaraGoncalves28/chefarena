import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ContestantFilters } from "@/app/(protected)/contestants/_components/ContestantFilters";
import { ContestantUseCases } from "@/application/contestants/contestant-use-cases";
import { getContestantStatusTone } from "@/domain/contestants/contestant-status";
import { requireAuthenticatedSession } from "@/infrastructure/auth/session";

export default async function ContestantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; seasonId?: string }>;
}) {
  const filters = await searchParams;
  const [session, seasons, contestants] = await Promise.all([
    requireAuthenticatedSession(),
    ContestantUseCases.listSeasonFilters(),
    ContestantUseCases.listContestants({
      search: filters.q,
      seasonId: filters.seasonId,
    }),
  ]);
  const canManage = session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contestants"
        description="Manage chefs as long-lived profiles while keeping scores, eliminations, wins, and losses scoped to each season."
        actions={
          canManage ? (
            <Link href="/contestants/new" className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New contestant
            </Link>
          ) : null
        }
      />

      <ContestantFilters seasons={seasons} search={filters.q} seasonId={filters.seasonId} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contestants.map((contestant) => (
          <Link key={contestant.id} href={`/contestants/${contestant.id}`} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-950">{contestant.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{contestant.bio ?? "No biography provided."}</p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getContestantStatusTone(contestant.status)}`}>{contestant.status}</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="font-semibold text-zinc-950">{contestant.seasons.length}</p>
                <p className="text-zinc-500">Seasons</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-950">{contestant._count.dishes}</p>
                <p className="text-zinc-500">Dishes</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-950">{contestant._count.eliminations}</p>
                <p className="text-zinc-500">Losses</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {contestant.seasons.slice(0, 3).map((season) => (
                <span key={season.id} className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                  {season.name}
                </span>
              ))}
            </div>
          </Link>
        ))}

        {contestants.length === 0 ? <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No contestants match the current filters.</div> : null}
      </div>
    </div>
  );
}
