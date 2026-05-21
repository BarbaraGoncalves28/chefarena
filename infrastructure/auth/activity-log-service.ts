import { prisma } from "@/lib/prisma";
import type { ActorType, Prisma } from "@prisma/client";

export async function createActivityLog(params: {
  userId?: string | null;
  actorType: ActorType;
  action: string;
  details?: Prisma.InputJsonValue | null;
  entityName?: string;
  entityId?: string | null;
}) {
  const { userId, actorType, action, details, entityName, entityId } = params;
  return prisma.activityLog.create({
    data: {
      user: userId ? { connect: { id: userId } } : undefined,
      actorType,
      action,
      details: details ?? undefined,
      entityName: entityName ?? "auth",
      entityId: entityId ?? userId ?? null,
    },
  });
}
