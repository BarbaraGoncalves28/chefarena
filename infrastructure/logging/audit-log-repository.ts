import { prisma } from "@/lib/prisma";

export class AuditLogRepository {
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
