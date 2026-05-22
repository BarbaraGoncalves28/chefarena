import { toDomainChallengeStatus } from "@/domain/challenges/challenge-lifecycle";
import { criterionToScoreCategory, scoreCategoryToCriterion, type ScoreCategoryCode } from "@/domain/scoring/scoring-criteria";
import { ScoringEngine } from "@/services/scoring/scoring-engine";
import { prisma } from "@/lib/prisma";

type ScoreSummaryPayload = {
  judgeScores?: Array<{
    judgeId: string;
    scores: {
      taste: number;
      presentation: number;
      creativity: number;
      finalScore: number;
    };
    updatedAt: string;
  }>;
  finalScore?: number;
  updatedAt?: string;
};

function parseScoreSummary(summary: unknown): ScoreSummaryPayload {
  if (!summary || typeof summary !== "object") return {};
  const payload = summary as ScoreSummaryPayload;
  return {
    judgeScores: Array.isArray(payload.judgeScores) ? payload.judgeScores : [],
    finalScore: typeof payload.finalScore === "number" ? payload.finalScore : undefined,
    updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : undefined,
  };
}

export class ScoringRepository {
  async getDishScoringContext(dishId: string) {
    const dish = await prisma.dish.findFirst({
      where: { id: dishId, deletedAt: null },
      select: {
        id: true,
        contestantId: true,
        scoreSummary: true,
        challenge: {
          select: {
            id: true,
            status: true,
            episode: { select: { seasonId: true } },
          },
        },
      },
    });

    if (!dish) return null;

    return {
      ...dish,
      challengeStatus: toDomainChallengeStatus(dish.challenge.status),
      scoreSummaryPayload: parseScoreSummary(dish.scoreSummary),
    };
  }

  async findJudgeDishScores(dishId: string, judgeId: string) {
    const scores = await prisma.score.findMany({
      where: {
        dishId,
        judgeId,
        deletedAt: null,
        category: { in: ["TASTE", "PRESENTATION", "CREATIVITY"] },
      },
      select: {
        id: true,
        category: true,
        value: true,
      },
    });

    return scores.map((score) => ({
      ...score,
      criterion: scoreCategoryToCriterion[score.category as ScoreCategoryCode],
      normalizedValue: ScoringEngine.fromStoredScoreValue(score.value),
    }));
  }

  async upsertJudgeScores(input: {
    dishId: string;
    challengeId: string;
    contestantId: string;
    judgeId: string;
    scores: {
      taste: number;
      presentation: number;
      creativity: number;
    };
    comments?: string;
  }) {
    const entries = [
      { criterion: "taste" as const, value: input.scores.taste },
      { criterion: "presentation" as const, value: input.scores.presentation },
      { criterion: "creativity" as const, value: input.scores.creativity },
    ];

    const written = [];
    for (const entry of entries) {
      const category = criterionToScoreCategory[entry.criterion];
      const existing = await prisma.score.findFirst({
        where: {
          dishId: input.dishId,
          judgeId: input.judgeId,
          category,
          deletedAt: null,
        },
        select: { id: true },
      });

      const data = {
        challengeId: input.challengeId,
        contestantId: input.contestantId,
        judgeId: input.judgeId,
        dishId: input.dishId,
        value: ScoringEngine.toStoredScoreValue(entry.value),
        category,
        comments: input.comments,
        status: "CONFIRMED" as const,
      };

      written.push(existing ? await prisma.score.update({ where: { id: existing.id }, data }) : await prisma.score.create({ data }));
    }

    return written;
  }

  async updateDishScoreSummary(dishId: string, judgeId: string, scores: { taste: number; presentation: number; creativity: number; finalScore: number }) {
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { scoreSummary: true },
    });
    const current = parseScoreSummary(dish?.scoreSummary);
    const judgeScores = (current.judgeScores ?? []).filter((entry) => entry.judgeId !== judgeId);
    judgeScores.push({
      judgeId,
      scores,
      updatedAt: new Date().toISOString(),
    });

    const finalScore = judgeScores.length ? Number((judgeScores.reduce((total, entry) => total + entry.scores.finalScore, 0) / judgeScores.length).toFixed(2)) : scores.finalScore;
    const summary = {
      judgeScores,
      finalScore,
      updatedAt: new Date().toISOString(),
    };

    return prisma.dish.update({
      where: { id: dishId },
      data: { scoreSummary: summary },
    });
  }

  async listSeasonRanking(seasonId: string) {
    return prisma.contestant.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        scores: {
          where: {
            deletedAt: null,
            challenge: { episode: { seasonId } },
          },
          include: {
            challenge: { select: { id: true, title: true, weight: true } },
            judge: { select: { id: true, name: true } },
          },
        },
        immunities: {
          where: {
            deletedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            challenge: { episode: { seasonId } },
          },
        },
        eliminations: {
          where: { seasonId, deletedAt: null },
          select: { eliminatedAt: true },
        },
      },
    });
  }

  async recordScoreEvent(input: {
    scoreIds: string[];
    dishId: string;
    challengeId: string;
    contestantId: string;
    judgeId: string;
    finalScore: number;
    actorId: string;
  }) {
    return prisma.event.create({
      data: {
        type: "SCORE_RECORDED",
        aggregateId: input.dishId,
        aggregateType: "Dish",
        actorId: input.actorId,
        actorType: "USER",
        payload: {
          scoreIds: input.scoreIds,
          dishId: input.dishId,
          challengeId: input.challengeId,
          contestantId: input.contestantId,
          judgeId: input.judgeId,
          finalScore: input.finalScore,
        },
      },
    });
  }

  async recordRankingUpdatedEvent(input: { seasonId: string; ranking: Record<string, unknown>; actorId: string }) {
    return prisma.event.create({
      data: {
        type: "RANKING_UPDATED",
        aggregateId: input.seasonId,
        aggregateType: "Season",
        seasonId: input.seasonId,
        actorId: input.actorId,
        actorType: "SYSTEM",
        payload: input.ranking,
      },
    });
  }
}
