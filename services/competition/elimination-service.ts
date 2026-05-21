import type { RankedSeasonSnapshot, RankingRow } from "@/services/competition/ranking-service";

export type EliminationPolicy = {
  maxEliminations: number;
  allowImmunity: boolean;
  ignoreTeamImmunity?: boolean;
  minimumScore?: number;
};

export type EliminationDecision = {
  contestantId: string;
  seasonId: string;
  reason: string;
  automatic: boolean;
  effectiveScore: number;
};

export class EliminationService {
  static isEligibleForElimination(row: RankingRow, policy: EliminationPolicy) {
    if (row.eliminated) return false;
    if (!policy.allowImmunity && row.immunity) return false;
    if (typeof policy.minimumScore === "number" && row.effectiveScore < policy.minimumScore) return false;
    return true;
  }

  static pickEliminationCandidates(
    ranking: RankedSeasonSnapshot,
    policy: EliminationPolicy,
  ): EliminationDecision[] {
    const eligibleRows = ranking.contestants.filter((row) =>
      EliminationService.isEligibleForElimination(row, policy),
    );

    if (eligibleRows.length === 0) {
      return [];
    }

    const ordered = eligibleRows
      .sort((left, right) => {
        if (left.effectiveScore !== right.effectiveScore) return left.effectiveScore - right.effectiveScore;
        return left.scoreCount - right.scoreCount;
      })
      .slice(0, policy.maxEliminations);

    return ordered.map((row) => ({
      contestantId: row.contestantId,
      seasonId: ranking.seasonId,
      reason: "Lowest score without immunity",
      automatic: true,
      effectiveScore: row.effectiveScore,
    }));
  }

  static resolveStatusTransition(currentStatus: string, targetStatus: string) {
    const transitions: Record<string, string[]> = {
      ACTIVE: ["ELIMINATED", "WITHDRAWN"],
      ELIMINATED: [],
      WITHDRAWN: [],
    };
    const allowed = transitions[currentStatus] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}`);
    }
    return targetStatus;
  }

  static needsEliminationProcessing(ranking: RankedSeasonSnapshot, policy: EliminationPolicy) {
    return ranking.contestants.some((row) => EliminationService.isEligibleForElimination(row, policy));
  }
}
