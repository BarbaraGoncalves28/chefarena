import type { RankingContestantRow, RankingSnapshot, RankingTrend } from "@/domain/rankings/ranking-types";

type ScoreLike = {
  value: number;
  recordedAt: Date;
  challengeId: string;
  contestantId: string;
};

type ContestantRankingInput = {
  id: string;
  name: string;
  scores: ScoreLike[];
  immunities: Array<unknown>;
  eliminations: Array<unknown>;
};

function normalizeScore(value: number) {
  return value > 10 ? value / 10 : value;
}

export class RankingAggregationService {
  static resolveTrend(scores: number[]): RankingTrend {
    if (scores.length < 2) return "STABLE";

    const midpoint = Math.ceil(scores.length / 2);
    const older = scores.slice(midpoint);
    const newer = scores.slice(0, midpoint);
    const olderAverage = older.length ? older.reduce((total, score) => total + score, 0) / older.length : newer[0];
    const newerAverage = newer.reduce((total, score) => total + score, 0) / newer.length;
    const delta = newerAverage - olderAverage;

    if (delta > 0.35) return "UP";
    if (delta < -0.35) return "DOWN";
    return "STABLE";
  }

  static countWins(contestants: ContestantRankingInput[], contestantId: string) {
    const challengeTotals = new Map<string, Map<string, number>>();

    for (const contestant of contestants) {
      for (const score of contestant.scores) {
        const challengeScores = challengeTotals.get(score.challengeId) ?? new Map<string, number>();
        challengeScores.set(contestant.id, (challengeScores.get(contestant.id) ?? 0) + normalizeScore(score.value));
        challengeTotals.set(score.challengeId, challengeScores);
      }
    }

    let wins = 0;
    for (const challengeScores of challengeTotals.values()) {
      const contestantScore = challengeScores.get(contestantId) ?? 0;
      const bestScore = Math.max(0, ...challengeScores.values());
      if (contestantScore > 0 && contestantScore === bestScore) {
        wins += 1;
      }
    }

    return wins;
  }

  static buildSnapshot(seasonId: string, contestants: ContestantRankingInput[]): RankingSnapshot {
    const rows = contestants.map<RankingContestantRow>((contestant) => {
      const normalizedScores = contestant.scores
        .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())
        .map((score) => normalizeScore(score.value));
      const averageScore = normalizedScores.length ? normalizedScores.reduce((total, score) => total + score, 0) / normalizedScores.length : 0;
      const wins = RankingAggregationService.countWins(contestants, contestant.id);
      const immunities = contestant.immunities.length;
      const eliminations = contestant.eliminations.length;
      const eliminated = eliminations > 0;
      const rankingScore = eliminated ? -1 : averageScore + wins * 0.75 + immunities * 0.35;

      return {
        contestantId: contestant.id,
        name: contestant.name,
        position: 0,
        rankingScore: Number(rankingScore.toFixed(2)),
        averageScore: Number(averageScore.toFixed(2)),
        scoreCount: contestant.scores.length,
        wins,
        immunities,
        eliminations,
        eliminated,
        trend: RankingAggregationService.resolveTrend(normalizedScores.slice(0, 6)),
        recentScores: normalizedScores.slice(0, 6).map((score) => Number(score.toFixed(1))),
      };
    });

    const sortedRows = rows
      .sort((left, right) => {
        if (left.eliminated !== right.eliminated) return left.eliminated ? 1 : -1;
        if (left.rankingScore !== right.rankingScore) return right.rankingScore - left.rankingScore;
        return right.averageScore - left.averageScore;
      })
      .map((row, index) => ({ ...row, position: index + 1 }));

    return {
      seasonId,
      generatedAt: new Date().toISOString(),
      rows: sortedRows,
    };
  }
}
