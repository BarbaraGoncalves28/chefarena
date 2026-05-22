export type ContestantScoreForMetrics = {
  value: number;
  weight: unknown;
  challenge: {
    id: string;
    title: string;
    weight: unknown;
    episode: {
      season: {
        id: string;
        name: string;
      };
    };
    scores: Array<{
      contestantId: string;
      value: number;
      weight: unknown;
    }>;
  };
};

export type ContestantEliminationForMetrics = {
  seasonId: string;
};

export class ContestantPerformanceService {
  static effectiveScore(score: { value: number; weight: unknown; challenge?: { weight: unknown } }) {
    return Number((score.value * Number(score.weight ?? 1) * Number(score.challenge?.weight ?? 1)).toFixed(2));
  }

  static buildSeasonMetrics(contestantId: string, scores: ContestantScoreForMetrics[], eliminations: ContestantEliminationForMetrics[]) {
    const bySeason = new Map<
      string,
      {
        seasonId: string;
        seasonName: string;
        scoreTotal: number;
        scoreCount: number;
        wins: number;
        losses: number;
        wonChallengeIds: Set<string>;
      }
    >();

    for (const score of scores) {
      const season = score.challenge.episode.season;
      const current =
        bySeason.get(season.id) ??
        {
          seasonId: season.id,
          seasonName: season.name,
          scoreTotal: 0,
          scoreCount: 0,
          wins: 0,
          losses: 0,
          wonChallengeIds: new Set<string>(),
        };

      current.scoreTotal += ContestantPerformanceService.effectiveScore(score);
      current.scoreCount += 1;

      const contestantChallengeScore = score.challenge.scores
        .filter((entry) => entry.contestantId === contestantId)
        .reduce((total, entry) => total + ContestantPerformanceService.effectiveScore(entry), 0);

      const allChallengeTotals = new Map<string, number>();
      for (const entry of score.challenge.scores) {
        allChallengeTotals.set(entry.contestantId, (allChallengeTotals.get(entry.contestantId) ?? 0) + ContestantPerformanceService.effectiveScore(entry));
      }
      const topScore = Math.max(0, ...allChallengeTotals.values());
      if (contestantChallengeScore > 0 && contestantChallengeScore === topScore && !current.wonChallengeIds.has(score.challenge.id)) {
        current.wins += 1;
        current.wonChallengeIds.add(score.challenge.id);
      }

      bySeason.set(season.id, current);
    }

    for (const elimination of eliminations) {
      const current = bySeason.get(elimination.seasonId);
      if (current) {
        current.losses += 1;
      }
    }

    return Array.from(bySeason.values()).map((metric) => ({
      seasonId: metric.seasonId,
      seasonName: metric.seasonName,
      scoreTotal: metric.scoreTotal,
      scoreCount: metric.scoreCount,
      wins: metric.wins,
      losses: metric.losses,
      averageScore: metric.scoreCount ? Number((metric.scoreTotal / metric.scoreCount).toFixed(2)) : 0,
    }));
  }
}
