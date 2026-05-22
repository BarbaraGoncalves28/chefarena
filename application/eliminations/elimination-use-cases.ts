import { EliminationPolicy } from "@/services/eliminations/elimination-policy";
import { EliminationRepository } from "@/infrastructure/repositories/elimination-repository";
import { EliminationRulesEngine } from "@/services/eliminations/elimination-rules-engine";

const repository = new EliminationRepository();

export class EliminationUseCases {
  static async listSeasons() {
    return repository.listSeasons();
  }

  static async listSeasonContestants(seasonId: string) {
    return repository.listSeasonContestants(seasonId);
  }

  static async previewAutomatic(seasonId: string) {
    const candidates = await repository.buildCandidates(seasonId);
    return {
      candidates,
      decision: EliminationRulesEngine.decideAutomatic(candidates),
    };
  }

  static async runAutomatic(input: { seasonId: string; episodeId?: string; actorId: string }) {
    const { candidates, decision } = await EliminationUseCases.previewAutomatic(input.seasonId);
    if (!decision) {
      throw new Error("No eligible contestant for automatic elimination.");
    }

    const candidate = candidates.find((item) => item.contestantId === decision.contestantId);
    if (!candidate) {
      throw new Error("Elimination candidate not found.");
    }

    EliminationPolicy.assertCanEliminate(candidate);
    return repository.createElimination({
      seasonId: input.seasonId,
      episodeId: input.episodeId,
      actorId: input.actorId,
      decision,
    });
  }

  static async manualOverride(input: { seasonId: string; contestantId: string; reason: string; actorId: string }) {
    EliminationPolicy.assertManualOverrideReason(input.reason);
    const candidates = await repository.buildCandidates(input.seasonId);
    const candidate = candidates.find((item) => item.contestantId === input.contestantId);
    if (!candidate) {
      throw new Error("Contestant is not part of this season.");
    }

    EliminationPolicy.assertCanEliminate(candidate);
    const decision = EliminationRulesEngine.decideManualOverride({
      contestantId: input.contestantId,
      reason: `Manual override: ${input.reason}`,
      averageScore: candidate.averageScore,
    });

    return repository.createElimination({
      seasonId: input.seasonId,
      actorId: input.actorId,
      decision,
    });
  }

  static async createJudgeTieBreakVote(input: { seasonId: string; contestantId: string; judgeId: string; value: number }) {
    return repository.createJudgeVote(input);
  }

  static async listHistory(seasonId?: string) {
    return repository.listHistory(seasonId);
  }
}
