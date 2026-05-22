import { PageHeader } from "@/app/components/shell/PageHeader";
import { LiveRankingTable } from "@/app/(protected)/rankings/_components/LiveRankingTable";
import { RankingSeasonFilter } from "@/app/(protected)/rankings/_components/RankingSeasonFilter";
import { RankingUseCases } from "@/application/rankings/ranking-use-cases";
import type { RankingContestantRow } from "@/domain/rankings/ranking-types";

type RankingHistoryItem = {
  id: string;
  occurredAt: Date;
  rowCount: number;
  generatedAt?: string;
};

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ seasonId?: string }>;
}) {
  const params = await searchParams;
  const seasons = await RankingUseCases.listSeasons();
  const seasonId = await RankingUseCases.resolveSeasonId(params.seasonId);

  if (!seasonId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rankings" description="Live season ranking, performance trends, and historical ranking snapshots." />
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-500">No season exists yet.</div>
      </div>
    );
  }

  const [ranking, history] = await Promise.all([RankingUseCases.getLiveRanking(seasonId), RankingUseCases.getHistoricalSnapshots(seasonId)]);
  const leader = ranking.rows[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Rankings" description="Real-time aggregation based on average score, wins, immunities, eliminations, and recent performance trends." />
      <RankingSeasonFilter seasons={seasons} seasonId={seasonId} />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Leader", leader?.name ?? "None"],
          ["Contestants", ranking.rows.length],
          ["Active", ranking.rows.filter((row: RankingContestantRow) => !row.eliminated).length],
          ["Snapshots", history.length],
        ].map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
          </section>
        ))}
      </div>

      <LiveRankingTable initialRanking={ranking} seasonId={seasonId} />

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Historical ranking snapshots</h2>
        <p className="mt-1 text-sm text-zinc-500">Stored from ranking update events emitted by scoring and challenge finish workflows.</p>
        <div className="mt-5 divide-y divide-zinc-100">
          {(history as RankingHistoryItem[]).map((snapshot) => (
            <div key={snapshot.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-zinc-950">{snapshot.rowCount} ranked contestants</p>
                <p className="mt-1 text-sm text-zinc-500">{snapshot.generatedAt ? `Generated ${new Date(snapshot.generatedAt).toLocaleString("en-US")}` : "Generated from legacy event payload"}</p>
              </div>
              <span className="text-sm text-zinc-500">{snapshot.occurredAt.toLocaleString("en-US")}</span>
            </div>
          ))}
          {history.length === 0 ? <div className="py-4 text-sm text-zinc-500">No historical ranking events yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
