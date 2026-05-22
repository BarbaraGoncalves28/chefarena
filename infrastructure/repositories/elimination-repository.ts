import { prisma } from "@/lib/prisma";
import type { EliminationCandidate, EliminationDecision } from "@/domain/eliminations/elimination-types";

function normalizeScore(value: number) {
  return value > 10 ? value / 10 : value;
}

export class EliminationRepository {
  async listSeasons() {
    return prisma.season.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      select: { id: true, name: true, status: true },
    });
  }

  async listSeasonContestants(seasonId: string) {
    return prisma.seasonContestant.findMany({
      where: { seasonId, leftAt: null },
      orderBy: { contestant: { name: "asc" } },
      select: { contestant: { select: { id: true, name: true, status: true } } },
    });
  }

  async buildCandidates(seasonId: string): Promise<EliminationCandidate[]> {
    const contestants = await prisma.contestant.findMany({
      where: {
        deletedAt: null,
        seasonContestants: { some: { seasonId, leftAt: null } },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        scores: {
          where: { deletedAt: null, challenge: { episode: { seasonId } } },
          select: { value: true },
        },
        immunities: {
          where: {
            deletedAt: null,
            challenge: { episode: { seasonId } },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: { id: true },
        },
        eliminations: {
          where: { seasonId, deletedAt: null },
          select: { id: true },
        },
        votes: {
          where: {
            seasonId,
            deletedAt: null,
            voterType: "JUDGE",
          },
          select: { value: true },
        },
      },
    });

    return contestants.map((contestant) => {
      const normalizedScores = contestant.scores.map((score) => normalizeScore(score.value));
      const averageScore = normalizedScores.length
        ? Number((normalizedScores.reduce((total, score) => total + score, 0) / normalizedScores.length).toFixed(2))
        : 0;

      return {
        contestantId: contestant.id,
        name: contestant.name,
        averageScore,
        scoreCount: contestant.scores.length,
        immunity: contestant.immunities.length > 0,
        alreadyEliminated: contestant.eliminations.length > 0,
        judgeVoteCount: contestant.votes.reduce((total, vote) => total + vote.value, 0),
      };
    });
  }

  async listHistory(seasonId?: string) {
    return prisma.elimination.findMany({
      where: { deletedAt: null, seasonId },
      orderBy: { eliminatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        reason: true,
        eliminatedAt: true,
        sourceEventId: true,
        season: { select: { id: true, name: true } },
        contestant: { select: { id: true, name: true } },
        episode: { select: { id: true, title: true, sequence: true } },
      },
    });
  }

  async createElimination(input: {
    seasonId: string;
    episodeId?: string;
    decision: EliminationDecision;
    actorId: string;
  }) {
    const event = await prisma.event.create({
      data: {
        type: "CONTESTANT_ELIMINATED",
        aggregateId: input.decision.contestantId,
        aggregateType: "Contestant",
        seasonId: input.seasonId,
        actorId: input.actorId,
        actorType: input.decision.mode === "AUTOMATIC" ? "SYSTEM" : "USER",
        payload: {
          mode: input.decision.mode,
          contestantId: input.decision.contestantId,
          reason: input.decision.reason,
          averageScore: input.decision.averageScore,
          tieResolvedByJudgeVote: input.decision.tieResolvedByJudgeVote,
        },
      },
    });

    const elimination = await prisma.elimination.create({
      data: {
        seasonId: input.seasonId,
        episodeId: input.episodeId,
        contestantId: input.decision.contestantId,
        reason: input.decision.reason,
        sourceEventId: event.id,
      },
    });

    await prisma.contestant.update({
      where: { id: input.decision.contestantId },
      data: { status: "ELIMINATED" },
    });

    return { event, elimination };
  }

  async createJudgeVote(input: {
    seasonId: string;
    contestantId: string;
    judgeId: string;
    value: number;
  }) {
    return prisma.vote.create({
      data: {
        seasonId: input.seasonId,
        contestantId: input.contestantId,
        voterType: "JUDGE",
        voterId: input.judgeId,
        value: input.value,
        metadata: { purpose: "ELIMINATION_TIE_BREAK" },
      },
    });
  }
}
