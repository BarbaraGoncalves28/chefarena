import type { GameplayChallengeType } from "@/domain/challenges/challenge-type";
import { toDomainChallengeStatus, toPersistenceChallengeStatus, type ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";
import { isEliminationType, toDomainChallengeType, toPrismaChallengeType } from "@/domain/challenges/challenge-type";
import { prisma } from "@/lib/prisma";

type TeamAssignmentPayload = {
  action?: string;
  teamIds?: string[];
};

function hasTeamAssignmentPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const teamPayload = payload as TeamAssignmentPayload;
  return teamPayload.action === "challenge.teams.assigned" && Array.isArray(teamPayload.teamIds);
}

function mapChallenge<T extends { status: string; type: Parameters<typeof toDomainChallengeType>[0]; isElimination: boolean; scoringRules: unknown }>(challenge: T) {
  return {
    ...challenge,
    lifecycleStatus: toDomainChallengeStatus(challenge.status),
    gameplayType: toDomainChallengeType(challenge.type, challenge.isElimination, challenge.scoringRules),
  };
}

export class ChallengeRepository {
  async listChallenges() {
    const challenges = await prisma.challenge.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 60,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        isElimination: true,
        scoringRules: true,
        updatedAt: true,
        episode: {
          select: {
            id: true,
            title: true,
            sequence: true,
            season: { select: { id: true, name: true } },
          },
        },
        _count: { select: { dishes: true, scores: true } },
      },
    });

    return challenges.map(mapChallenge);
  }

  async listEpisodesForCreate() {
    return prisma.episode.findMany({
      where: {
        deletedAt: null,
        season: { deletedAt: null, status: { notIn: ["COMPLETED", "ARCHIVED"] } },
      },
      orderBy: [{ season: { startDate: "desc" } }, { sequence: "asc" }],
      select: {
        id: true,
        title: true,
        sequence: true,
        season: { select: { id: true, name: true } },
      },
    });
  }

  async getChallengeForPolicy(id: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, type: true, isElimination: true, scoringRules: true, episode: { select: { seasonId: true } } },
    });

    return challenge ? mapChallenge(challenge) : null;
  }

  async getChallengeDetail(id: string) {
    const [challenge, teamEvents] = await Promise.all([
      prisma.challenge.findFirst({
        where: { id, deletedAt: null },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          isElimination: true,
          scoringRules: true,
          weight: true,
          episode: {
            select: {
              id: true,
              title: true,
              sequence: true,
              season: {
                select: {
                  id: true,
                  name: true,
                  seasonContestants: {
                    where: { leftAt: null },
                    select: { contestant: { select: { id: true, name: true, status: true } } },
                  },
                  teams: {
                    where: { deletedAt: null },
                    select: { id: true, name: true, description: true },
                  },
                },
              },
            },
          },
          dishes: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              contestant: { select: { id: true, name: true, status: true } },
              scores: { where: { deletedAt: null }, select: { id: true, value: true, category: true, judge: { select: { id: true, name: true } } } },
            },
          },
          scores: {
            where: { deletedAt: null },
            orderBy: { recordedAt: "desc" },
            select: {
              id: true,
              value: true,
              category: true,
              recordedAt: true,
              contestant: { select: { id: true, name: true } },
              judge: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.event.findMany({
        where: { aggregateType: "Challenge", type: "AUDIT_LOG_CREATED", aggregateId: id },
        select: { payload: true },
      }),
    ]);

    if (!challenge) return null;

    const assignedTeamIds = new Set(
      teamEvents
        .filter((event) => hasTeamAssignmentPayload(event.payload))
        .flatMap((event) => (event.payload as TeamAssignmentPayload).teamIds ?? []),
    );

    return {
      ...mapChallenge(challenge),
      assignedTeams: challenge.episode.season.teams.filter((team) => assignedTeamIds.has(team.id)),
    };
  }

  async createChallenge(data: {
    episodeId: string;
    title: string;
    description?: string | null;
    type: GameplayChallengeType;
    weight: number;
  }) {
    return prisma.challenge.create({
      data: {
        episodeId: data.episodeId,
        title: data.title,
        description: data.description,
        type: toPrismaChallengeType(data.type),
        isElimination: isEliminationType(data.type),
        status: toPersistenceChallengeStatus("PENDING"),
        weight: data.weight,
        scoringRules: { domainType: data.type },
      },
    });
  }

  async setStatus(id: string, status: ChallengeLifecycleStatus) {
    return prisma.challenge.update({
      where: { id },
      data: { status: toPersistenceChallengeStatus(status) },
    });
  }

  async assignContestant(challengeId: string, contestantId: string) {
    const existingDish = await prisma.dish.findFirst({
      where: { challengeId, contestantId, deletedAt: null },
      select: { id: true },
    });

    if (existingDish) return existingDish;

    return prisma.dish.create({
      data: {
        challengeId,
        contestantId,
        title: "Dish pending",
        description: "Contestant assigned to challenge. Dish details can be completed during gameplay.",
      },
    });
  }

  async assignTeams(challengeId: string, teamIds: string[], actorId: string) {
    return prisma.event.create({
      data: {
        type: "AUDIT_LOG_CREATED",
        aggregateId: challengeId,
        aggregateType: "Challenge",
        actorId,
        actorType: "USER",
        payload: {
          action: "challenge.teams.assigned",
          teamIds,
        },
      },
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

  async recordRankingUpdatedEvent(data: { seasonId: string; ranking: Record<string, unknown>; actorId: string }) {
    return prisma.event.create({
      data: {
        type: "RANKING_UPDATED",
        aggregateId: data.seasonId,
        aggregateType: "Season",
        seasonId: data.seasonId,
        actorId: data.actorId,
        actorType: "SYSTEM",
        payload: data.ranking,
      },
    });
  }
}
