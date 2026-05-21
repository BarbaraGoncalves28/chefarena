import type { ChallengeType } from "@prisma/client";

export type ChallengeLifecycleState = "DRAFT" | "OPEN" | "IN_PROGRESS" | "JUDGING" | "COMPLETED" | "ARCHIVED";

export type TeamScoringMode = "average" | "sum" | "highest";

export class ChallengeService {
  static canStart(state: ChallengeLifecycleState) {
    return state === "OPEN";
  }

  static canFinish(state: ChallengeLifecycleState) {
    return state === "IN_PROGRESS" || state === "JUDGING";
  }

  static nextStateOnStart(state: ChallengeLifecycleState) {
    if (!ChallengeService.canStart(state)) {
      throw new Error(`Challenge cannot start from state ${state}`);
    }
    return "IN_PROGRESS";
  }

  static nextStateOnFinish(state: ChallengeLifecycleState) {
    if (!ChallengeService.canFinish(state)) {
      throw new Error(`Challenge cannot finish from state ${state}`);
    }
    return "COMPLETED";
  }

  static requiresTeamScoring(type: ChallengeType) {
    return type === "TEAM" || type === "SERVICE";
  }

  static validateTeamChallenge(type: ChallengeType, participants: number) {
    if (ChallengeService.requiresTeamScoring(type) && participants < 2) {
      throw new Error(`Challenge type ${type} requires at least 2 team members`);
    }
  }

  static computeAggregateScore(
    teamMode: TeamScoringMode,
    memberScores: number[],
  ) {
    if (memberScores.length === 0) {
      return 0;
    }

    switch (teamMode) {
      case "sum":
        return memberScores.reduce((acc, next) => acc + next, 0);
      case "highest":
        return Math.max(...memberScores);
      case "average":
      default:
        return Number((memberScores.reduce((acc, next) => acc + next, 0) / memberScores.length).toFixed(2));
    }
  }
}
