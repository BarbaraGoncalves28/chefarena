import type { SeasonLifecycleStatus } from "@/domain/seasons/season-status";

export class ContestantPolicy {
  static assertCanCreate() {
    return true;
  }

  static assertCanEdit() {
    return true;
  }

  static assertCanAssignToSeason(status: SeasonLifecycleStatus) {
    if (status === "FINISHED") {
      throw new Error("Contestants cannot be assigned to a finished season.");
    }
  }
}
