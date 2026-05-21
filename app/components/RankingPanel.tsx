"use client";

import { useCallback, useEffect, useState } from "react";

type RankingRow = {
  contestantId: string;
  name: string;
  effectiveScore: number;
  rank: number;
  eliminated: boolean;
  immunity: boolean;
  scoreCount: number;
};

type RankingResponse = {
  success: boolean;
  ranking?: {
    seasonId: string;
    generatedAt: string;
    contestants: RankingRow[];
    nextEliminationCandidate?: {
      contestantId: string;
      name: string;
      effectiveScore: number;
      eliminationReason: string;
    };
  };
  error?: string;
};

export function RankingPanel({ seasonId }: { seasonId: string }) {
  const [ranking, setRanking] = useState<RankingResponse | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/competitions/ranking?seasonId=${seasonId}`, { cache: "no-store" });
    const data = (await response.json()) as RankingResponse;
    setRanking(data);
  }, [seasonId]);

  useEffect(() => {
    if (!seasonId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 7000);
    return () => window.clearInterval(interval);
  }, [seasonId, refresh]);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Live season ranking</h2>
          <p className="mt-1 text-sm text-zinc-600">Automatic refresh every 7 seconds for real-time decision support.</p>
        </div>
        <button onClick={refresh} className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
          Refresh
        </button>
      </div>

      {!seasonId ? (
        <p className="mt-4 text-sm text-amber-700">No season selected yet.</p>
      ) : ranking?.success ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-700">
            <thead>
              <tr>
                <th className="border-b px-3 py-2">Rank</th>
                <th className="border-b px-3 py-2">Contestant</th>
                <th className="border-b px-3 py-2">Score</th>
                <th className="border-b px-3 py-2">Immunity</th>
                <th className="border-b px-3 py-2">Eliminated</th>
              </tr>
            </thead>
            <tbody>
              {ranking.ranking?.contestants.map((row) => (
                <tr key={row.contestantId} className="odd:bg-zinc-50">
                  <td className="border-b px-3 py-3 font-medium">{row.rank}</td>
                  <td className="border-b px-3 py-3">{row.name}</td>
                  <td className="border-b px-3 py-3">{row.effectiveScore.toFixed(1)}</td>
                  <td className="border-b px-3 py-3">{row.immunity ? "Yes" : "No"}</td>
                  <td className="border-b px-3 py-3">{row.eliminated ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ranking.ranking?.nextEliminationCandidate ? (
            <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
              <strong>Next elimination candidate:</strong> {ranking.ranking.nextEliminationCandidate.name} ({ranking.ranking.nextEliminationCandidate.effectiveScore.toFixed(1)})
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-red-600">{ranking?.error ?? "Loading ranking..."}</p>
      )}
    </section>
  );
}
