import type { ChallengeLifecycleStatus } from "@/domain/challenges/challenge-lifecycle";
import type { DishSubmissionStatus } from "@/domain/dishes/dish-metadata";

export class DishPolicy {
  static assertCanCreate(challengeStatus: ChallengeLifecycleStatus) {
    if (challengeStatus === "SCORING" || challengeStatus === "FINISHED") {
      throw new Error("Dishes cannot be created after scoring starts.");
    }
  }

  static assertCanEdit(challengeStatus: ChallengeLifecycleStatus, dishStatus: DishSubmissionStatus) {
    if (challengeStatus === "SCORING" || challengeStatus === "FINISHED") {
      throw new Error("Dishes cannot be edited after scoring starts.");
    }

    if (dishStatus === "SUBMITTED") {
      throw new Error("Submitted dishes are locked for evaluation.");
    }
  }

  static assertCanAssignIngredients(challengeStatus: ChallengeLifecycleStatus, dishStatus: DishSubmissionStatus) {
    DishPolicy.assertCanEdit(challengeStatus, dishStatus);
  }

  static assertCanSubmit(challengeStatus: ChallengeLifecycleStatus, dishStatus: DishSubmissionStatus) {
    if (dishStatus === "SUBMITTED") {
      throw new Error("Dish has already been submitted.");
    }

    if (challengeStatus === "PENDING") {
      throw new Error("Dish cannot be submitted before the challenge starts.");
    }

    if (challengeStatus === "SCORING" || challengeStatus === "FINISHED") {
      throw new Error("Dish cannot be submitted after scoring starts.");
    }
  }

  static assertScoresImmutable() {
    return true;
  }
}
