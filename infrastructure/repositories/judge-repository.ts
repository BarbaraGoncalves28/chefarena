import { prisma } from "@/lib/prisma";
import { toDomainSeasonStatus } from "@/domain/seasons/season-status";

type AssignmentPayload = {
  action?: string;
  judgeIds?: string[];
};

function hasJudgeAssignmentPayload(payload: unknown, judgeId?: string) {
  if (!payload || typeof payload !== "object") return false;
  const assignmentPayload = payload as AssignmentPayload;
  if (assignmentPayload.action !== "season.judges.assigned") return false;
  if (!judgeId) return true;
  return Array.isArray(assignmentPayload.judgeIds) && assignmentPayload.judgeIds.includes(judgeId);
}

export class JudgeRepository {
  async listJudges() {
    const [judges, assignmentEvents] = await Promise.all([
      prisma.judge.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          expertise: true,
          scores: {
            where: { deletedAt: null },
            select: { value: true, category: true },
          },
          _count: { select: { scores: true } },
        },
      }),
      prisma.event.findMany({
        where: {
          aggregateType: "Season",
          type: "AUDIT_LOG_CREATED",
        },
        select: {
          aggregateId: true,
          payload: true,
        },
      }),
    ]);

    return judges.map((judge) => ({
      ...judge,
      assignedSeasonCount: new Set(assignmentEvents.filter((event) => hasJudgeAssignmentPayload(event.payload, judge.id)).map((event) => event.aggregateId)).size,
    }));
  }

  async listAssignableSeasons() {
    const seasons = await prisma.season.findMany({
      where: { deletedAt: null, status: { notIn: ["COMPLETED", "ARCHIVED"] } },
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      select: { id: true, name: true, status: true },
    });

    return seasons.map((season) => ({
      ...season,
      lifecycleStatus: toDomainSeasonStatus(season.status),
    }));
  }

  async getJudgeProfile(id: string) {
    const [judge, assignmentEvents] = await Promise.all([
      prisma.judge.findFirst({
        where: { id, deletedAt: null },
        select: {
          id: true,
          name: true,
          expertise: true,
          scores: {
            where: { deletedAt: null },
            orderBy: { recordedAt: "desc" },
            select: {
              id: true,
              value: true,
              category: true,
              comments: true,
              recordedAt: true,
              contestant: { select: { id: true, name: true } },
              challenge: {
                select: {
                  id: true,
                  title: true,
                  episode: {
                    select: {
                      title: true,
                      sequence: true,
                      season: { select: { id: true, name: true, status: true } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.event.findMany({
        where: {
          aggregateType: "Season",
          type: "AUDIT_LOG_CREATED",
        },
        select: {
          aggregateId: true,
          payload: true,
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
      }),
    ]);

    if (!judge) return null;

    const assignedSeasonMap = new Map(
      assignmentEvents
      .filter((event) => hasJudgeAssignmentPayload(event.payload, id) && event.season)
      .map((event) => ({
        ...event.season!,
        lifecycleStatus: toDomainSeasonStatus(event.season!.status),
      }))
      .map((season) => [season.id, season]),
    );

    return { ...judge, assignedSeasons: Array.from(assignedSeasonMap.values()) };
  }

  async getJudgeForEdit(id: string) {
    return prisma.judge.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, expertise: true },
    });
  }

  async createJudge(data: { name: string; expertise?: string | null }) {
    return prisma.judge.create({
      data: {
        name: data.name,
        expertise: data.expertise,
      },
    });
  }

  async updateJudge(id: string, data: { name: string; expertise?: string | null }) {
    return prisma.judge.update({
      where: { id },
      data,
    });
  }

  async softDeleteJudge(id: string) {
    return prisma.judge.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async assignToSeason(data: { judgeId: string; seasonId: string; actorId: string }) {
    return prisma.event.create({
      data: {
        type: "AUDIT_LOG_CREATED",
        aggregateId: data.seasonId,
        aggregateType: "Season",
        seasonId: data.seasonId,
        actorId: data.actorId,
        actorType: "USER",
        payload: {
          action: "season.judges.assigned",
          judgeIds: [data.judgeId],
        },
      },
    });
  }

  async isJudgeAssignedToSeason(judgeId: string, seasonId: string) {
    const events = await prisma.event.findMany({
      where: {
        aggregateId: seasonId,
        aggregateType: "Season",
        type: "AUDIT_LOG_CREATED",
      },
      select: { payload: true },
    });

    return events.some((event) => hasJudgeAssignmentPayload(event.payload, judgeId));
  }
}
