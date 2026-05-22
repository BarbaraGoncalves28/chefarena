import type { ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";
import { finishChallengeAction, openChallengeScoringAction, startChallengeAction } from "@/app/actions/challenges";

export function ChallengeLifecycleControls({ challengeId, status }: { challengeId: string; status: ChallengeLifecycleStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" ? (
        <form action={startChallengeAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <button type="submit" className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
            Start
          </button>
        </form>
      ) : null}

      {status === "ACTIVE" ? (
        <form action={openChallengeScoringAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <button type="submit" className="inline-flex h-10 items-center rounded-md bg-amber-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400">
            Open scoring
          </button>
        </form>
      ) : null}

      {status === "SCORING" ? (
        <form action={finishChallengeAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <button type="submit" className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Finish
          </button>
        </form>
      ) : null}
    </div>
  );
}
