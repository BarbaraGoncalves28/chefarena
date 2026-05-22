import { prisma } from "@/lib/prisma";

type RankingEventPayload = {
  seasonId?: string;
  rows?: unknown[];
  contestants?: unknown[];
  generatedAt?: string;
};

function isRankingPayload(payload: unknown): payload is RankingEventPayload {
  return Boolean(payload && typeof payload === "object");
}

export class RankingRepository {
  async listSeasons() {
    return prisma.season.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      select: { id: true, name: true, status: true },
    });
  }

  async findDefaultSeasonId() {
    const season =
      (await prisma.season.findFirst({
        where: { status: "ACTIVE", deletedAt: null },
        select: { id: true },
      })) ??
      (await prisma.season.findFirst({
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
        select: { id: true },
      }));

    return season?.id ?? null;
  }

  async getSeasonRankingInput(seasonId: string) {
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
          where: {
            deletedAt: null,
            challenge: { episode: { seasonId } },
          },
          orderBy: { recordedAt: "desc" },
          select: {
            value: true,
            recordedAt: true,
            challengeId: true,
            contestantId: true,
          },
        },
        immunities: {
          where: {
            deletedAt: null,
            challenge: { episode: { seasonId } },
          },
          select: { id: true },
        },
        eliminations: {
          where: { seasonId, deletedAt: null },
          select: { id: true },
        },
      },
    });

    return contestants;
  }

  async listHistoricalSnapshots(seasonId: string) {
    const events = await prisma.event.findMany({
      where: {
        seasonId,
        type: "RANKING_UPDATED",
        aggregateType: "Season",
      },
      orderBy: { occurredAt: "desc" },
      take: 20,
      select: {
        id: true,
        occurredAt: true,
        payload: true,
      },
    });

    return (events as Array<{ id: string; occurredAt: Date; payload: unknown }>)
      .filter((event: { id: string; occurredAt: Date; payload: unknown }) => isRankingPayload(event.payload))
      .map((event: { id: string; occurredAt: Date; payload: unknown }) => {
        const payload = event.payload as RankingEventPayload;
        const rows = Array.isArray(payload.rows) ? payload.rows : Array.isArray(payload.contestants) ? payload.contestants : [];

        return {
          id: event.id,
          occurredAt: event.occurredAt,
          rowCount: rows.length,
          generatedAt: payload.generatedAt,
        };
      });
  }
}
