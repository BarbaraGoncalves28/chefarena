import type { GameplayChallengeType } from "@/domain/challenges/challenge-type";
import { ChallengeStateMachine } from "@/services/challenges/challenge-state-machine";
import { ChallengePolicy } from "@/services/challenges/challenge-policy";
import { ChallengeRepository } from "@/infrastructure/repositories/challenge-repository";
import { RankingService } from "@/services/competition/ranking-service";
import { EliminationUseCases } from "@/application/eliminations/elimination-use-cases";

const repository = new ChallengeRepository();

export type ChallengeFormInput = {
  episodeId: string;
  title: string;
  description?: string | null;
  type: GameplayChallengeType;
  weight: number;
};

export class ChallengeUseCases {
  static async listChallenges() {
    return repository.listChallenges();
  }

  static async listEpisodesForCreate() {
    return repository.listEpisodesForCreate();
  }

  static async getChallengeDetail(id: string) {
    return repository.getChallengeDetail(id);
  }

  static async createChallenge(input: ChallengeFormInput) {
    ChallengePolicy.assertCanCreate();
    return repository.createChallenge(input);
  }

  static async startChallenge(id: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(id);
    const nextStatus = ChallengeStateMachine.nextOnStart(challenge.lifecycleStatus);
    return repository.setStatus(id, nextStatus);
  }

  static async openScoring(id: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(id);
    const nextStatus = ChallengeStateMachine.nextOnOpenScoring(challenge.lifecycleStatus);
    return repository.setStatus(id, nextStatus);
  }

  static async finishChallenge(id: string, actorId: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(id);
    const nextStatus = ChallengeStateMachine.nextOnFinish(challenge.lifecycleStatus);
    const updatedChallenge = await repository.setStatus(id, nextStatus);
    const seasonSnapshot = await repository.listSeasonRanking(challenge.episode.seasonId);
    const ranking = RankingService.buildSeasonRanking(seasonSnapshot);

    await repository.recordRankingUpdatedEvent({
      seasonId: challenge.episode.seasonId,
      ranking: { ...ranking, seasonId: challenge.episode.seasonId },
      actorId,
    });

    if (challenge.isElimination) {
      await EliminationUseCases.runAutomatic({
        seasonId: challenge.episode.seasonId,
        actorId,
      });
    }

    return updatedChallenge;
  }

  static async assignContestant(challengeId: string, contestantId: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(challengeId);
    ChallengePolicy.assertContestantAssignmentAllowed(challenge.lifecycleStatus);
    return repository.assignContestant(challengeId, contestantId);
  }

  static async assignTeams(challengeId: string, teamIds: string[], actorId: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(challengeId);
    ChallengePolicy.assertTeamAssignmentAllowed(challenge.lifecycleStatus, challenge.gameplayType);
    return repository.assignTeams(challengeId, teamIds, actorId);
  }

  static async assertChallengeCanBeScored(challengeId: string) {
    const challenge = await ChallengeUseCases.getPolicyChallenge(challengeId);
    ChallengePolicy.assertCanScore(challenge.lifecycleStatus);
  }

  private static async getPolicyChallenge(id: string) {
    const challenge = await repository.getChallengeForPolicy(id);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }
    return challenge;
  }
}
