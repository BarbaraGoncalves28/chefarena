export type CulinaryScoreCriterion = "taste" | "presentation" | "creativity";

export type ScoreCategoryCode = "TASTE" | "PRESENTATION" | "CREATIVITY";

export type CulinaryScoreInput = Record<CulinaryScoreCriterion, number>;

export type CulinaryScoreBreakdown = CulinaryScoreInput & {
  finalScore: number;
};

export const CULINARY_SCORE_WEIGHTS: Record<CulinaryScoreCriterion, number> = {
  taste: 0.5,
  presentation: 0.3,
  creativity: 0.2,
};

export const criterionToScoreCategory: Record<CulinaryScoreCriterion, ScoreCategoryCode> = {
  taste: "TASTE",
  presentation: "PRESENTATION",
  creativity: "CREATIVITY",
};

export const scoreCategoryToCriterion: Record<ScoreCategoryCode, CulinaryScoreCriterion> = {
  TASTE: "taste",
  PRESENTATION: "presentation",
  CREATIVITY: "creativity",
};
