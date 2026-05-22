import { prisma } from "@/lib/prisma";
import { toDomainSeasonStatus, toPrismaSeasonStatus, type SeasonLifecycleStatus } from "@/domain/seasons/season-status";

export type SeasonListItem = Awaited<ReturnType<SeasonRepository["listSeasons"]>>[number];
export type SeasonDetail = Awaited<ReturnType<SeasonRepository["getSeasonDetail"]>>;

export class SeasonRepository {
  async listSeasons() {
    const seasons = await prisma.season.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: "asc" }, { startDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        startDate: true,
        endDate: true,
        _count: {
          select: {
            episodes: true,
            seasonContestants: true,
            eliminations: true,
          },
        },
      },
    });

    return seasons.map((season) => ({
      ...season,
      lifecycleStatus: toDomainSeasonStatus(season.status),
    }));
  }

  async getSeasonForPolicy(id: string) {
    const season = await prisma.season.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });

    return season ? { ...season, lifecycleStatus: toDomainSeasonStatus(season.status) } : null;
  }

  async getActiveSeasonId() {
    const activeSeason = await prisma.season.findFirst({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true },
    });

    return activeSeason?.id;
  }

  async getSeasonDetail(id: string) {
    const season = await prisma.season.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        startDate: true,
        endDate: true,
        seasonContestants: {
          where: { leftAt: null },
          orderBy: { joinedAt: "asc" },
          select: {
            id: true,
            joinedAt: true,
            contestant: {
              select: {
                id: true,
                name: true,
                status: true,
                _count: { select: { dishes: true, scores: true } },
              },
            },
          },
        },
        episodes: {
          where: { deletedAt: null },
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            title: true,
            sequence: true,
            airDate: true,
            challenges: {
              where: { deletedAt: null },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                isElimination: true,
                _count: { select: { scores: true, dishes: true } },
              },
            },
          },
        },
        eliminations: {
          where: { deletedAt: null },
          orderBy: { eliminatedAt: "desc" },
          select: {
            id: true,
            reason: true,
            eliminatedAt: true,
            contestant: { select: { id: true, name: true } },
            episode: { select: { title: true, sequence: true } },
          },
        },
      },
    });

    return season ? { ...season, lifecycleStatus: toDomainSeasonStatus(season.status) } : null;
  }

  async listAssignableContestants(seasonId: string) {
    return prisma.contestant.findMany({
      where: {
        deletedAt: null,
        seasonContestants: {
          none: { seasonId, leftAt: null },
        },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, status: true },
    });
  }

  async listAssignableJudges() {
    return prisma.judge.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, expertise: true },
    });
  }

  async createSeason(data: { name: string; slug: string; startDate?: Date; endDate?: Date }) {
    return prisma.season.create({
      data: {
        name: data.name,
        slug: data.slug,
        status: toPrismaSeasonStatus("UPCOMING"),
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  async updateSeason(id: string, data: { name: string; slug: string; startDate?: Date | null; endDate?: Date | null }) {
    return prisma.season.update({
      where: { id },
      data,
    });
  }

  async setStatus(id: string, status: SeasonLifecycleStatus, endDate?: Date) {
    return prisma.season.update({
      where: { id },
      data: {
        status: toPrismaSeasonStatus(status),
        endDate,
      },
    });
  }

  async assignContestant(seasonId: string, contestantId: string) {
    return prisma.seasonContestant.upsert({
      where: { seasonId_contestantId: { seasonId, contestantId } },
      update: { leftAt: null },
      create: { seasonId, contestantId },
    });
  }

  async initializeStructure(seasonId: string, episodeCount: number, challengesPerEpisode: number) {
    const existingEpisodes = await prisma.episode.count({ where: { seasonId, deletedAt: null } });
    if (existingEpisodes > 0) {
      throw new Error("Season structure has already been initialized.");
    }

    return prisma.$transaction(
      Array.from({ length: episodeCount }).flatMap((_, episodeIndex) => {
        const episodeSequence = episodeIndex + 1;
        return [
          prisma.episode.create({
            data: {
              seasonId,
              sequence: episodeSequence,
              title: `Episode ${episodeSequence}`,
              challenges: {
                create: Array.from({ length: challengesPerEpisode }).map((__, challengeIndex) => ({
                  title: `Challenge ${challengeIndex + 1}`,
                  type: challengeIndex === 0 ? "MYSTERY_BOX" : "INDIVIDUAL",
                  status: "OPEN",
                  isElimination: challengeIndex === challengesPerEpisode - 1,
                })),
              },
            },
          }),
        ];
      }),
    );
  }

  async recordSeasonJudgeAssignment(seasonId: string, judgeIds: string[], actorId: string) {
    return prisma.event.create({
      data: {
        type: "AUDIT_LOG_CREATED",
        aggregateId: seasonId,
        aggregateType: "Season",
        actorId,
        actorType: "USER",
        payload: {
          action: "season.judges.assigned",
          judgeIds,
        },
      },
    });
  }
}
