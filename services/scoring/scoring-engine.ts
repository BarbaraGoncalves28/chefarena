import { CULINARY_SCORE_WEIGHTS, type CulinaryScoreBreakdown, type CulinaryScoreInput } from "@/domain/scoring/scoring-criteria";

export class ScoringEngine {
  static assertCriterionRange(value: number, label: string) {
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      throw new Error(`${label} must be between 0 and 10.`);
    }
  }

  static calculateFinalScore(input: CulinaryScoreInput): CulinaryScoreBreakdown {
    ScoringEngine.assertCriterionRange(input.taste, "Taste");
    ScoringEngine.assertCriterionRange(input.presentation, "Presentation");
    ScoringEngine.assertCriterionRange(input.creativity, "Creativity");

    const finalScore =
      input.taste * CULINARY_SCORE_WEIGHTS.taste +
      input.presentation * CULINARY_SCORE_WEIGHTS.presentation +
      input.creativity * CULINARY_SCORE_WEIGHTS.creativity;

    return {
      ...input,
      finalScore: Number(finalScore.toFixed(2)),
    };
  }

  static toStoredScoreValue(value: number) {
    return Math.round(value * 10);
  }

  static fromStoredScoreValue(value: number) {
    return Number((value / 10).toFixed(1));
  }
}
