import type { ScoreCategory } from "@prisma/client";

export type ScoreCategoryWeightMap = Record<ScoreCategory, number>;

export const DEFAULT_CATEGORY_WEIGHTS: ScoreCategoryWeightMap = {
  TASTE: 0.4,
  PRESENTATION: 0.25,
  TECHNIQUE: 0.25,
  TEAMWORK: 0.1,
};

export type ScoreInput = {
  value: number;
  scoreWeight?: number;
  challengeWeight?: number;
  category: ScoreCategory;
};

export type AggregatedScore = {
  total: number;
  categoryTotals: Record<ScoreCategory, number>;
  weightedAverage: number;
  entries: ScoreInput[];
};

export class ScoringService {
  static normalizeWeight(weight?: number) {
    return weight === undefined || weight === null ? 1 : Number(weight);
  }

  static calculateEffectiveScore(input: ScoreInput) {
    const base = Number(input.value);
    const scoreWeight = ScoringService.normalizeWeight(input.scoreWeight);
    const challengeWeight = ScoringService.normalizeWeight(input.challengeWeight);
    return base * scoreWeight * challengeWeight;
  }

  static aggregateContestantScores(
    scores: ScoreInput[],
    categoryWeights: ScoreCategoryWeightMap = DEFAULT_CATEGORY_WEIGHTS,
  ): AggregatedScore {
    const categoryTotals = Object.fromEntries(
      Object.keys(categoryWeights).map((category) => [category, 0]),
    ) as Record<ScoreCategory, number>;

    let total = 0;
    let weightedSum = 0;
    let scoreCount = 0;

    for (const score of scores) {
      const effectiveScore = ScoringService.calculateEffectiveScore(score);
      total += effectiveScore;
      categoryTotals[score.category] += effectiveScore;
      weightedSum += effectiveScore * (categoryWeights[score.category] ?? 1);
      scoreCount += 1;
    }

    return {
      total: Number(total.toFixed(2)),
      categoryTotals: Object.fromEntries(
        Object.entries(categoryTotals).map(([category, value]) => [category, Number(value.toFixed(2))]),
      ) as Record<ScoreCategory, number>,
      weightedAverage: scoreCount ? Number((weightedSum / scoreCount).toFixed(2)) : 0,
      entries: scores,
    };
  }

  static computeTeamScore(
    memberScores: AggregatedScore[],
    aggregation: "sum" | "average" | "highest" = "average",
  ) {
    if (memberScores.length === 0) {
      return 0;
    }

    switch (aggregation) {
      case "sum":
        return Number(memberScores.reduce((acc, member) => acc + member.total, 0).toFixed(2));
      case "highest":
        return Number(Math.max(...memberScores.map((member) => member.total)).toFixed(2));
      case "average":
      default:
        return Number(
          (memberScores.reduce((acc, member) => acc + member.total, 0) / memberScores.length).toFixed(2),
        );
    }
  }

  static hasActiveImmunity(immunities: Array<{ expiresAt?: Date | string | null }>) {
    const now = new Date();
    return immunities.some((immunity) => !immunity.expiresAt || new Date(immunity.expiresAt) > now);
  }
}
