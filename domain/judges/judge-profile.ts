export type JudgeBehaviorProfile = "STRICT" | "BALANCED" | "CREATIVE";

export function getJudgeProfileTone(profile: JudgeBehaviorProfile) {
  const tones: Record<JudgeBehaviorProfile, string> = {
    STRICT: "bg-red-50 text-red-700",
    BALANCED: "bg-emerald-50 text-emerald-700",
    CREATIVE: "bg-amber-50 text-amber-700",
  };

  return tones[profile];
}
