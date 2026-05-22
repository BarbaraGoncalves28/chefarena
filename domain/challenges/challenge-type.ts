import type { ChallengeType as PrismaChallengeType } from "@prisma/client";

export type GameplayChallengeType = "INDIVIDUAL" | "TEAM" | "ELIMINATION" | "PRESSURE_TEST";

export function toDomainChallengeType(type: PrismaChallengeType, isElimination: boolean, scoringRules: unknown): GameplayChallengeType {
  if (isElimination) return "ELIMINATION";

  if (scoringRules && typeof scoringRules === "object" && "domainType" in scoringRules) {
    const domainType = (scoringRules as { domainType?: string }).domainType;
    if (domainType === "PRESSURE_TEST") return "PRESSURE_TEST";
  }

  if (type === "TEAM" || type === "SERVICE") return "TEAM";
  return "INDIVIDUAL";
}

export function toPrismaChallengeType(type: GameplayChallengeType): PrismaChallengeType {
  if (type === "TEAM") return "TEAM";
  if (type === "PRESSURE_TEST") return "MYSTERY_BOX";
  return "INDIVIDUAL";
}

export function isEliminationType(type: GameplayChallengeType) {
  return type === "ELIMINATION";
}

export function getChallengeTypeTone(type: GameplayChallengeType) {
  const tones: Record<GameplayChallengeType, string> = {
    INDIVIDUAL: "bg-sky-50 text-sky-700",
    TEAM: "bg-violet-50 text-violet-700",
    ELIMINATION: "bg-red-50 text-red-700",
    PRESSURE_TEST: "bg-amber-50 text-amber-700",
  };

  return tones[type];
}
