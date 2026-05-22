import type { SeasonLifecycleStatus } from "@/domain/seasons/season-status";

export type SeasonPolicyInput = {
  status: SeasonLifecycleStatus;
  hasActiveSeason: boolean;
  activeSeasonId?: string;
  seasonId?: string;
};

export class SeasonPolicy {
  static assertCanCreate() {
    return true;
  }

  static assertCanEdit(status: SeasonLifecycleStatus) {
    if (status === "FINISHED") {
      throw new Error("Finished seasons are locked and cannot be edited.");
    }
  }

  static assertCanStart(input: SeasonPolicyInput) {
    if (input.status === "FINISHED") {
      throw new Error("Finished seasons cannot be restarted.");
    }

    if (input.status === "ACTIVE") {
      throw new Error("Season is already active.");
    }

    if (input.hasActiveSeason && input.activeSeasonId !== input.seasonId) {
      throw new Error("Only one season can be ACTIVE at a time.");
    }
  }

  static assertCanFinish(status: SeasonLifecycleStatus) {
    if (status !== "ACTIVE") {
      throw new Error("Only an ACTIVE season can be finished.");
    }
  }

  static assertSeasonIsUnlocked(status: SeasonLifecycleStatus) {
    if (status === "FINISHED") {
      throw new Error("Season data is locked because the season is finished.");
    }
  }
}
