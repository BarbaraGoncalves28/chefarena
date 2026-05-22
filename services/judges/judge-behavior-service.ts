import type { JudgeBehaviorProfile } from "@/domain/judges/judge-profile";

export type JudgeScoreInput = {
  value: number;
  category: string;
};

export class JudgeBehaviorService {
  static resolveProfile(scores: JudgeScoreInput[]): JudgeBehaviorProfile {
    if (scores.length === 0) return "BALANCED";

    const average = scores.reduce((total, score) => total + score.value, 0) / scores.length;
    const variance = scores.reduce((total, score) => total + Math.pow(score.value - average, 2), 0) / scores.length;
    const deviation = Math.sqrt(variance);

    if (average < 62) return "STRICT";
    if (average >= 78 || deviation >= 18) return "CREATIVE";
    return "BALANCED";
  }

  static simulateBias(baseScore: number, profile: JudgeBehaviorProfile) {
    const adjustments: Record<JudgeBehaviorProfile, number> = {
      STRICT: -8,
      BALANCED: 0,
      CREATIVE: 6,
    };

    return Math.max(0, Math.min(100, baseScore + adjustments[profile]));
  }

  static buildScoreSummary(scores: JudgeScoreInput[]) {
    const profile = JudgeBehaviorService.resolveProfile(scores);
    const averageScore = scores.length ? Number((scores.reduce((total, score) => total + score.value, 0) / scores.length).toFixed(2)) : 0;
    const categoryCounts = scores.reduce<Record<string, number>>((acc, score) => {
      acc[score.category] = (acc[score.category] ?? 0) + 1;
      return acc;
    }, {});

    return {
      profile,
      averageScore,
      totalScores: scores.length,
      categoryCounts,
      simulatedBiasAt75: JudgeBehaviorService.simulateBias(75, profile),
    };
  }
}
