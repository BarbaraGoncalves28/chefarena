import { RankingService } from "@/services/competition/ranking-service";
import { JudgeUseCases } from "@/application/judges/judge-use-cases";
import { ScoringEngine } from "@/services/scoring/scoring-engine";
import { ScoringPolicy } from "@/services/scoring/scoring-policy";
import { ScoringRepository } from "@/infrastructure/repositories/scoring-repository";

const repository = new ScoringRepository();

export type CulinaryScoreSubmission = {
  dishId: string;
  judgeId: string;
  taste: number;
  presentation: number;
  creativity: number;
  comments?: string;
};

export class ScoringUseCases {
  static async submitScore(input: CulinaryScoreSubmission, actorId: string) {
    const context = await ScoringUseCases.getDishContext(input.dishId);
    ScoringPolicy.assertCanSubmit(context.challengeStatus);

    await JudgeUseCases.assertJudgeCanScoreSeason(input.judgeId, context.challenge.episode.seasonId);

    const breakdown = ScoringEngine.calculateFinalScore({
      taste: input.taste,
      presentation: input.presentation,
      creativity: input.creativity,
    });

    const scores = await repository.upsertJudgeScores({
      dishId: context.id,
      challengeId: context.challenge.id,
      contestantId: context.contestantId,
      judgeId: input.judgeId,
      scores: breakdown,
      comments: input.comments,
    });

    await repository.updateDishScoreSummary(context.id, input.judgeId, breakdown);
    await ScoringUseCases.emitScoreAndRankingEvents({
      scoreIds: scores.map((score) => score.id),
      dishId: context.id,
      challengeId: context.challenge.id,
      contestantId: context.contestantId,
      judgeId: input.judgeId,
      finalScore: breakdown.finalScore,
      seasonId: context.challenge.episode.seasonId,
      actorId,
    });

    return { scores, breakdown };
  }

  static async updateScore(input: CulinaryScoreSubmission, actorId: string) {
    const context = await ScoringUseCases.getDishContext(input.dishId);
    ScoringPolicy.assertCanUpdate(context.challengeStatus);

    return ScoringUseCases.submitScore(input, actorId);
  }

  private static async getDishContext(dishId: string) {
    const context = await repository.getDishScoringContext(dishId);
    if (!context) {
      throw new Error("Dish not found for scoring.");
    }
    return context;
  }

  private static async emitScoreAndRankingEvents(input: {
    scoreIds: string[];
    dishId: string;
    challengeId: string;
    contestantId: string;
    judgeId: string;
    finalScore: number;
    seasonId: string;
    actorId: string;
  }) {
    await repository.recordScoreEvent(input);

    const seasonSnapshot = await repository.listSeasonRanking(input.seasonId);
    const ranking = RankingService.buildSeasonRanking(seasonSnapshot);

    await repository.recordRankingUpdatedEvent({
      seasonId: input.seasonId,
      ranking: { ...ranking, seasonId: input.seasonId },
      actorId: input.actorId,
    });
  }
}
