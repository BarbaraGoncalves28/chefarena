import { prisma } from "@/lib/prisma";
import type { EventType, Prisma } from "@prisma/client";

export type EventPayload = {
  type: EventType;
  aggregateId: string;
  aggregateType: string;
  payload: Prisma.InputJsonValue;
  actorId?: string;
  actorType?: string;
  metadata?: Prisma.InputJsonValue | null;
};

export class EventBus {
  async publish(event: EventPayload) {
    return prisma.event.create({ data: event });
  }
}
