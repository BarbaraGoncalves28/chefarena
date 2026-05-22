import { prisma } from "@/lib/prisma";
import { toDomainSeasonStatus } from "@/domain/seasons/season-status";

export type ContestantListFilters = {
  search?: string;
  seasonId?: string;
};

export class ContestantRepository {
  async listContestants(filters: ContestantListFilters) {
    const contestants = await prisma.contestant.findMany({
      where: {
        deletedAt: null,
        name: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
        seasonContestants: filters.seasonId
          ? {
              some: {
                seasonId: filters.seasonId,
                leftAt: null,
              },
            }
          : undefined,
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 80,
      select: {
        id: true,
        name: true,
        bio: true,
        status: true,
        seasonContestants: {
          where: { leftAt: null },
          select: {
            season: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            scores: true,
            dishes: true,
            eliminations: true,
          },
        },
      },
    });

    return contestants.map((contestant) => ({
      ...contestant,
      seasons: contestant.seasonContestants.map(({ season }) => ({
        ...season,
        lifecycleStatus: toDomainSeasonStatus(season.status),
      })),
    }));
  }

  async listSeasonFilters() {
    const seasons = await prisma.season.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      select: { id: true, name: true, status: true },
    });

    return seasons.map((season) => ({
      ...season,
      lifecycleStatus: toDomainSeasonStatus(season.status),
    }));
  }

  async getContestantProfile(id: string) {
    const contestant = await prisma.contestant.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        bio: true,
        status: true,
        seasonContestants: {
          orderBy: { joinedAt: "desc" },
          select: {
            joinedAt: true,
            leftAt: true,
            initialSeed: true,
            season: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        scores: {
          where: { deletedAt: null },
          select: {
            value: true,
            weight: true,
            category: true,
            challenge: {
              select: {
                id: true,
                title: true,
                weight: true,
                episode: {
                  select: {
                    season: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
                scores: {
                  where: { deletedAt: null },
                  select: {
                    contestantId: true,
                    value: true,
                    weight: true,
                  },
                },
              },
            },
          },
        },
        dishes: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            challenge: {
              select: {
                id: true,
                title: true,
                episode: {
                  select: {
                    title: true,
                    sequence: true,
                    season: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
        eliminations: {
          where: { deletedAt: null },
          orderBy: { eliminatedAt: "desc" },
          select: {
            id: true,
            seasonId: true,
            reason: true,
            eliminatedAt: true,
            season: { select: { id: true, name: true } },
            episode: { select: { sequence: true, title: true } },
          },
        },
      },
    });

    if (!contestant) return null;

    return {
      ...contestant,
      seasons: contestant.seasonContestants.map((entry) => ({
        ...entry,
        season: {
          ...entry.season,
          lifecycleStatus: toDomainSeasonStatus(entry.season.status),
        },
      })),
    };
  }

  async getContestantForEdit(id: string) {
    return prisma.contestant.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, bio: true, status: true },
    });
  }

  async getSeasonForAssignment(seasonId: string) {
    const season = await prisma.season.findFirst({
      where: { id: seasonId, deletedAt: null },
      select: { id: true, status: true },
    });

    return season ? { ...season, lifecycleStatus: toDomainSeasonStatus(season.status) } : null;
  }

  async createContestant(data: { name: string; bio?: string | null }) {
    return prisma.contestant.create({
      data: {
        name: data.name,
        bio: data.bio,
        status: "ACTIVE",
      },
    });
  }

  async updateContestant(id: string, data: { name: string; bio?: string | null; status: "ACTIVE" | "ELIMINATED" | "WITHDRAWN" }) {
    return prisma.contestant.update({
      where: { id },
      data,
    });
  }

  async assignToSeason(data: { contestantId: string; seasonId: string; initialSeed?: number | null }) {
    return prisma.seasonContestant.upsert({
      where: {
        seasonId_contestantId: {
          seasonId: data.seasonId,
          contestantId: data.contestantId,
        },
      },
      update: {
        leftAt: null,
        initialSeed: data.initialSeed,
      },
      create: {
        seasonId: data.seasonId,
        contestantId: data.contestantId,
        initialSeed: data.initialSeed,
      },
    });
  }
}
