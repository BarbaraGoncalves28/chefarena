export type ChallengeLifecycleStatus = "PENDING" | "ACTIVE" | "SCORING" | "FINISHED";

export function toDomainChallengeStatus(status: string): ChallengeLifecycleStatus {
  if (status === "IN_PROGRESS") return "ACTIVE";
  if (status === "JUDGING") return "SCORING";
  if (status === "COMPLETED" || status === "ARCHIVED") return "FINISHED";
  return "PENDING";
}

export function toPersistenceChallengeStatus(status: ChallengeLifecycleStatus) {
  const statuses: Record<ChallengeLifecycleStatus, string> = {
    PENDING: "OPEN",
    ACTIVE: "IN_PROGRESS",
    SCORING: "JUDGING",
    FINISHED: "COMPLETED",
  };

  return statuses[status];
}

export function getChallengeStatusTone(status: ChallengeLifecycleStatus) {
  const tones: Record<ChallengeLifecycleStatus, string> = {
    PENDING: "bg-zinc-100 text-zinc-700",
    ACTIVE: "bg-emerald-50 text-emerald-700",
    SCORING: "bg-amber-50 text-amber-700",
    FINISHED: "bg-slate-100 text-slate-700",
  };

  return tones[status];
}
