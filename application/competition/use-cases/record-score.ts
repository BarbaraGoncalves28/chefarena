import { CompetitionRepository } from "@/infrastructure/repositories/competition-repository";
import { ScoreInputSchema, type ScoreSubmission } from "@/application/competition/commands/record-score-command";
import { RankingService } from "@/services/competition/ranking-service";

const repository = new CompetitionRepository();

export async function recordScore(payload: ScoreSubmission, actorId = "system") {
  const validated = ScoreInputSchema.parse(payload);
  const challenge = await repository.findChallengeWithContext(validated.challengeId);

  if (!challenge) {
    throw new Error("Challenge not found for score submission.");
  }

  const [createdScore, immunities] = await Promise.all([
    repository.createScore(validated),
    repository.getContestantImmunities(validated.contestantId, validated.challengeId),
  ]);

  const effectiveScore = Number(createdScore.value) * Number(createdScore.weight) * Number(challenge.weight);

  await repository.createEvent({
    type: "SCORE_RECORDED",
    aggregateId: createdScore.id,
    aggregateType: "Score",
    payload: {
      scoreId: createdScore.id,
      contestantId: createdScore.contestantId,
      challengeId: createdScore.challengeId,
      judgeId: createdScore.judgeId,
      value: createdScore.value,
      effectiveScore,
      category: createdScore.category,
      immunityApplied: immunities.length > 0,
    },
    actorId,
    actorType: "USER",
    metadata: {
      challengeWeight: Number(challenge.weight),
      immunities: immunities.length,
    },
  });

  const seasonId = challenge.episode.seasonId;
  const seasonSnapshot = await repository.listSeasonRanking(seasonId);
  const ranking = RankingService.buildSeasonRanking(seasonSnapshot);

  await repository.createEvent({
    type: "RANKING_UPDATED",
    aggregateId: seasonId,
    aggregateType: "Season",
    payload: ranking,
    actorId,
    actorType: "SYSTEM",
  });

  await repository.createAuditLog({
    action: "score.recorded",
    actorId,
    actorRole: "JUDGE",
    targetId: createdScore.contestantId,
    targetType: "Contestant",
    details: {
      scoreId: createdScore.id,
      challengeId: createdScore.challengeId,
      effectiveScore,
    },
    severity: "INFO",
  });

  if (challenge.isElimination) {
    const eliminationCandidate = RankingService.resolveEliminationCandidate(ranking);
    if (eliminationCandidate) {
      await repository.createElimination({
        seasonId,
        contestantId: eliminationCandidate.contestantId,
        episodeId: challenge.episode.id,
        reason: "Automatic elimination after elimination challenge step.",
        sourceEventId: createdScore.id,
      });
    }
  }

  return { createdScore, ranking };
}
