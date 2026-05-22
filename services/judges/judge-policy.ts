export class JudgePolicy {
  static assertCanManage() {
    return true;
  }

  static assertCanScoreAssignedSeason(isAssigned: boolean) {
    if (!isAssigned) {
      throw new Error("Judge can only score challenges from assigned seasons.");
    }
  }
}
