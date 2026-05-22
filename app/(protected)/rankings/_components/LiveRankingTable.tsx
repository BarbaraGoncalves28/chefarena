"use client";

import { useCallback, useEffect, useState } from "react";
import type { RankingSnapshot } from "@/domain/rankings/ranking-types";

type RankingResponse = {
  success: boolean;
  ranking?: RankingSnapshot;
  error?: string;
};

export function LiveRankingTable({ initialRanking, seasonId }: { initialRanking: RankingSnapshot; seasonId: string }) {
  const [ranking, setRanking] = useState<RankingSnapshot>(initialRanking);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/competitions/ranking?seasonId=${seasonId}`, { cache: "no-store" });
    const data = (await response.json()) as RankingResponse;
    if (data.success && data.ranking) {
      setRanking(data.ranking);
      setError(null);
    } else {
      setError(data.error ?? "Unable to load ranking.");
    }
  }, [seasonId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">Live ranking</h2>
          <p className="mt-1 text-sm text-zinc-500">Refreshes every 5 seconds from the no-store ranking endpoint.</p>
        </div>
        <button type="button" onClick={refresh} className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
          Refresh
        </button>
      </div>

      {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2">#</th>
              <th className="border-b border-zinc-200 px-3 py-2">Contestant</th>
              <th className="border-b border-zinc-200 px-3 py-2">Ranking score</th>
              <th className="border-b border-zinc-200 px-3 py-2">Average</th>
              <th className="border-b border-zinc-200 px-3 py-2">Wins</th>
              <th className="border-b border-zinc-200 px-3 py-2">Immunity</th>
              <th className="border-b border-zinc-200 px-3 py-2">Trend</th>
              <th className="border-b border-zinc-200 px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {ranking.rows.map((row) => (
              <tr key={row.contestantId} className="odd:bg-zinc-50">
                <td className="border-b border-zinc-100 px-3 py-3 font-semibold text-zinc-950">{row.position}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-950">{row.name}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.rankingScore}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.averageScore}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.wins}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.immunities}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.trend}</td>
                <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">{row.eliminated ? "Eliminated" : "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
