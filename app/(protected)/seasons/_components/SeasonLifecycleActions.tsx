import Link from "next/link";
import { finishSeasonAction, startSeasonAction } from "@/app/actions/seasons";
import type { SeasonLifecycleStatus } from "@/domain/seasons/season-status";

type SeasonLifecycleActionsProps = {
  seasonId: string;
  status: SeasonLifecycleStatus;
  canManage: boolean;
};

export function SeasonLifecycleActions({ seasonId, status, canManage }: SeasonLifecycleActionsProps) {
  if (!canManage) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "FINISHED" ? (
        <Link href={`/seasons/${seasonId}/edit`} className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100">
          Edit
        </Link>
      ) : null}

      {status === "UPCOMING" ? (
        <form action={startSeasonAction}>
          <input type="hidden" name="seasonId" value={seasonId} />
          <button type="submit" className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
            Start season
          </button>
        </form>
      ) : null}

      {status === "ACTIVE" ? (
        <form action={finishSeasonAction}>
          <input type="hidden" name="seasonId" value={seasonId} />
          <button type="submit" className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Finish season
          </button>
        </form>
      ) : null}
    </div>
  );
}
