import type { ScoreSubmission } from "@/application/competition/commands/record-score-command";
import { prisma } from "@/lib/prisma";

export type RecordedScoreRow = {
  contestantId: string;
  contestantName: string;
  judgeName: string;
  challengeId: string;
  challengeTitle: string;
  challengeWeight: number;
  value: number;
  scoreWeight: number;
  effectiveScore: number;
  category: string;
};

export class CompetitionRepository {
  async findSeasonById(seasonId: string) {
    return prisma.season.findUnique({
      where: { id: seasonId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });
  }

  async findChallengeWithContext(challengeId: string) {
    return prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        episode: {
          select: { id: true, seasonId: true, sequence: true },
        },
        scores: {
          include: {
            contestant: { select: { id: true, name: true, status: true } },
            judge: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async createScore(payload: ScoreSubmission) {
    return prisma.score.create({
      data: {
        challengeId: payload.challengeId,
        judgeId: payload.judgeId,
        contestantId: payload.contestantId,
        dishId: payload.dishId,
        value: payload.value,
        weight: 1.0,
        category: payload.category,
        comments: payload.comments,
      },
    });
  }

  async getContestantImmunities(contestantId: string, challengeId: string) {
    return prisma.immunity.findMany({
      where: {
        contestantId,
        challengeId,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async listSeasonRanking(seasonId: string) {
    const contestants = await prisma.contestant.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        status: true,
        scores: {
          where: {
            deletedAt: null,
            challenge: {
              episode: { seasonId },
            },
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
            challenge: {
              episode: { seasonId },
            },
          },
          include: { challenge: { select: { id: true, title: true } } },
        },
        eliminations: {
          where: { seasonId, deletedAt: null },
          select: { eliminatedAt: true },
        },
      },
    });

    return contestants;
  }

  async createEvent(event: {
    type: string;
    aggregateId: string;
    aggregateType: string;
    payload: Record<string, unknown>;
    actorId?: string;
    actorType?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.event.create({ data: event });
  }

  async createElimination(data: {
    seasonId: string;
    contestantId: string;
    episodeId?: string;
    reason: string;
    sourceEventId?: string;
  }) {
    return prisma.elimination.create({
      data: {
        seasonId: data.seasonId,
        contestantId: data.contestantId,
        episodeId: data.episodeId,
        reason: data.reason,
        sourceEventId: data.sourceEventId,
      },
    });
  }

  async createAuditLog(data: {
    action: string;
    actorId?: string;
    actorRole?: string;
    targetId?: string;
    targetType?: string;
    details?: Record<string, unknown>;
    correlationId?: string;
    severity?: string;
  }) {
    return prisma.auditLog.create({ data });
  }
}
