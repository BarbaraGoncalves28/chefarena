import type { EliminationCandidate } from "@/domain/eliminations/elimination-types";

export class EliminationPolicy {
  static assertCanEliminate(candidate: EliminationCandidate) {
    if (candidate.alreadyEliminated) {
      throw new Error("Contestant is already eliminated in this season.");
    }

    if (candidate.immunity) {
      throw new Error("Contestant has active immunity and cannot be eliminated.");
    }
  }

  static assertManualOverrideReason(reason: string) {
    if (reason.trim().length < 8) {
      throw new Error("Manual override requires a meaningful reason.");
    }
  }
}
