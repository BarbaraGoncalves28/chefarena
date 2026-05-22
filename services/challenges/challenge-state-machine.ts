import type { ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";

export class ChallengeStateMachine {
  static canTransition(from: ChallengeLifecycleStatus, to: ChallengeLifecycleStatus) {
    const transitions: Record<ChallengeLifecycleStatus, ChallengeLifecycleStatus[]> = {
      PENDING: ["ACTIVE"],
      ACTIVE: ["SCORING"],
      SCORING: ["FINISHED"],
      FINISHED: [],
    };

    return transitions[from].includes(to);
  }

  static assertTransition(from: ChallengeLifecycleStatus, to: ChallengeLifecycleStatus) {
    if (!ChallengeStateMachine.canTransition(from, to)) {
      throw new Error(`Invalid challenge transition from ${from} to ${to}.`);
    }
  }

  static nextOnStart(status: ChallengeLifecycleStatus) {
    ChallengeStateMachine.assertTransition(status, "ACTIVE");
    return "ACTIVE" as const;
  }

  static nextOnOpenScoring(status: ChallengeLifecycleStatus) {
    ChallengeStateMachine.assertTransition(status, "SCORING");
    return "SCORING" as const;
  }

  static nextOnFinish(status: ChallengeLifecycleStatus) {
    ChallengeStateMachine.assertTransition(status, "FINISHED");
    return "FINISHED" as const;
  }
}
