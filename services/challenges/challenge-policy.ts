import type { ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";
import type { GameplayChallengeType } from "@/domain/challenges/challenge-type";

export class ChallengePolicy {
  static assertCanCreate() {
    return true;
  }

  static assertCanModify(status: ChallengeLifecycleStatus) {
    if (status === "FINISHED") {
      throw new Error("Finished challenges are locked and cannot be modified.");
    }
  }

  static assertCanScore(status: ChallengeLifecycleStatus) {
    if (status !== "SCORING") {
      throw new Error("Scores can only be recorded during the SCORING phase.");
    }
  }

  static assertContestantAssignmentAllowed(status: ChallengeLifecycleStatus) {
    ChallengePolicy.assertCanModify(status);
    if (status === "SCORING") {
      throw new Error("Contestants cannot be assigned after scoring has opened.");
    }
  }

  static assertTeamAssignmentAllowed(status: ChallengeLifecycleStatus, type: GameplayChallengeType) {
    ChallengePolicy.assertCanModify(status);
    if (type !== "TEAM") {
      throw new Error("Teams can only be assigned to TEAM challenges.");
    }
  }
}
