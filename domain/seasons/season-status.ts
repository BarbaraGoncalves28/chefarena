import type { SeasonStatus as PrismaSeasonStatus } from "@prisma/client";

export type SeasonLifecycleStatus = "UPCOMING" | "ACTIVE" | "FINISHED";

export function toDomainSeasonStatus(status: PrismaSeasonStatus): SeasonLifecycleStatus {
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "COMPLETED" || status === "ARCHIVED") return "FINISHED";
  return "UPCOMING";
}

export function toPrismaSeasonStatus(status: SeasonLifecycleStatus): PrismaSeasonStatus {
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "FINISHED") return "COMPLETED";
  return "DRAFT";
}

export function getSeasonStatusTone(status: SeasonLifecycleStatus) {
  const tones: Record<SeasonLifecycleStatus, string> = {
    UPCOMING: "bg-zinc-100 text-zinc-700",
    ACTIVE: "bg-emerald-50 text-emerald-700",
    FINISHED: "bg-slate-100 text-slate-700",
  };

  return tones[status];
}
