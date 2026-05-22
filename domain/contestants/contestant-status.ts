import type { ContestantStatus } from "@prisma/client";

export function getContestantStatusTone(status: ContestantStatus) {
  const tones: Record<ContestantStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    ELIMINATED: "bg-red-50 text-red-700",
    WITHDRAWN: "bg-zinc-100 text-zinc-700",
  };

  return tones[status];
}
