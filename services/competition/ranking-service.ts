import type { Score, Immunity, Elimination, ContestantStatus, Decimal } from "@prisma/client";
import { ScoringService } from "@/services/competition/scoring-service";

export type RankingRow = {
  contestantId: string;
  name: string;
  effectiveScore: number;
  rank: number;
  eliminated: boolean;
  immunity: boolean;
  scoreCount: number;
};

export type RankedSeasonSnapshot = {
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

export class RankingService {
  static buildSeasonRanking(contestants: Array<{
    id: string;
    name: string;
    status: ContestantStatus;
    scores: Array<Score & { challenge: { id: string; title: string; weight: Decimal } }>;
    immunities: Array<Immunity>;
    eliminations: Array<Pick<Elimination, "eliminatedAt">>;
  }>): RankedSeasonSnapshot {
    const rows = contestants.map((contestant) => {
      const scoreInputs = contestant.scores.map((score) => ({
        value: score.value,
        scoreWeight: Number(score.weight),
        challengeWeight: Number(score.challenge.weight ?? 1),
        category: score.category,
      }));
      const aggregated = ScoringService.aggregateContestantScores(scoreInputs);
      const hasImmunity = contestant.immunities.length > 0;
      const isEliminated = contestant.status === "ELIMINATED" || contestant.eliminations.length > 0;

      return {
        contestantId: contestant.id,
        name: contestant.name,
        effectiveScore: aggregated.total,
        rank: 0,
        eliminated: isEliminated,
        immunity: hasImmunity,
        scoreCount: contestant.scores.length,
      };
    });

    const sorted = rows
      .sort((left, right) => {
        if (left.eliminated !== right.eliminated) return left.eliminated ? 1 : -1;
        if (left.effectiveScore !== right.effectiveScore) return right.effectiveScore - left.effectiveScore;
        return right.scoreCount - left.scoreCount;
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));

    const activeCandidates = sorted.filter((row) => !row.eliminated && !row.immunity);
    const nextEliminationCandidate = activeCandidates.length
      ? {
          contestantId: activeCandidates[activeCandidates.length - 1].contestantId,
          name: activeCandidates[activeCandidates.length - 1].name,
          effectiveScore: activeCandidates[activeCandidates.length - 1].effectiveScore,
          eliminationReason: "Lowest active score without immunity",
        }
      : undefined;

    return {
      seasonId: "unknown",
      generatedAt: new Date().toISOString(),
      contestants: sorted,
      nextEliminationCandidate,
    };
  }

  static resolveEliminationCandidate(ranking: RankedSeasonSnapshot) {
    return ranking.nextEliminationCandidate;
  }
}
