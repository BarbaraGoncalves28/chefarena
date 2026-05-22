import type { ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";

export class ScoringPolicy {
  static assertCanSubmit(challengeStatus: ChallengeLifecycleStatus) {
    if (challengeStatus !== "SCORING") {
      throw new Error("Scores can only be submitted during the SCORING phase.");
    }
  }

  static assertCanUpdate(challengeStatus: ChallengeLifecycleStatus) {
    if (challengeStatus === "FINISHED") {
      throw new Error("Scores are immutable after the challenge ends.");
    }
  }
}
