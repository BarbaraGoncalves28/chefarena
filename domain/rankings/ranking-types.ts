export type RankingTrend = "UP" | "DOWN" | "STABLE";

export type RankingContestantRow = {
  contestantId: string;
  name: string;
  position: number;
  rankingScore: number;
  averageScore: number;
  scoreCount: number;
  wins: number;
  immunities: number;
  eliminations: number;
  eliminated: boolean;
  trend: RankingTrend;
  recentScores: number[];
};

export type RankingSnapshot = {
  seasonId: string;
  generatedAt: string;
  rows: RankingContestantRow[];
};

export function getRankingTrendTone(trend: RankingTrend) {
  const tones: Record<RankingTrend, string> = {
    UP: "text-emerald-700",
    DOWN: "text-red-700",
    STABLE: "text-zinc-500",
  };

  return tones[trend];
}
