import type { EliminationCandidate, EliminationDecision } from "@/domain/eliminations/elimination-types";

export class EliminationRulesEngine {
  static eligibleCandidates(candidates: EliminationCandidate[]) {
    return candidates.filter((candidate) => !candidate.immunity && !candidate.alreadyEliminated);
  }

  static decideAutomatic(candidates: EliminationCandidate[]): EliminationDecision | null {
    const eligible = EliminationRulesEngine.eligibleCandidates(candidates);
    if (eligible.length === 0) return null;

    const lowestScore = Math.min(...eligible.map((candidate) => candidate.averageScore));
    const tied = eligible.filter((candidate) => candidate.averageScore === lowestScore);
    const ordered = tied.sort((left, right) => {
      if (left.judgeVoteCount !== right.judgeVoteCount) return right.judgeVoteCount - left.judgeVoteCount;
      return left.scoreCount - right.scoreCount;
    });

    const selected = ordered[0];
    return {
      mode: "AUTOMATIC",
      contestantId: selected.contestantId,
      reason:
        tied.length > 1
          ? "Lowest score tie resolved by judge vote."
          : "Lowest average score without immunity.",
      averageScore: selected.averageScore,
      tieResolvedByJudgeVote: tied.length > 1,
    };
  }

  static decideManualOverride(input: { contestantId: string; reason: string; averageScore?: number }): EliminationDecision {
    return {
      mode: "MANUAL_OVERRIDE",
      contestantId: input.contestantId,
      reason: input.reason,
      averageScore: input.averageScore ?? 0,
      tieResolvedByJudgeVote: false,
    };
  }
}
